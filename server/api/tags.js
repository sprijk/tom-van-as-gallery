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

    // Alle reguliere tags verzamelen (geen title: of category: tags)
    const allTags = new Set();

    result.resources.forEach((resource) => {
      const tags = resource.tags || [];
      const regularTags = tags.filter(
        (tag) => !tag.startsWith("title:") && !tag.startsWith("category:")
      );

      regularTags.forEach((tag) => {
        allTags.add(tag);
      });
    });

    return Array.from(allTags);
  } catch (error) {
    console.error("Fout bij het ophalen van tags:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Fout bij het ophalen van tags",
      data: error,
    });
  }
});
