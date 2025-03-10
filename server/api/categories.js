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
    // De subfolders ophalen uit de hoofdmap "Tom van As Kunst"
    const result = await cloudinary.api.sub_folders("Tom van As Kunst");

    // Mapnamen extraheren als categorieën
    const categories = result.folders.map((folder) => folder.name);

    return categories;
  } catch (error) {
    console.error("Fout bij het ophalen van categorieën:", error);

    // Als de root folder niet bestaat of een andere fout optreedt,
    // probeer dan alle mappen op het hoogste niveau
    try {
      const rootFolders = await cloudinary.api.root_folders();

      // Check of "Tom van As Kunst" bestaat als root folder
      const tomVanAsFolder = rootFolders.folders.find(
        (folder) => folder.name === "Tom van As Kunst"
      );

      if (tomVanAsFolder) {
        return []; // Folder bestaat, maar geen subcategorieën gevonden
      } else {
        // Gebruik alle root folders als categorieën
        const categories = rootFolders.folders.map((folder) => folder.name);
        return categories;
      }
    } catch (fallbackError) {
      console.error(
        "Fallback fout bij het ophalen van categorieën:",
        fallbackError
      );
      return []; // Geef een lege lijst terug als we echt niets kunnen vinden
    }
  }
});
