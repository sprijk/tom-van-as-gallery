// server/api/tags.js
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
    // Verzamel alle tags direct uit alle resources
    const result = await cloudinary.api.resources({
      type: "upload",
      max_results: 500,
      tags: true,
    });

    // Set gebruiken voor unieke tags
    const allTags = new Set();

    // Verzamel tags uit alle resources
    result.resources.forEach((resource) => {
      const tags = resource.tags || [];
      // Filter title: tags eruit
      const regularTags = tags.filter((tag) => !tag.startsWith("title:"));

      regularTags.forEach((tag) => {
        allTags.add(tag);
      });
    });

    return Array.from(allTags);
  } catch (error) {
    console.error("Fout bij het ophalen van tags:", error);
    return []; // Return lege array bij fout
  }
});
