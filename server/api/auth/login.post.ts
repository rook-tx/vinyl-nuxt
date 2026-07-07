import { createError } from 'h3'
import {
  createLocalSession,
  getLocalAuthState,
  verifyLocalPassword,
} from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const state = getLocalAuthState(event)
  if (!state.enabled) {
    return state
  }

  if (!state.configured) {
    throw createError({
      statusCode: 500,
      statusMessage:
        'Local auth is enabled but missing AUTH_PASSWORD or AUTH_SECRET',
    })
  }

  const body = (await readBody(event).catch(() => ({}))) as {
    password?: string
  }
  const password = typeof body.password === 'string' ? body.password : ''

  if (!password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Password is required',
    })
  }

  if (!verifyLocalPassword(event, password)) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid password',
    })
  }

  createLocalSession(event)

  return {
    enabled: true,
    configured: true,
    authenticated: true,
  }
})
