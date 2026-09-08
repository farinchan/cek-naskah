// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui'
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    appwriteApiKey: process.env.APPWRITE_API_KEY || '',
    public: {
      appwriteEndpoint: process.env.APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1',
      appwriteProjectId: process.env.APPWRITE_PROJECT_ID || '6a9e987200268817ec4c',
      appwriteDatabaseId: process.env.APPWRITE_DATABASE_ID || '6a9f5bfb00026954d579',
      appwriteTableSettings: process.env.APPWRITE_TABLE_SETTINGS || 'settings'
    }
  },

  routeRules: {
    '/': { prerender: true }
  },

  compatibilityDate: '2026-06-30',

  vite: {
    envPrefix: ['VITE_', 'APPWRITE_']
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
