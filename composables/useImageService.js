// composables/useImageService.js
export const useImageService = () => {
  const config = useRuntimeConfig();
  const imageStorageUrl = config.public.imageStorageUrl;
  const imagorBaseUrl = config.public.imagorBaseUrl;

  // State for loading and errors
  const isLoading = useState('imageApiIsLoading', () => false);
  const apiError = useState('imageApiError', () => null);

  // Cache states
  const paintingsCache = useState('paintingsCache', () => null);
  const categoriesCache = useState('categoriesCache', () => null);

  // Get all paintings with proper fetch handling
  const getAllPaintings = async (forceRefresh = false, headers = null) => {
    try {
      // Use cache if available and not forcing refresh
      if (paintingsCache.value && !forceRefresh) {
        return paintingsCache.value;
      }

      isLoading.value = true;
      apiError.value = null;

      // Set up fetch options
      const options = {};
      if (headers) {
        options.headers = headers;
      }

      // Use Nuxt's useFetch which handles both server and client correctly
      const { data, error } = await useFetch('/api/paintings', options);

      if (error.value) {
        throw new Error(`Server error: ${error.value.message}`);
      }

      // Update cache with the new data
      paintingsCache.value = data.value;

      return data.value;
    } catch (error) {
      console.error('Error fetching paintings:', error);
      apiError.value = {
        message: error.message,
        context: 'getAllPaintings',
        timestamp: new Date().toISOString(),
      };
      return [];
    } finally {
      isLoading.value = false;
    }
  };

  // Get a specific painting by ID
  const getPaintingById = async (id, isAdmin = false) => {
    try {
      if (!id) return null;

      isLoading.value = true;
      apiError.value = null;

      // Check if we have it in cache first
      if (paintingsCache.value) {
        const cachedPainting = paintingsCache.value.find((p) => p.id === id);
        if (cachedPainting) {
          isLoading.value = false;
          return cachedPainting;
        }
      }

      // Set up fetch options for admin requests
      const options = {};
      if (isAdmin) {
        options.headers = {
          'x-is-admin': 'true',
        };
      }

      // Use Nuxt's useFetch
      const { data, error } = await useFetch(`/api/paintings/${id}`, {
        ...options,
        key: `painting-${id}-${isAdmin ? 'admin' : 'user'}`,
      });

      if (error.value) {
        throw new Error(`Could not fetch painting with ID ${id}: ${error.value.message}`);
      }

      return data.value;
    } catch (error) {
      console.error(`Error fetching painting with ID ${id}:`, error);
      apiError.value = {
        message: error.message,
        context: 'getPaintingById',
        id,
        timestamp: new Date().toISOString(),
      };
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  // Get all categories
  const getAllCategories = async (forceRefresh = false) => {
    try {
      // Use cache if available and not forcing refresh
      if (categoriesCache.value && !forceRefresh) {
        return categoriesCache.value;
      }

      isLoading.value = true;
      apiError.value = null;

      const { data, error } = await useFetch('/api/categories');

      if (error.value) {
        throw new Error(`Could not fetch categories: ${error.value.message}`);
      }

      // Update cache
      categoriesCache.value = data.value;

      return data.value;
    } catch (error) {
      console.error('Error fetching categories:', error);
      apiError.value = {
        message: error.message,
        context: 'getAllCategories',
        timestamp: new Date().toISOString(),
      };
      return [];
    } finally {
      isLoading.value = false;
    }
  };

  // Get paintings by category
  const getPaintingsByCategory = async (category, isAdmin = false) => {
    try {
      if (!category) return [];

      isLoading.value = true;
      apiError.value = null;

      // Get all paintings and filter them
      const adminHeaders = isAdmin ? { 'x-is-admin': 'true' } : null;
      const allPaintings = await getAllPaintings(false, adminHeaders);

      // Filter by category
      return allPaintings.filter((painting) => painting.category === category);
    } catch (error) {
      console.error(`Error fetching paintings for category ${category}:`, error);
      apiError.value = {
        message: error.message,
        context: 'getPaintingsByCategory',
        category,
        timestamp: new Date().toISOString(),
      };
      return [];
    } finally {
      isLoading.value = false;
    }
  };

  // Helper function to generate image URL with Imagor
  const getImageUrl = (destPath, options = {}) => {
    try {
      if (!destPath) return '';

      const { width, height, crop = 'fit-in', format = 'webp', quality = 'auto' } = options;

      // Build the operations array for Imagor URL
      const operations = [];

      // Add crop operation
      operations.push(crop);

      // Add resize if width or height is specified
      if (width || height) {
        let resizeString = '';
        if (width) resizeString += width;
        resizeString += 'x';
        if (height) resizeString += height;
        operations.push(resizeString);
      }

      // Format and quality
      if (format) operations.push(`format(${format})`);
      if (quality) operations.push(`quality(${quality})`);

      // Combine operations into URL path
      const operationsPath = operations.length > 0 ? operations.join('/') : '';

      // Build the final URL
      const finalUrl = `${imagorBaseUrl}/unsafe/${operationsPath}/${imageStorageUrl}/${destPath}`;

      return finalUrl;
    } catch (error) {
      console.error('Error generating image URL:', error);
      return '';
    }
  };

  // Clear cache
  const clearCache = () => {
    paintingsCache.value = null;
    categoriesCache.value = null;
    apiError.value = null;
  };

  return {
    getAllPaintings,
    getPaintingById,
    getAllCategories,
    getPaintingsByCategory,
    getImageUrl,
    clearCache,
    isLoading,
    apiError,
  };
};
