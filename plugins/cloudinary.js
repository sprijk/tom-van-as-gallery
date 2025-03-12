// plugins/cloudinary.js
export default defineNuxtPlugin(async () => {
  const config = useRuntimeConfig();

  let cloudinaryInstance = null;

  // Server-side only code
  if (import.meta.server) {
    const { v2: cloudinary } = await import('cloudinary');
    cloudinary.config({
      cloud_name: config.cloudinaryCloudName,
      api_key: config.cloudinaryApiKey,
      api_secret: config.cloudinaryApiSecret,
    });
    cloudinaryInstance = cloudinary;
  }

  // Client-side configuration for preview URLs
  const generatePreviewUrl = (publicId, options = {}) => {
    const { width = 300, height = 300, crop = 'fill', quality = 'auto' } = options;

    return `https://res.cloudinary.com/${config.public.cloudinaryCloudName}/image/upload/c_${crop},w_${width},h_${height},q_${quality}/${publicId}`;
  };

  return {
    provide: {
      cloudinary: {
        instance: cloudinaryInstance,
        generatePreviewUrl,
        cloudName: config.public.cloudinaryCloudName,
      },
    },
  };
});
