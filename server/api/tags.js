// server/api/tags.js
import { v2 as cloudinary } from 'cloudinary'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  // Cloudinary configureren
  cloudinary.config({
    cloud_name: config.cloudinaryCloudName,
    api_key: config.cloudinaryApiKey,
    api_secret: config.cloudinaryApiSecret,
  })

  try {
    // Eerst alle categorieën (folders) ophalen
    const foldersResult = await cloudinary.api.sub_folders('Tom van As Kunst')
    const folders = foldersResult.folders

    // Verzamel alle tags
    const allTags = new Set()

    // Voor elke folder, haal de resources op en verzamel de tags
    for (const folder of folders) {
      try {
        const folderPath = folder.path

        const result = await cloudinary.api.resources_by_asset_folder(
          folderPath,
          {
            type: 'upload',
            max_results: 500,
            tags: true,
          },
        )

        // Verzamel tags uit alle resources
        result.resources.forEach((resource) => {
          const tags = resource.tags || []
          tags.forEach((tag) => {
            allTags.add(tag)
          })
        })
      }
      catch (folderError) {
        console.error(
          `Fout bij ophalen van tags voor folder ${folder.path}:`,
          folderError,
        )
        // Doorgaan met volgende folder
        continue
      }
    }

    return Array.from(allTags)
  }
  catch (error) {
    console.error('Fout bij het ophalen van tags:', error)

    // Fallback: probeer tags te halen van root resources
    try {
      const result = await cloudinary.api.resources({
        type: 'upload',
        max_results: 500,
        tags: true,
      })

      const allTags = new Set()

      result.resources.forEach((resource) => {
        const tags = resource.tags || []
        tags.forEach((tag) => {
          allTags.add(tag)
        })
      })

      return Array.from(allTags)
    }
    catch (fallbackError) {
      console.error('Fallback fout bij het ophalen van tags:', fallbackError)
      return [] // Return lege array bij fout
    }
  }
})
