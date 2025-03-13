// server/api/paintings/[id].js - Modified to include published state
import { v2 as cloudinary } from 'cloudinary';

export default defineEventHandler(async (event) => {
  const id = event.context.params.id;
  const config = useRuntimeConfig();

  // Check if this is an admin request
  const isAdmin = event.path.includes('/admin') || event.headers.get('x-is-admin') === 'true';

  console.log(`Fetching painting with ID ${id}`);

  // Cloudinary configureren
  cloudinary.config({
    cloud_name: config.cloudinaryCloudName,
    api_key: config.cloudinaryApiKey,
    api_secret: config.cloudinaryApiSecret,
  });

  try {
    // Details van een specifieke resource ophalen
    const result = await cloudinary.api.resource(id, {
      tags: true,
      context: true,
    });

    // Bepaal categorie op basis van folder path
    let category = '';
    const folderPath = result.folder;

    if (folderPath) {
      // Check of het pad begint met "Tom van As Kunst"
      if (folderPath.startsWith('Tom van As Kunst/')) {
        // Haal de eerste subfolder na "Tom van As Kunst/" eruit
        const pathWithoutRoot = folderPath.replace('Tom van As Kunst/', '');
        // Als er nog een '/' in zit, neem alleen het eerste deel
        category = pathWithoutRoot.split('/')[0];
      } else {
        // Anders neem de volledige foldernaam
        category = folderPath.split('/').pop();
      }
    }

    // Tags verwerken - alle tags zijn reguliere tags
    const tags = result.tags || [];

    // Titel ophalen uit label_number of caption als fallback
    const labelNumber = result.context?.custom?.label_number;

    // Bepaal de titel - gebruik label_number als eerste keuze
    let title;
    if (labelNumber) {
      title = `Nummer ${labelNumber}`;
    } else {
      title = 'Ongetiteld';
    }

    // Check published state - default to true if not specified
    const publishedStr = result.context?.custom?.published;
    const isPublished =
      publishedStr === undefined || publishedStr === null
        ? true // Default to published if not specified
        : publishedStr === 'true';

    // If not admin and painting is not published, return 404
    if (!isAdmin && !isPublished) {
      throw createError({
        statusCode: 404,
        statusMessage: `Schilderij met ID ${id} niet gevonden`,
      });
    }

    // Genereer een optimale image URL zonder cropping die de aspect ratio behoudt
    const originalUrl = cloudinary.url(result.public_id, {
      secure: true,
      transformation: [
        {
          // Geen crop parameter specificeert behoudt de aspect ratio
          width: 'auto',
          dpr: 'auto',
          quality: 'auto',
          fetch_format: 'auto',
        },
      ],
    });

    return {
      id: result.public_id,
      title: title,
      imageUrl: result.secure_url,
      originalImageUrl: originalUrl,
      category: category,
      tags: tags,
      width: result.width,
      height: result.height,
      format: result.format,
      created: result.created_at,
      folder: result.folder,
      labelNumber: labelNumber,
      verified: result.context?.custom?.verified === 'true',
      published: isPublished,
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
