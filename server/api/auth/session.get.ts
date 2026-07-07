import { getLocalAuthState } from '~~/server/utils/auth'

export default defineEventHandler((event) => {
  return getLocalAuthState(event)
})
