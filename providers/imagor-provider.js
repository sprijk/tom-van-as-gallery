// providers/imagor-provider.js
import { defineImageProvider } from '#image';

export default defineImageProvider({
  name: 'imagor',

  provider: '~/providers/imagor-provider.js',

  /**
   * Transforms an image using Imagor
   *
   * @param src - Source image path (could be a path on MinIO or full URL)
   * @param modifiers - Transformation parameters
   * @param options - Provider options from Nuxt config
   */
  async getImage(src, { modifiers, options }) {
    // Get configuration options
    const {
      baseURL = 'http://localhost:8080',
      imageBaseURL = 'http://localhost:9000/images',
      securityKey = '',
      defaultFormat = 'webp',
      defaultQuality = 80,
    } = options || {};

    // Build the operations array for Imagor URL
    const operations = [];

    // Handle resizing
    if (modifiers.width || modifiers.height) {
      const resize = ['resize'];
      if (modifiers.width) resize.push(modifiers.width);
      if (modifiers.height) resize.push(modifiers.height);
      operations.push(resize.join('-'));
    }

    // Handle cropping based on fit parameter
    if (modifiers.fit) {
      switch (modifiers.fit) {
        case 'cover':
          operations.push('smart');
          break;
        case 'contain':
          operations.push('fit-in');
          break;
        case 'fill':
          // Default imagor behavior for fill is to stretch
          // No need to add any operation
          break;
        case 'inside':
          operations.push('fit-in');
          break;
        case 'outside':
          // There's no direct equivalent, using fit-in as closest
          operations.push('fit-in');
          break;
      }
    }

    // Handle format conversion
    const format = modifiers.format || defaultFormat;
    if (format) {
      operations.push(`format-${format}`);
    }

    // Handle quality
    const quality = modifiers.quality || defaultQuality;
    if (quality) {
      operations.push(`quality-${quality}`);
    }

    // Handle common additional operations
    if (modifiers.blur) operations.push(`blur-${modifiers.blur}`);
    if (modifiers.sharpen) operations.push(`sharpen-${modifiers.sharpen}`);
    if (modifiers.grayscale) operations.push('grayscale');
    if (modifiers.brightness) operations.push(`brightness-${modifiers.brightness}`);
    if (modifiers.contrast) operations.push(`contrast-${modifiers.contrast}`);
    if (modifiers.rotate) operations.push(`rotate-${modifiers.rotate}`);
    if (modifiers.flip) operations.push('flip');
    if (modifiers.flop) operations.push('flop');

    // Generate the URL path
    let imagorPath = '';
    if (operations.length > 0) {
      imagorPath = '/' + operations.join('/');
    }

    // Determine the source URL for the image
    let sourceUrl = '';

    // If the path is a public ID (from previous Cloudinary setup)
    // we need to map it to the new storage path
    if (!src.startsWith('http://') && !src.startsWith('https://')) {
      // This is just the ID, so we construct the full path to the image in MinIO
      sourceUrl = `${imageBaseURL}/${src}`;
    } else {
      // This is already a full URL
      sourceUrl = src;
    }

    // URL-encode the source URL for Imagor
    const encodedSrc = encodeURIComponent(sourceUrl);

    // Build the final URL
    // If security key is provided, we should generate a signed URL
    let finalURL;

    if (securityKey) {
      // For signed URLs, implement signing logic here
      // This would require crypto functions
      // For simplicity, this example doesn't include signing
      console.warn('URL signing is not implemented in this example');
      finalURL = `${baseURL}${imagorPath}/${encodedSrc}`;
    } else {
      // For unsigned URLs (unsafe mode in Imagor)
      finalURL = `${baseURL}/unsafe${imagorPath}/${encodedSrc}`;
    }

    return {
      url: finalURL,
    };
  },
});
