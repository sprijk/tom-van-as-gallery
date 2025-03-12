// composables/useCloudinary.js - Modified for better image handling
export const useCloudinary = () => {
  const config = useRuntimeConfig();
  const cloudName = config.public.cloudinaryCloudName;

  // Cache voor data om herhaalde netwerkaanvragen te verminderen
  const paintingsCache = useState('paintingsCache', () => null);
  const categoriesCache = useState('categoriesCache', () => null);
  const tagsCache = useState('tagsCache', () => null);

  // Error status
  const apiError = useState('cloudinaryApiError', () => null);
  const isLoading = useState('cloudinaryIsLoading', () => false);

  // Alle schilderijen ophalen via een server API route
  const getAllPaintings = async (forceRefresh = false) => {
    try {
      isLoading.value = true;
      apiError.value = null;

      // Gebruik cache indien beschikbaar en geen forceRefresh
      if (paintingsCache.value && !forceRefresh) {
        isLoading.value = false;
        return paintingsCache.value;
      }

      const response = await fetch('/api/paintings');
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
  const getPaintingById = async (id) => {
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

      const response = await fetch(`/api/paintings/${id}`);
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

  // Ophalen van alle beschikbare tags
  const getAllTags = async (forceRefresh = false) => {
    try {
      isLoading.value = true;
      apiError.value = null;

      // Gebruik cache indien beschikbaar en geen forceRefresh
      if (tagsCache.value && !forceRefresh) {
        isLoading.value = false;
        return tagsCache.value;
      }

      const response = await fetch('/api/tags');
      if (!response.ok) {
        throw new Error('Kon tags niet ophalen');
      }

      const data = await response.json();
      // Update cache
      tagsCache.value = data;
      isLoading.value = false;
      return data;
    } catch (error) {
      console.error('Fout bij het ophalen van tags:', error);
      apiError.value = {
        message: error.message,
        context: 'getAllTags',
        timestamp: new Date().toISOString(),
      };
      isLoading.value = false;
      return [];
    }
  };

  // Ophalen van schilderijen per categorie
  const getPaintingsByCategory = async (category) => {
    try {
      if (!category) return [];

      isLoading.value = true;
      apiError.value = null;

      const allPaintings = await getAllPaintings();
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

  // Helper functie om Cloudinary URL te genereren met originele aspect ratio
  const getImageUrl = (publicId, options = {}) => {
    try {
      if (!publicId) return '';

      const { width, height, crop, format = 'webp', quality = 'auto' } = options;

      let url = `https://res.cloudinary.com/${cloudName}/image/upload/`;

      // Transformaties toevoegen
      const transformations = [];

      // Indien geen crop gespecificeerd, gebruik 'limit' om de originele aspect ratio te behouden
      // zonder cropping, maar met een limiet op de grootte
      if (width) transformations.push(`w_${width}`);
      if (height) transformations.push(`h_${height}`);

      // Gebruik 'limit' als standaard crop methode om aspect ratio te behouden
      // tenzij een ander crop type is opgegeven
      if (crop) {
        transformations.push(`c_${crop}`);
      } else if (width || height) {
        transformations.push('c_limit');
      }

      if (format) transformations.push(`f_${format}`);
      if (quality) transformations.push(`q_${quality}`);

      if (transformations.length > 0) {
        url += transformations.join(',') + '/';
      }

      url += publicId;

      return url;
    } catch (error) {
      console.error('Fout bij het genereren van de afbeelding URL:', error);
      return '';
    }
  };

  // Cache wissen (bijvoorbeeld bij verandering van route)
  const clearCache = () => {
    paintingsCache.value = null;
    categoriesCache.value = null;
    tagsCache.value = null;
    apiError.value = null;
  };

  return {
    getAllPaintings,
    getPaintingById,
    getAllCategories,
    getAllTags,
    getPaintingsByCategory,
    getImageUrl,
    clearCache,
    isLoading,
    apiError,
  };
};
