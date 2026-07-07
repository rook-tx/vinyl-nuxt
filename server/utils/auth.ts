import { createHmac, timingSafeEqual } from 'node:crypto'
import { createError, deleteCookie, getCookie, setCookie } from 'h3'
import type { H3Event } from 'h3'

const SESSION_COOKIE_NAME = 'collection_session'

type SessionPayload = {
  sub: 'local-admin'
  iat: number
  exp: number
  v: 1
}

type LocalAuthConfig = {
  enabled: boolean
  password: string
  secret: string
  sessionTtlSec: number
}

function getLocalAuthConfig(event: H3Event): LocalAuthConfig {
  const runtimeConfig = useRuntimeConfig(event)

  return {
    enabled: Boolean(runtimeConfig.auth.enabled),
    password: String(runtimeConfig.auth.password || ''),
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

function createSessionToken(secret: string, sessionTtlSec: number): string {
  const now = Math.floor(Date.now() / 1000)
  const payload: SessionPayload = {
    sub: 'local-admin',
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

    if (parsed.sub !== 'local-admin' || parsed.v !== 1 || parsed.exp <= now) {
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

  if (!config.password || !config.secret) {
    throw createError({
      statusCode: 500,
      statusMessage:
        'Local auth is enabled but missing AUTH_PASSWORD or AUTH_SECRET',
    })
  }
}

export function getLocalAuthState(event: H3Event) {
  const config = getLocalAuthConfig(event)
  const configured =
    !config.enabled || Boolean(config.password && config.secret)

  if (!config.enabled) {
    return {
      enabled: false,
      configured,
      authenticated: true,
    }
  }

  if (!configured) {
    return {
      enabled: true,
      configured: false,
      authenticated: false,
    }
  }

  const token = getCookie(event, SESSION_COOKIE_NAME)
  const session = token ? readSessionToken(token, config.secret) : null

  return {
    enabled: true,
    configured: true,
    authenticated: Boolean(session),
  }
}

export function verifyLocalPassword(event: H3Event, password: string): boolean {
  assertAuthIsConfigured(event)
  const config = getLocalAuthConfig(event)

  return safeEqual(password, config.password)
}

export function createLocalSession(event: H3Event) {
  assertAuthIsConfigured(event)
  const config = getLocalAuthConfig(event)
  const token = createSessionToken(config.secret, config.sessionTtlSec)

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
    return
  }

  if (!state.configured) {
    throw createError({
      statusCode: 500,
      statusMessage:
        'Local auth is enabled but missing AUTH_PASSWORD or AUTH_SECRET',
    })
  }

  if (!state.authenticated) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required',
    })
  }
}
