import { createError } from 'h3'
import {
  createLocalSession,
  getLocalAuthState,
  hashPassword,
} from '~~/server/utils/auth'
import { db } from '~~/server/utils/db'

export default defineEventHandler(async (event) => {
  const state = getLocalAuthState(event)
  if (!state.enabled) {
    return state
  }

  if (!state.configured) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Local auth is enabled but missing AUTH_SECRET',
    })
  }

  const body = (await readBody(event).catch(() => ({}))) as {
    email?: string
    password?: string
    displayName?: string
  }

  const email =
    typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const password = typeof body.password === 'string' ? body.password : ''
  const displayName =
    typeof body.displayName === 'string' && body.displayName.trim().length > 0
      ? body.displayName.trim()
      : null

  if (!email || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email and password are required',
    })
  }

  if (!email.includes('@')) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email is invalid',
    })
  }

  if (password.length < 4) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Password must be at least 4 characters',
    })
  }

  const existing = await db.user.findUnique({
    where: { email },
    select: { id: true },
  })

  if (existing) {
    throw createError({
      statusCode: 409,
      statusMessage: 'An account with this email already exists',
    })
  }

  const user = await db.user.create({
    data: {
      email,
      passwordHash: hashPassword(password),
      displayName,
    },
    select: {
      id: true,
      email: true,
      displayName: true,
    },
  })

  createLocalSession(event, user.id)

  return {
    enabled: true,
    configured: true,
    authenticated: true,
    user,
  }
})
