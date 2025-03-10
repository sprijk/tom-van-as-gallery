import { v2 as cloudinary } from "cloudinary";

export const useCloudinary = () => {
  const config = useRuntimeConfig();

  // Cloudinary configuratie
  const setupCloudinary = () => {
    cloudinary.config({
      cloud_name: config.public.cloudinaryCloudName,
      api_key: config.public.cloudinaryApiKey,
      api_secret: config.public.cloudinaryApiSecret,
    });
  };

  // Alle schilderijen ophalen van Cloudinary
  const getAllPaintings = async () => {
    setupCloudinary();

    try {
      // Zoek alle afbeeldingen met een titel tag (om alleen schilderijen te krijgen)
      const result = await cloudinary.api.resources({
        type: "upload",
        max_results: 100,
        tags: true,
      });

      // Filteren: alleen afbeeldingen met een titel
      const paintings = result.resources
        .filter(
          (resource) =>
            resource.tags &&
            resource.tags.some((tag) => tag.startsWith("title:"))
        )
        .map((resource) => {
          // Tags verwerken
          const tags = resource.tags || [];
          const titleTag = tags.find((tag) => tag.startsWith("title:"));
          const categoryTags = tags.filter((tag) =>
            tag.startsWith("category:")
          );
          const regularTags = tags.filter(
            (tag) => !tag.startsWith("title:") && !tag.startsWith("category:")
          );

          return {
            id: resource.public_id,
            title: titleTag ? titleTag.replace("title:", "") : "Ongetiteld",
            imageUrl: resource.secure_url,
            categories: categoryTags.map((tag) => tag.replace("category:", "")),
            tags: regularTags,
            width: resource.width,
            height: resource.height,
            format: resource.format,
            created: resource.created_at,
          };
        });

      return paintings;
    } catch (error) {
      console.error("Fout bij het ophalen van schilderijen:", error);
      return [];
    }
  };

  // Eén specifiek schilderij ophalen op basis van ID
  const getPaintingById = async (id) => {
    setupCloudinary();

    try {
      const result = await cloudinary.api.resource(id, { tags: true });

      // Tags verwerken
      const tags = result.tags || [];
      const titleTag = tags.find((tag) => tag.startsWith("title:"));
      const categoryTags = tags.filter((tag) => tag.startsWith("category:"));
      const regularTags = tags.filter(
        (tag) => !tag.startsWith("title:") && !tag.startsWith("category:")
      );

      return {
        id: result.public_id,
        title: titleTag ? titleTag.replace("title:", "") : "Ongetiteld",
        imageUrl: result.secure_url,
        categories: categoryTags.map((tag) => tag.replace("category:", "")),
        tags: regularTags,
        width: result.width,
        height: result.height,
        format: result.format,
        created: result.created_at,
      };
    } catch (error) {
      console.error(`Fout bij het ophalen van schilderij met ID ${id}:`, error);
      return null;
    }
  };

  // Ophalen van alle beschikbare categorieën
  const getAllCategories = async () => {
    const paintings = await getAllPaintings();
    const allCategories = paintings.flatMap((painting) => painting.categories);
    return [...new Set(allCategories)];
  };

  // Ophalen van alle beschikbare tags
  const getAllTags = async () => {
    const paintings = await getAllPaintings();
    const allTags = paintings.flatMap((painting) => painting.tags);
    return [...new Set(allTags)];
  };

  return {
    getAllPaintings,
    getPaintingById,
    getAllCategories,
    getAllTags,
  };
};
