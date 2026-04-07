// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  css: ['~/assets/css/typography.css'],

  runtimeConfig: {
    /** Минимум 32 символа; в продакшене задайте NUXT_AUTH_SECRET */
    authSecret:
      process.env.NUXT_AUTH_SECRET
      ?? 'local-dev-only-secret-min-32-chars-replace-me!!',
    public: {
      /**
       * Задаётся через .env: NUXT_PUBLIC_GOOGLE_MAPS_API_KEY=...
       * Не подставляйте process.env здесь — Nuxt сам мержит NUXT_PUBLIC_* в клиент и SSR.
       */
      googleMapsApiKey: '',
    },
  },

  app: {
    head: {
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: '',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
        },
      ],
    },
  },
  modules: [
    '@nuxt/content',
  ],
  devtools: { enabled: true },
  compatibilityDate: '2024-04-03',

  nitro: {
    /** Нативный better-sqlite3 не бандлить в серверный чанк. */
    rollupConfig: {
      external: ['better-sqlite3', '@prisma/adapter-better-sqlite3'],
    },
  },

  /** На Windows нативный watcher иногда рвёт IPC у Vite → «IPC connection closed». */
  ...(process.platform === 'win32'
    ? {
        vite: {
          server: {
            watch: { usePolling: true, interval: 300 },
          },
        },
      }
    : {}),
})
