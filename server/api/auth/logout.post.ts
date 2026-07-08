import { clearLocalSession, getLocalAuthState } from '~~/server/utils/auth'

export default defineEventHandler((event) => {
  clearLocalSession(event)

  const state = getLocalAuthState(event)
  return {
    ...state,
    authenticated: state.enabled ? false : state.authenticated,
    user: null,
  }
})
