// plugins/cloudinary.js
// Import cloudinary alleen op de server, niet in de browser
let cloudinary;
if (import.meta.server) {
  const { v2 } = require('cloudinary');
  cloudinary = v2;
}

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();

  // Cloudinary configureren voor server-side gebruik
  if (import.meta.server && cloudinary) {
    cloudinary.config({
      cloud_name: config.cloudinaryCloudName,
      api_key: config.cloudinaryApiKey,
      api_secret: config.cloudinaryApiSecret,
    });
  }

  // Client-side configuratie voor preview URLs
  const generatePreviewUrl = (publicId, options = {}) => {
    const { width = 300, height = 300, crop = 'fill', quality = 'auto' } = options;

    return `https://res.cloudinary.com/${config.public.cloudinaryCloudName}/image/upload/c_${crop},w_${width},h_${height},q_${quality}/${publicId}`;
  };

  return {
    provide: {
      cloudinary: {
        // Alleen beschikbaar op server-side
        instance: import.meta.server ? cloudinary : null,
        generatePreviewUrl, // Beschikbaar op client-side
        cloudName: config.public.cloudinaryCloudName,
      },
    },
  };
});
