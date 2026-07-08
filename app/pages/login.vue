<script setup lang="ts">
import type { AuthSession } from '~~/shared/types/auth'

const route = useRoute()
const redirect = computed(() => {
  const candidate = route.query.redirect
  return typeof candidate === 'string' && candidate.startsWith('/')
    ? candidate
    : '/'
})

const pending = ref(false)
const errorMessage = ref('')

const { data: session, refresh } = await useAsyncData<AuthSession>(
  'auth-session',
  () => $fetch('/api/auth/session')
)

if (session.value?.enabled && session.value?.authenticated) {
  await navigateTo(redirect.value)
}

async function login(payload: SubmitEvent) {
  const form = payload.target as HTMLFormElement
  const formData = new FormData(form)
  const email = formData.get('email')
  const password = formData.get('password')

  if (typeof email !== 'string' || !email.length) {
    errorMessage.value = 'Email is required.'
    return
  }

  if (typeof password !== 'string' || !password.length) {
    errorMessage.value = 'Password is required.'
    return
  }

  pending.value = true
  errorMessage.value = ''

  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: {
        email,
        password,
      },
    })

    await refresh()
    await navigateTo(redirect.value)
  } catch (error: unknown) {
    const statusCode =
      typeof error === 'object' &&
      error !== null &&
      'statusCode' in error &&
      typeof (error as { statusCode?: unknown }).statusCode === 'number'
        ? (error as { statusCode: number }).statusCode
        : null

    if (statusCode === 401) {
      errorMessage.value = 'Invalid email or password.'
    } else if (statusCode === 500) {
      errorMessage.value =
        'Auth is enabled but not configured. Set AUTH_SECRET.'
    } else {
      errorMessage.value = 'Unable to sign in. Please try again.'
    }
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <main class="page login-page">
    <div class="content">
      <h1>Sign in</h1>
      <p v-if="session && !session.enabled" class="auth-state">
        Auth is disabled.
      </p>
      <p v-else-if="session && !session.configured" class="auth-state">
        Auth is enabled but not configured.
      </p>

      <form v-if="session?.enabled" class="record-form" @submit.prevent="login">
        <div class="form-detail">
          <input
            type="email"
            name="email"
            placeholder="Email"
            class="input"
            autocomplete="email"
            required
          />
          <label for="email" class="label">Email</label>
        </div>

        <div class="form-detail">
          <input
            type="password"
            name="password"
            placeholder="Password"
            class="input"
            autocomplete="current-password"
            required
          />
          <label for="password" class="label">Password</label>
        </div>

        <button type="submit" class="button" :disabled="pending">
          {{ pending ? 'Signing in...' : 'Sign in' }}
        </button>
      </form>

      <div v-if="errorMessage" class="auth-error">{{ errorMessage }}</div>
    </div>
  </main>
</template>

<style lang="stylus">
.login-page {
  .auth-state,
  .auth-error {
    margin-top 1rem
  }
}
</style>
