// server/api/paintings/[id].js
import { v2 as cloudinary } from 'cloudinary'

export default defineEventHandler(async (event) => {
  const id = event.context.params.id
  const config = useRuntimeConfig()

  // Cloudinary configureren
  cloudinary.config({
    cloud_name: config.cloudinaryCloudName,
    api_key: config.cloudinaryApiKey,
    api_secret: config.cloudinaryApiSecret,
  })

  try {
    // Details van een specifieke resource ophalen
    const result = await cloudinary.api.resource(id, {
      tags: true,
      context: true,
    })

    // Bepaal categorie op basis van folder path
    let category = ''
    const folderPath = result.folder

    if (folderPath) {
      // Check of het pad begint met "Tom van As Kunst"
      if (folderPath.startsWith('Tom van As Kunst/')) {
        // Haal de eerste subfolder na "Tom van As Kunst/" eruit
        const pathWithoutRoot = folderPath.replace('Tom van As Kunst/', '')
        // Als er nog een '/' in zit, neem alleen het eerste deel
        category = pathWithoutRoot.split('/')[0]
      }
      else {
        // Anders neem de volledige foldernaam
        category = folderPath.split('/').pop()
      }
    }

    // Tags verwerken - alle tags zijn reguliere tags
    const tags = result.tags || []

    // Titel ophalen uit caption
    const title = result.context?.custom?.caption || 'Ongetiteld'

    return {
      id: result.public_id,
      title: title,
      imageUrl: result.secure_url,
      category: category,
      tags: tags,
      width: result.width,
      height: result.height,
      format: result.format,
      created: result.created_at,
      folder: result.folder,
    }
  }
  catch (error) {
    console.error(`Fout bij het ophalen van schilderij met ID ${id}:`, error)
    throw createError({
      statusCode: 404,
      statusMessage: `Schilderij met ID ${id} niet gevonden`,
      data: error,
    })
  }
})
