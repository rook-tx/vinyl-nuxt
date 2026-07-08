import type { AuthSession } from '~~/shared/types/auth'

export default defineNuxtRouteMiddleware(async (to) => {
  const session = await $fetch<AuthSession>('/api/auth/session').catch(
    () => null
  )

  if (!session || !session.enabled || session.authenticated) {
    return
  }

  return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
})
