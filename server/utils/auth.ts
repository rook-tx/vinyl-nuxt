import {
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from 'node:crypto'
import { createError, deleteCookie, getCookie, setCookie } from 'h3'
import type { H3Event } from 'h3'

const SESSION_COOKIE_NAME = 'collection_session'
const SCRYPT_KEY_LENGTH = 64

const PASSWORD_HASH_PREFIX = 'scrypt'

type SessionPayload = {
  sub: string
  iat: number
  exp: number
  v: 1
}

type LocalAuthConfig = {
  enabled: boolean
  secret: string
  sessionTtlSec: number
}

function getLocalAuthConfig(event: H3Event): LocalAuthConfig {
  const runtimeConfig = useRuntimeConfig(event)

  return {
    enabled: Boolean(runtimeConfig.auth.enabled),
    secret: String(runtimeConfig.auth.secret || ''),
    sessionTtlSec: Number(runtimeConfig.auth.sessionTtlSec || 86400),
  }
}

function encodeBase64Url(value: string): string {
  return Buffer.from(value, 'utf8').toString('base64url')
}

function decodeBase64Url(value: string): string {
  return Buffer.from(value, 'base64url').toString('utf8')
}

function signValue(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('base64url')
}

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)

  if (leftBuffer.length !== rightBuffer.length) {
    return false
  }

  return timingSafeEqual(leftBuffer, rightBuffer)
}

function createSessionToken(
  secret: string,
  sessionTtlSec: number,
  userId: string
): string {
  const now = Math.floor(Date.now() / 1000)
  const payload: SessionPayload = {
    sub: userId,
    iat: now,
    exp: now + sessionTtlSec,
    v: 1,
  }

  const encodedPayload = encodeBase64Url(JSON.stringify(payload))
  const signature = signValue(encodedPayload, secret)

  return `${encodedPayload}.${signature}`
}

function readSessionToken(
  token: string,
  secret: string
): SessionPayload | null {
  const [encodedPayload, signature] = token.split('.')

  if (!encodedPayload || !signature) {
    return null
  }

  const expectedSignature = signValue(encodedPayload, secret)
  if (!safeEqual(signature, expectedSignature)) {
    return null
  }

  try {
    const parsed = JSON.parse(decodeBase64Url(encodedPayload)) as SessionPayload
    const now = Math.floor(Date.now() / 1000)

    if (
      typeof parsed.sub !== 'string' ||
      parsed.sub.length === 0 ||
      parsed.v !== 1 ||
      parsed.exp <= now
    ) {
      return null
    }

    return parsed
  } catch {
    return null
  }
}

function assertAuthIsConfigured(event: H3Event) {
  const config = getLocalAuthConfig(event)

  if (!config.enabled) {
    return
  }

  if (!config.secret) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Local auth is enabled but missing AUTH_SECRET',
    })
  }
}

function splitPasswordHash(value: string): [string, string, string] | null {
  const [scheme, salt, hash] = value.split('$')

  if (!scheme || !salt || !hash) {
    return null
  }

  return [scheme, salt, hash]
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, SCRYPT_KEY_LENGTH).toString('hex')
  return `${PASSWORD_HASH_PREFIX}$${salt}$${hash}`
}

export function verifyPassword(password: string, encodedHash: string): boolean {
  const parts = splitPasswordHash(encodedHash)
  if (!parts) {
    return false
  }

  const [scheme, salt, hash] = parts
  if (scheme !== PASSWORD_HASH_PREFIX) {
    return false
  }

  const expected = Buffer.from(hash, 'hex')
  const actual = Buffer.from(
    scryptSync(password, salt, SCRYPT_KEY_LENGTH).toString('hex'),
    'hex'
  )

  if (expected.length !== actual.length) {
    return false
  }

  return timingSafeEqual(expected, actual)
}

export function getLocalAuthState(event: H3Event) {
  const config = getLocalAuthConfig(event)
  const configured = !config.enabled || Boolean(config.secret)

  if (!config.enabled) {
    return {
      enabled: false,
      configured,
      authenticated: false,
      userId: null,
    }
  }

  if (!configured) {
    return {
      enabled: true,
      configured: false,
      authenticated: false,
      userId: null,
    }
  }

  const token = getCookie(event, SESSION_COOKIE_NAME)
  const session = token ? readSessionToken(token, config.secret) : null

  return {
    enabled: true,
    configured: true,
    authenticated: Boolean(session),
    userId: session?.sub ?? null,
  }
}

export function createLocalSession(event: H3Event, userId: string) {
  assertAuthIsConfigured(event)
  const config = getLocalAuthConfig(event)
  const token = createSessionToken(config.secret, config.sessionTtlSec, userId)

  setCookie(event, SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: config.sessionTtlSec,
  })
}

export function clearLocalSession(event: H3Event) {
  deleteCookie(event, SESSION_COOKIE_NAME, {
    path: '/',
  })
}

export function requireLocalAuth(event: H3Event) {
  const state = getLocalAuthState(event)

  if (!state.enabled) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Authentication is disabled',
    })
  }

  if (!state.configured) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Local auth is enabled but missing AUTH_SECRET',
    })
  }

  if (!state.authenticated || !state.userId) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required',
    })
  }

  return {
    userId: state.userId,
  }
}

export function getOptionalUserId(event: H3Event): string | null {
  const state = getLocalAuthState(event)
  return state.authenticated ? state.userId : null
}
