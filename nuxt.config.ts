// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxtjs/tailwindcss', '@nuxt/image', '@nuxt/eslint'],
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
      ],
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
    },
  },
  css: ['~/assets/css/tailwind.css'],

  runtimeConfig: {
    // Server-side variables
    cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || 'default',
    cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || '',
    cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || '',
    adminPassword: process.env.ADMIN_PASSWORD || 'admin123', // Default password for development

    // Client-side variables
    public: {
      cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || 'default',
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
      baseURL: `https://res.cloudinary.com/${
        process.env.CLOUDINARY_CLOUD_NAME || 'default'
      }/image/upload/`,
    },
  },
});
