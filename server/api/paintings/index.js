// server/api/paintings/index.js
import { v2 as cloudinary } from 'cloudinary';

export default defineEventHandler(async () => {
  const config = useRuntimeConfig();

  // Cloudinary configureren
  cloudinary.config({
    cloud_name: config.cloudinaryCloudName,
    api_key: config.cloudinaryApiKey,
    api_secret: config.cloudinaryApiSecret,
  });

  try {
    let allPaintings = [];

    // Eerst proberen om de hoofdcollectie te benaderen
    try {
      const foldersResult = await cloudinary.api.sub_folders('Tom van As Kunst');
      const folders = foldersResult.folders;

      // Voor elke folder, haal de schilderijen op
      for (const folder of folders) {
        const folderPath = folder.path;

        // Haal alle schilderijen op uit deze folder met resources_by_asset_folder
        const result = await cloudinary.api.resources_by_asset_folder(folderPath, {
          type: 'upload',
          max_results: 500,
          context: true,
          tags: true,
        });

        // Verwerk de schilderijen
        const paintings = result.resources
          // TODO: filteren op caption
          // .filter((resource) => {
          //   // Alleen resources met titel in caption gebruiken
          //   return resource.context?.custom?.caption;
          // })
          .map((resource) => {
            // Tags verwerken - alle tags zijn reguliere tags, geen title tags meer
            const tags = resource.tags || [];

            // Titel ophalen uit caption
            const title = resource.context?.custom?.caption || 'Ongetiteld';

            // Haal categorienaam uit folder pad
            const pathParts = folderPath.split('/');
            const category = pathParts[pathParts.length - 1];

            return {
              id: resource.public_id,
              title,
              imageUrl: resource.secure_url,
              category,
              tags,
              width: resource.width,
              height: resource.height,
              format: resource.format,
              created: resource.created_at,
              folder: resource.folder,
            };
          });

        allPaintings = [...allPaintings, ...paintings];
      }
    } catch (folderError) {
      console.error('Fout bij het ophalen van folders:', folderError);

      // Fallback: probeer gewoon alle afbeeldingen op te halen
      const result = await cloudinary.api.resources({
        type: 'upload',
        max_results: 500,
        context: true,
        tags: true,
      });

      // Verwerk de schilderijen
      allPaintings = result.resources
        .filter((resource) => {
          // Alleen resources met titel in caption gebruiken
          return resource.context?.custom?.caption;
        })
        .map((resource) => {
          // Tags verwerken - alle tags zijn reguliere tags
          const tags = resource.tags || [];

          // Titel ophalen uit caption
          const title = resource.context?.custom?.caption || 'Ongetiteld';

          // Categorie bepalen uit folder pad als het er is
          let category = '';
          if (resource.folder) {
            const pathParts = resource.folder.split('/');
            category = pathParts[pathParts.length - 1];
          }

          return {
            id: resource.public_id,
            title,
            imageUrl: resource.secure_url,
            category,
            tags,
            width: resource.width,
            height: resource.height,
            format: resource.format,
            created: resource.created_at,
            folder: resource.folder,
          };
        });
    }

    console.log('Schilderijen opgehaald:', allPaintings.length);

    return allPaintings;
  } catch (error) {
    console.error('Fout bij het ophalen van schilderijen:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Fout bij het ophalen van schilderijen',
      data: error,
    });
  }
});
