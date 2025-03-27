import { joinURL } from 'ufo';

/**
 * Transforms an image using Imagor
 *
 * @param src - Source image path (could be a path on MinIO or full URL)
 * @param modifiers - Transformation parameters
 * @param options - Provider options from Nuxt config
 */
export const getImage = (src, { modifiers = {}, baseURL, imageBaseURL } = {}) => {
  // Get configuration options from the provided parameters
  const defaultFormat = 'webp';
  const defaultQuality = 80;

  // Build the operations array for Imagor URL
  const operations = [];
  const filters = [];

  // Handle fit parameter first as it affects how other operations work
  if (modifiers.fit) {
    switch (modifiers.fit) {
      case 'cover':
        // nothing needed, this is default
        break;
      case 'contain':
        operations.push('fit-in');
        break;
      case 'inside':
        operations.push('fit-in');
        break;
      case 'outside':
        operations.push('fit-in');
        break;
      // Default imagor behavior for fill is to stretch, no operation needed
    }
  }

  // Handle resizing
  if (modifiers.width || modifiers.height) {
    let resizeString = '';
    if (modifiers.width) resizeString += modifiers.width;
    resizeString += 'x';
    if (modifiers.height) resizeString += modifiers.height;
    operations.push(resizeString);
  }

  // Add filters using the imagor syntax
  // Format filter
  if (modifiers.format) {
    filters.push(`format(${modifiers.format})`);
  }

  // Quality filter
  if (modifiers.quality) {
    filters.push(`quality(${modifiers.quality})`);
  }

  // Other filters
  if (modifiers.blur) filters.push(`blur(${modifiers.blur})`);
  if (modifiers.sharpen) filters.push(`sharpen(${modifiers.sharpen})`);
  if (modifiers.grayscale) filters.push('grayscale()');
  if (modifiers.brightness) filters.push(`brightness(${modifiers.brightness})`);
  if (modifiers.contrast) filters.push(`contrast(${modifiers.contrast})`);
  if (modifiers.rotate) filters.push(`rotate(${modifiers.rotate})`);
  if (modifiers.background) filters.push(`background_color(${modifiers.background})`);
  if (modifiers.fill) filters.push(`fill(${modifiers.fill})`);

  // Add filters part if needed
  if (filters.length > 0) {
    operations.push(`filters:${filters.join(':')}`);
  }

  // Determine the source URL for the image
  let sourceUrl = '';

  // Check if the source is already an absolute URL with a domain
  if (src.startsWith('http://') || src.startsWith('https://')) {
    sourceUrl = src;
  } else {
    // This is just the path, assume it's relative to imageBaseURL if provided

    sourceUrl = imageBaseURL ? `${imageBaseURL}${src.startsWith('/') ? '' : '/'}${src}` : src;
  }

  // Build the final URL using the unsafe path for development
  // In production, you'd likely want to implement the HMAC signature
  const pathParts = ['unsafe'];

  // Add all operations
  pathParts.push(...operations);

  // Add the source URL
  pathParts.push(encodeURIComponent(sourceUrl));

  // Join all parts with slashes
  const path = pathParts.join('/');

  // Join with base URL
  const finalURL = joinURL(baseURL, path);

  return {
    url: finalURL,
  };
};
