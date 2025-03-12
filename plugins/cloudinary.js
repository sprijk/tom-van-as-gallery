// plugins/cloudinary.js
// Import cloudinary only on the server, not in the browser
import { v2 as cloudinary } from 'cloudinary';

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();

  // Cloudinary configuration for server-side use
  if (import.meta.server) {
    cloudinary.config({
      cloud_name: config.cloudinaryCloudName,
      api_key: config.cloudinaryApiKey,
      api_secret: config.cloudinaryApiSecret,
    });
  }

  // Client-side configuration for preview URLs
  const generatePreviewUrl = (publicId, options = {}) => {
    const { width = 300, height = 300, crop = 'fill', quality = 'auto' } = options;

    return `https://res.cloudinary.com/${config.public.cloudinaryCloudName}/image/upload/c_${crop},w_${width},h_${height},q_${quality}/${publicId}`;
  };

  return {
    provide: {
      cloudinary: {
        // Only available on server-side
        instance: import.meta.server ? cloudinary : null,
        generatePreviewUrl, // Available on client-side
        cloudName: config.public.cloudinaryCloudName,
      },
    },
  };
});
