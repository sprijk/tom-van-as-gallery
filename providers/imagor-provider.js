/**
 * Transforms an image using Imagor
 *
 * @param src - Source image path (could be a path on MinIO or full URL)
 * @param modifiers - Transformation parameters
 * @param options - Provider options from Nuxt config
 */
export const getImage = (
  src,
  {
    modifiers = {},
    baseURL = 'http://localhost:8080',
    imageBaseURL = 'http://minio.minio:9000/tomvanas-kunst',
  } = {}
) => {
  // Get configuration options from the provided parameters
  const defaultFormat = 'webp';
  const defaultQuality = 80;

  // Build the operations array for Imagor URL
  const operations = [];

  // Handle fit parameter first as it affects how other operations work
  if (modifiers.fit) {
    switch (modifiers.fit) {
      case 'cover':
        operations.push('smart');
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
      // Default imagor behavior for fill is to stretch
      // No need to add any operation for 'fill'
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

  // Handle format conversion
  const format = modifiers.format || defaultFormat;
  if (format) {
    operations.push(`format(${format})`);
  }

  // Handle quality
  const quality = modifiers.quality || defaultQuality;
  if (quality) {
    operations.push(`quality(${quality})`);
  }

  // Handle common additional operations
  if (modifiers.blur) operations.push(`blur(${modifiers.blur})`);
  if (modifiers.sharpen) operations.push(`sharpen(${modifiers.sharpen})`);
  if (modifiers.grayscale) operations.push('grayscale()');
  if (modifiers.brightness) operations.push(`brightness(${modifiers.brightness})`);
  if (modifiers.contrast) operations.push(`contrast(${modifiers.contrast})`);
  if (modifiers.rotate) operations.push(`rotate(${modifiers.rotate})`);
  if (modifiers.flip) operations.push('flip()');
  if (modifiers.flop) operations.push('flop()');

  // Generate the URL path
  let operationsPath = '';
  if (operations.length > 0) {
    operationsPath = operations.join('/') + '/';
  }

  // Determine the source URL for the image
  let sourceUrl = '';

  // Check if the source is already an absolute path with the domain
  if (!src.startsWith('http://') && !src.startsWith('https://')) {
    // This is just the path, so we assume it's relative to imageBaseURL
    sourceUrl = `${imageBaseURL}/${src}`;
  } else {
    // This is already a full URL
    sourceUrl = src;
  }

  // Encode the source URL
  const encodedSrc = encodeURIComponent(sourceUrl);

  // Build the final URL using the unsafe path (we're not using signed URLs)
  const finalURL = `${baseURL}/unsafe/${operationsPath}${encodedSrc}`;

  return {
    url: finalURL,
  };
};
