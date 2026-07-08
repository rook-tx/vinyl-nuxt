import { createError } from 'h3'
import {
  createLocalSession,
  getLocalAuthState,
  verifyPassword,
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
  }
  const email = typeof body.email === 'string' ? body.email.trim() : ''
  const password = typeof body.password === 'string' ? body.password : ''

  if (!email || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email and password are required',
    })
  }

  const user = await db.user.findUnique({
    where: { email: email.toLowerCase() },
    select: {
      id: true,
      email: true,
      displayName: true,
      passwordHash: true,
    },
  })

  if (!user || !verifyPassword(password, user.passwordHash)) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid credentials',
    })
  }

  createLocalSession(event, user.id)

  return {
    enabled: true,
    configured: true,
    authenticated: true,
    user: {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
    },
  }
})
