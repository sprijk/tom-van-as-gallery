// Cloudinary composable voor gebruik in Nuxt 3
// Werkt met de bijgewerkte API endpoints die gebruik maken van de folderstructuur

export const useCloudinary = () => {
  const config = useRuntimeConfig();
  const cloudName = config.public.cloudinaryCloudName;

  // Alle schilderijen ophalen via een server API route
  const getAllPaintings = async () => {
    try {
      const response = await fetch("/api/paintings");
      if (!response.ok) {
        throw new Error("Kon schilderijen niet ophalen");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Fout bij het ophalen van schilderijen:", error);
      return [];
    }
  };

  // Eén specifiek schilderij ophalen op basis van ID via een server API route
  const getPaintingById = async (id) => {
    try {
      if (!id) return null;

      const response = await fetch(`/api/paintings/${id}`);
      if (!response.ok) {
        throw new Error(`Kon schilderij met ID ${id} niet ophalen`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Fout bij het ophalen van schilderij met ID ${id}:`, error);
      return null;
    }
  };

  // Ophalen van alle beschikbare categorieën (gebaseerd op folders)
  const getAllCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      if (!response.ok) {
        throw new Error("Kon categorieën niet ophalen");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Fout bij het ophalen van categorieën:", error);
      return [];
    }
  };

  // Ophalen van alle beschikbare tags
  const getAllTags = async () => {
    try {
      const response = await fetch("/api/tags");
      if (!response.ok) {
        throw new Error("Kon tags niet ophalen");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Fout bij het ophalen van tags:", error);
      return [];
    }
  };

  // Ophalen van schilderijen per categorie (folder)
  const getPaintingsByCategory = async (category) => {
    try {
      if (!category) return [];

      const allPaintings = await getAllPaintings();
      return allPaintings.filter(
        (painting) =>
          painting.categories && painting.categories.includes(category)
      );
    } catch (error) {
      console.error(
        `Fout bij het ophalen van schilderijen voor categorie ${category}:`,
        error
      );
      return [];
    }
  };

  // Helper functie om Cloudinary URL te genereren
  const getImageUrl = (publicId, options = {}) => {
    const { width, height, crop = "fill", format = "webp" } = options;

    let url = `https://res.cloudinary.com/${cloudName}/image/upload/`;

    // Transformaties toevoegen
    const transformations = [];

    if (width) transformations.push(`w_${width}`);
    if (height) transformations.push(`h_${height}`);
    if (crop) transformations.push(`c_${crop}`);
    if (format) transformations.push(`f_${format}`);

    if (transformations.length > 0) {
      url += transformations.join(",") + "/";
    }

    url += publicId;

    return url;
  };

  return {
    getAllPaintings,
    getPaintingById,
    getAllCategories,
    getAllTags,
    getPaintingsByCategory,
    getImageUrl,
  };
};
