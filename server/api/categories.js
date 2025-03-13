// server/api/categories.js
// import { v2 as cloudinary } from 'cloudinary';

export default defineEventHandler(async () => {
  return [
    'VROEG WERK (1950 - 1965)',
    'LANDSCHAPPEN - NEDERLAND',
    'LANDSCHAPPEN - BUITENLAND',
    'ATELIER WERK',
    'ANDERE (bevriende) KUNSTENAARS',
  ];

  // const config = useRuntimeConfig();

  // // Cloudinary configureren
  // cloudinary.config({
  //   cloud_name: config.cloudinaryCloudName,
  //   api_key: config.cloudinaryApiKey,
  //   api_secret: config.cloudinaryApiSecret,
  // });

  // try {
  //   // De subfolders ophalen uit de hoofdmap "Tom van As Kunst"
  //   const result = await cloudinary.api.sub_folders('Tom van As Kunst');

  //   // Mapnamen extraheren als categorieën
  //   const categories = result.folders.map((folder) => folder.name);

  //   return categories;
  // } catch (error) {
  //   console.error('Fout bij het ophalen van categorieën:', error);

  //   // Als de root folder niet bestaat of een andere fout optreedt,
  //   // probeer dan alle resources te doorzoeken en categorieën te extraheren
  //   try {
  //     const result = await cloudinary.api.resources({
  //       type: 'upload',
  //       max_results: 500,
  //       context: true,
  //     });

  //     // Verzamel unieke foldernamen
  //     const categorySet = new Set();

  //     result.resources.forEach((resource) => {
  //       if (resource.folder) {
  //         const folderParts = resource.folder.split('/');
  //         // Gebruik de laatste mapnaam als categorie
  //         if (folderParts.length > 0) {
  //           categorySet.add(folderParts[folderParts.length - 1]);
  //         }
  //       }
  //     });

  //     return Array.from(categorySet);
  //   } catch (fallbackError) {
  //     console.error('Fallback fout bij het ophalen van categorieën:', fallbackError);
  //     return []; // Geef een lege lijst terug als we echt niets kunnen vinden
  //   }
  // }
});
