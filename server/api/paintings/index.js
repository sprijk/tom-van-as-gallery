// server/api/paintings/index.js - Update to include published state
import { v2 as cloudinary } from 'cloudinary';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  // Check if this is an admin request
  const isAdmin = event.path.includes('/admin') || event.headers.get('x-is-admin') === 'true';

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
        });

        // Verwerk de schilderijen
        const paintings = result.resources.map((resource) => {
          // Titel ophalen uit label_number of caption als fallback
          const labelNumber = resource.context?.custom?.label_number;

          // Bepaal de titel - gebruik label_number als eerste keuze
          let title;
          if (labelNumber) {
            title = `Nummer ${labelNumber}`;
          } else {
            title = 'Ongetiteld';
          }

          // Haal categorienaam uit folder pad
          const pathParts = folderPath.split('/');
          const category = pathParts[pathParts.length - 1];

          // Check published state - default to true if not specified
          const publishedStr = resource.context?.custom?.published;
          const isPublished =
            publishedStr === undefined || publishedStr === null
              ? true // Default to published if not specified
              : publishedStr === 'true';

          return {
            id: resource.public_id,
            title,
            imageUrl: resource.secure_url,
            category,
            width: resource.width,
            height: resource.height,
            format: resource.format,
            created: resource.created_at,
            folder: resource.folder,
            labelNumber: labelNumber,
            verified: resource.context?.custom?.verified === 'true',
            published: isPublished,
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
      });

      // Verwerk de schilderijen
      allPaintings = result.resources.map((resource) => {
        // Titel ophalen uit label_number of caption als fallback
        const labelNumber = resource.context?.custom?.label_number;
        const caption = resource.context?.custom?.caption;

        // Bepaal de titel - gebruik label_number als eerste keuze
        let title;
        if (labelNumber) {
          title = `Nummer ${labelNumber}`;
        } else if (caption) {
          title = caption;
        } else {
          title = 'Ongetiteld';
        }

        // Categorie bepalen uit folder pad als het er is
        let category = '';
        if (resource.folder) {
          const pathParts = resource.folder.split('/');
          category = pathParts[pathParts.length - 1];
        }

        // Check published state - default to true if not specified
        const publishedStr = resource.context?.custom?.published;
        const isPublished =
          publishedStr === undefined || publishedStr === null
            ? true // Default to published if not specified
            : publishedStr === 'true';

        return {
          id: resource.public_id,
          title,
          imageUrl: resource.secure_url,
          category,
          width: resource.width,
          height: resource.height,
          format: resource.format,
          created: resource.created_at,
          folder: resource.folder,
          published: isPublished,
        };
      });
    }

    console.log('Schilderijen opgehaald:', allPaintings.length);

    // If this is not an admin request, filter out unpublished paintings
    if (!isAdmin) {
      allPaintings = allPaintings.filter((painting) => painting.published);
      console.log('Filtered to published paintings:', allPaintings.length);
    }

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
