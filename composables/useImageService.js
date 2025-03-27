// composables/useImageService.js
export const useImageService = () => {
  const config = useRuntimeConfig();
  const imageStorageUrl = config.public.imageStorageUrl;
  const imagorBaseUrl = config.public.imagorBaseUrl;

  // Cache voor data om herhaalde netwerkaanvragen te verminderen
  const paintingsCache = useState('paintingsCache', () => null);
  const categoriesCache = useState('categoriesCache', () => null);

  // Error status
  const apiError = useState('imageApiError', () => null);
  const isLoading = useState('imageApiIsLoading', () => false);

  // Alle schilderijen ophalen via een server API route
  const getAllPaintings = async (forceRefresh = false, headers = null) => {
    try {
      isLoading.value = true;
      apiError.value = null;

      // Gebruik cache indien beschikbaar en geen forceRefresh
      if (paintingsCache.value && !forceRefresh) {
        isLoading.value = false;
        return paintingsCache.value;
      }

      // Create request options with optional headers
      const requestOptions = {};
      if (headers) {
        requestOptions.headers = headers;
      }

      const response = await fetch('/api/paintings', requestOptions);
      if (!response.ok) {
        throw new Error(`Server gaf foutcode ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      // Update cache
      paintingsCache.value = data;
      isLoading.value = false;
      return data;
    } catch (error) {
      console.error('Fout bij het ophalen van schilderijen:', error);
      apiError.value = {
        message: error.message,
        context: 'getAllPaintings',
        timestamp: new Date().toISOString(),
      };
      isLoading.value = false;
      return [];
    }
  };

  // Eén specifiek schilderij ophalen op basis van ID via een server API route
  const getPaintingById = async (id, isAdmin = false) => {
    try {
      if (!id) return null;

      isLoading.value = true;
      apiError.value = null;

      // Controleer eerst of we het al in de cache hebben
      if (paintingsCache.value) {
        const cachedPainting = paintingsCache.value.find((p) => p.id === id);
        if (cachedPainting) {
          isLoading.value = false;
          return cachedPainting;
        }
      }

      // Create request options with optional admin header
      const requestOptions = {};
      if (isAdmin) {
        requestOptions.headers = {
          'x-is-admin': 'true',
        };
      }

      const response = await fetch(`/api/paintings/${id}`, requestOptions);
      if (!response.ok) {
        throw new Error(`Kon schilderij met ID ${id} niet ophalen: ${response.statusText}`);
      }

      const data = await response.json();
      isLoading.value = false;
      return data;
    } catch (error) {
      console.error(`Fout bij het ophalen van schilderij met ID ${id}:`, error);
      apiError.value = {
        message: error.message,
        context: 'getPaintingById',
        id,
        timestamp: new Date().toISOString(),
      };
      isLoading.value = false;
      return null;
    }
  };

  // Ophalen van alle beschikbare categorieën
  const getAllCategories = async (forceRefresh = false) => {
    try {
      isLoading.value = true;
      apiError.value = null;

      // Gebruik cache indien beschikbaar en geen forceRefresh
      if (categoriesCache.value && !forceRefresh) {
        isLoading.value = false;
        return categoriesCache.value;
      }

      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error('Kon categorieën niet ophalen');
      }

      const data = await response.json();
      // Update cache
      categoriesCache.value = data;
      isLoading.value = false;
      return data;
    } catch (error) {
      console.error('Fout bij het ophalen van categorieën:', error);
      apiError.value = {
        message: error.message,
        context: 'getAllCategories',
        timestamp: new Date().toISOString(),
      };
      isLoading.value = false;
      return [];
    }
  };

  // Ophalen van schilderijen per categorie
  const getPaintingsByCategory = async (category, isAdmin = false) => {
    try {
      if (!category) return [];

      isLoading.value = true;
      apiError.value = null;

      // Create request options with optional admin header
      const requestOptions = {};
      if (isAdmin) {
        requestOptions.headers = {
          'x-is-admin': 'true',
        };
      }

      const allPaintings = await getAllPaintings(false, isAdmin ? { 'x-is-admin': 'true' } : null);
      isLoading.value = false;

      return allPaintings.filter((painting) => painting.category === category);
    } catch (error) {
      console.error(`Fout bij het ophalen van schilderijen voor categorie ${category}:`, error);
      apiError.value = {
        message: error.message,
        context: 'getPaintingsByCategory',
        category,
        timestamp: new Date().toISOString(),
      };
      isLoading.value = false;
      return [];
    }
  };

  // Helper functie om image URL te genereren met Imagor
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
      console.error('Fout bij het genereren van de afbeelding URL:', error);
      return '';
    }
  };

  // Cache wissen (bijvoorbeeld bij verandering van route)
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
