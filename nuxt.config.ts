// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxtjs/tailwindcss', '@nuxt/image', '@nuxtjs/plausible', '@nuxt/eslint'],

  plugins: ['~/plugins/og-meta.js'],
  devtools: { enabled: true },

  app: {
    head: {
      title: 'Tom van As - Kunstgalerie',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content:
            'Ontdek de schilderijen van kunstenaar Tom van As. Bekijk zijn collectie en vind uw favoriete kunstwerk.',
        },

        // Open Graph / Facebook
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: 'https://tomvanas-kunst.nl/' },
        { property: 'og:title', content: 'Tom van As - Kunstgalerie' },
        {
          property: 'og:description',
          content:
            'Ontdek de schilderijen van kunstenaar Tom van As. Bekijk zijn collectie en vind uw favoriete kunstwerk.',
        },
        {
          property: 'og:image',
          content: 'https://tomvanas-kunst.nl/images/og-image.jpg',
        },

        // Twitter
        { property: 'twitter:card', content: 'summary_large_image' },
        { property: 'twitter:url', content: 'https://tomvanas-kunst.nl/' },
        { property: 'twitter:title', content: 'Tom van As - Kunstgalerie' },
        {
          property: 'twitter:description',
          content:
            'Ontdek de schilderijen van kunstenaar Tom van As. Bekijk zijn collectie en vind uw favoriete kunstwerk.',
        },
        {
          property: 'twitter:image',
          content: 'https://tomvanas-kunst.nl/images/og-image.jpg',
        },
      ],
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
    },
  },
  css: ['~/assets/css/tailwind.css'],

  runtimeConfig: {
    // Server-side variables
    adminPassword: process.env.ADMIN_PASSWORD || 'admin123', // Default password for development

    // Database configuration
    dbPath: process.env.DB_PATH || './data/database.sqlite',

    // Imagor configuration
    imagorBaseUrl: process.env.IMAGOR_BASE_URL || 'http://localhost:8080',
    imageStorageUrl: process.env.IMAGE_STORAGE_URL || 'http://localhost:9000/images',

    // Google Sheets API configuration
    googleServiceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '',
    googlePrivateKey: process.env.GOOGLE_PRIVATE_KEY || '',
    googleSheetId: process.env.GOOGLE_SHEET_ID || '',

    // Client-side variables
    public: {
      imageStorageUrl: process.env.IMAGE_STORAGE_URL || 'http://minio.minio:9000/tomvanas-kunst',
      imagorBaseUrl: process.env.IMAGOR_BASE_URL || 'http://localhost:8000',
    },
  },

  compatibilityDate: '2025-03-10',

  eslint: {
    config: {
      stylistic: true,
      indent: 'tab',
      semi: true,
    },
  },

  image: {
    providers: {
      imagor: {
        provider: '~/providers/imagor-provider.js',
        options: {
          baseURL: process.env.IMAGOR_BASE_URL || 'http://localhost:8000',
          imageBaseURL: process.env.IMAGE_STORAGE_URL || 'http://minio.minio:9000/tomvanas-kunst',
          defaultFormat: 'webp',
          defaultQuality: 80,
        },
      },
    },
  },

  plausible: {
    domain: 'tomvanas-kunst.nl',
    autoPageviews: true,
  },
});
