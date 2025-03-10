import { v2 as cloudinary } from "cloudinary";

export default defineEventHandler(async (event) => {
  const id = event.context.params.id;
  const config = useRuntimeConfig();

  // Cloudinary configureren
  cloudinary.config({
    cloud_name: config.cloudinaryCloudName,
    api_key: config.cloudinaryApiKey,
    api_secret: config.cloudinaryApiSecret,
  });

  try {
    // Details van een specifieke resource ophalen
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
    throw createError({
      statusCode: 404,
      statusMessage: `Schilderij met ID ${id} niet gevonden`,
      data: error,
    });
  }
});
