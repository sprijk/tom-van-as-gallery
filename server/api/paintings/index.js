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
    // Zoek alle afbeeldingen met een titel tag (om alleen schilderijen te krijgen)
    const result = await cloudinary.api.resources({
      type: "upload",
      max_results: 100,
      tags: true,
    });

    // Filteren: alleen afbeeldingen met een titel
    const paintings = result.resources
      .filter((resource) => {
        if (resource.tags && resource.tags.length) {
          console.log(resource.display_name, resource.tags.join(", "));
        }
        return (
          resource.tags && resource.tags.some((tag) => tag.startsWith("title:"))
        );
      })
      .map((resource) => {
        // Tags verwerken
        const tags = resource.tags || [];
        const titleTag = tags.find((tag) => tag.startsWith("title:"));
        const categoryTags = tags.filter((tag) => tag.startsWith("category:"));
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
    throw createError({
      statusCode: 500,
      statusMessage: "Fout bij het ophalen van schilderijen",
      data: error,
    });
  }
});
