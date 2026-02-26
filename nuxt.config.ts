import { apiEndpoint, repositoryName } from './slicemachine.config.json'
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/image',
    '@nuxtjs/prismic',
    'vue3-carousel-nuxt',
    'nuxt-lucide-icons',
  ],

  prismic: {
    endpoint: apiEndpoint || repositoryName,
  },
})