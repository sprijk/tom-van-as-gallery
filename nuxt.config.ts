// https://nuxt.com/docs/api/configuration/nuxt-config
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
    cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || 'dgvqkqvv1',
    cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || '',
    cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || '',
    adminPassword: process.env.ADMIN_PASSWORD || 'admin123', // Default password for development

    // Google Sheets API configuration
    googleServiceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '',
    googlePrivateKey: process.env.GOOGLE_PRIVATE_KEY || '',
    googleSheetId: process.env.GOOGLE_SHEET_ID || '',

    // Client-side variables
    public: {
      cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || 'dgvqkqvv1',
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
    cloudinary: {
      baseURL: `https://res.cloudinary.com/dgvqkqvv1/image/upload/`,
    },
  },

  plausible: {
    domain: 'tomvanas-kunst.nl',
    autoPageviews: true,
  },
});
