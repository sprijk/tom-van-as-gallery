/**
 * Transforms an image using Imagor
 *
 * @param src - Source image path (could be a path on MinIO or full URL)
 * @param modifiers - Transformation parameters
 * @param options - Provider options from Nuxt config
 */
export const getImage = (src, { modifiers, baseURL }) => {
  console.log('Imagor provider called with:', src, modifiers, baseURL);

  console.log(useRuntimeConfig());

  // Get configuration options
  baseURL = useRuntimeConfig().imagor.baseURL;
  const imageBaseURL = useRuntimeConfig().imagor.imageBaseURL;
  const defaultFormat = 'webp';
  const defaultQuality = 80;

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

  // Check if the source is already an absolute path with the domain
  if (!src.startsWith('http://') && !src.startsWith('https://')) {
    // This is just the path, so we assume it's relative to imageBaseURL
    sourceUrl = `${imageBaseURL}/${src}`;
  } else {
    // This is already a full URL
    sourceUrl = src;
  }

  // URL-encode the source URL for Imagor
  const encodedSrc = encodeURIComponent(sourceUrl);

  // Build the final URL
  // If security key is provided, we should generate a signed URL
  const finalURL = `${baseURL}/unsafe${imagorPath}/${encodedSrc}`;

  console.log('Source URL:', sourceUrl);
  console.log('Final URL:', finalURL);

  return {
    url: finalURL,
  };
};
