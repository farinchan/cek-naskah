// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxtjs/robots',
    '@nuxtjs/sitemap',
    'nuxt-schema-org'
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  site: {
    url: process.env.NUXT_PUBLIC_SITE_URL || 'https://cek-naskah.web.id',
    name: 'Cek Naskah',
    description: 'Platform Cek Plagiasi & AI No. 1 di Indonesia: Turnitin & iThenticate resmi 100% No-Repository, AI Writer Detector akurat, unduh jurnal Scopus, dan parafrase manual akademik.',
    defaultLocale: 'id'
  },

  colorMode: {
    preference: 'light',
    fallback: 'light'
  },

  runtimeConfig: {
    appwriteApiKey: process.env.APPWRITE_API_KEY || '',
    sumopodApiKey: process.env.SUMOPOD_API_KEY || '',
    sumopodPayEndpoint: process.env.SUMOPOD_PAY_ENDPOINT || 'https://api-pay-sandbox.sumopod.com/api/v1/payments',
    sumopodWebhookSecret: process.env.SUMOPOD_WEBHOOK_SECRET || '',
    sumopodWebhookToken: process.env.SUMOPOD_WEBHOOK_TOKEN || '',
    public: {
      googleSiteVerification: process.env.GOOGLE_SITE_VERIFICATION || '',
      googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID || '',
      appwriteEndpoint: process.env.APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1',
      appwriteProjectId: process.env.APPWRITE_PROJECT_ID || '6a9e987200268817ec4c',
      appwriteDatabaseId: process.env.APPWRITE_DATABASE_ID || '6a9f5bfb00026954d579',
      appwriteTableSettings: process.env.APPWRITE_TABLE_SETTINGS || 'settings',
      appwriteTableServices: process.env.APPWRITE_TABLE_SERVICES || 'services'
    }
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
  },

  robots: {
    disallow: [
      '/admin',
      '/admin/**',
      '/api/**',
      '/profile'
    ],
    allow: [
      '/',
      '/charge',
      '/about-us',
      '/testimony',
      '/login',
      '/register'
    ]
  },

  sitemap: {
    exclude: [
      '/admin',
      '/admin/**',
      '/profile',
      '/auth',
      '/reset-password',
      '/forgot-password'
    ]
  }
})
