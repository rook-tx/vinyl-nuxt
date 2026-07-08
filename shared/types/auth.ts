export type AuthUser = {
  id: string
  email: string
  displayName: string | null
}

export type AuthSession = {
  enabled: boolean
  configured: boolean
  authenticated: boolean
  user: AuthUser | null
}
