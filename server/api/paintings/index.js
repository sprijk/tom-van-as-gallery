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
    // Eerst alle categorieën (folders) ophalen
    const foldersResult = await cloudinary.api.sub_folders("Tom van As Kunst");
    const folders = foldersResult.folders;

    let allPaintings = [];

    // Voor elke folder, haal de schilderijen op
    for (const folder of folders) {
      console.log(folder.path);
      const folderPath = folder.path;

      // Haal alle schilderijen op uit deze folder
      const result = await cloudinary.api.resources({
        type: "upload",
        max_results: 1000,
        prefix: folderPath,
        context: true,
        tags: true,
      });

      console.log("resources length", result.resources.length);

      // Verwerk de schilderijen
      const paintings = result.resources
        .filter((resource) => {
          console.log(resource);
          const hasCaption = resource.context?.custom?.caption;
          const hasTitleTag =
            resource.tags &&
            resource.tags.some((tag) => tag.startsWith("title:"));
          return hasCaption || hasTitleTag;
        })
        .map((resource) => {
          // Tags verwerken
          const tags = resource.tags || [];
          const titleTag = tags.find((tag) => tag.startsWith("title:"));
          const regularTags = tags.filter((tag) => !tag.startsWith("title:"));

          // Titel ophalen uit caption of uit tag
          const title =
            resource.context?.custom?.caption ||
            (titleTag ? titleTag.replace("title:", "") : "Ongetiteld");

          // Haal categorienaam uit folder pad
          const pathParts = folderPath.split("/");
          const category = pathParts[pathParts.length - 1];

          return {
            id: resource.public_id,
            title,
            imageUrl: resource.secure_url,
            category,
            tags: regularTags,
            width: resource.width,
            height: resource.height,
            format: resource.format,
            created: resource.created_at,
            folder: resource.folder,
          };
        });

      allPaintings = [...allPaintings, ...paintings];
    }

    console.log("aantal schilderijen:", allPaintings.length);

    return allPaintings;
  } catch (error) {
    console.error("Fout bij het ophalen van schilderijen:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Fout bij het ophalen van schilderijen",
      data: error,
    });
  }
});
