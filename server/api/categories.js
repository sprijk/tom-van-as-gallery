import { v2 as cloudinary } from "cloudinary";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  // Cloudinary configureren
  cloudinary.config({
    cloud_name: config.cloudinaryCloudName,
    api_key: config.cloudinaryApiKey,
    api_secret: config.cloudinaryApiSecret,
  });

  try {
    // Alle resources ophalen met tags
    const result = await cloudinary.api.resources({
      type: "upload",
      max_results: 100,
      tags: true,
    });

    // Alle categorieën verzamelen uit de tags
    const allCategories = new Set();

    result.resources.forEach((resource) => {
      const tags = resource.tags || [];
      const categoryTags = tags.filter((tag) => tag.startsWith("category:"));

      categoryTags.forEach((tag) => {
        const category = tag.replace("category:", "");
        allCategories.add(category);
      });
    });

    return Array.from(allCategories);
  } catch (error) {
    console.error("Fout bij het ophalen van categorieën:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Fout bij het ophalen van categorieën",
      data: error,
    });
  }
});
