import { getLocalAuthState } from '~~/server/utils/auth'
import { db } from '~~/server/utils/db'

export default defineEventHandler(async (event) => {
  const state = getLocalAuthState(event)

  if (!state.authenticated || !state.userId) {
    return {
      ...state,
      user: null,
    }
  }

  const user = await db.user.findUnique({
    where: { id: state.userId },
    select: {
      id: true,
      email: true,
      displayName: true,
    },
  })

  if (!user) {
    return {
      ...state,
      authenticated: false,
      userId: null,
      user: null,
    }
  }

  return {
    enabled: state.enabled,
    configured: state.configured,
    authenticated: true,
    user,
  }
})
