// server/api/admin/add-tag.js
import { v2 as cloudinary } from 'cloudinary';

export default defineEventHandler(async (event) => {
  try {
    // Get request body
    const body = await readBody(event);
    const { tag } = body;

    if (!tag) {
      return createError({
        statusCode: 400,
        statusMessage: 'tag is required',
      });
    }

    // In a real implementation, you would add a tag to Cloudinary's tag database
    // or store it in your own database
    // This is a simplified example that assumes you're maintaining tags in Cloudinary

    // Get runtime config to set up Cloudinary
    const config = useRuntimeConfig();

    // Configure Cloudinary
    cloudinary.config({
      cloud_name: config.cloudinaryCloudName,
      api_key: config.cloudinaryApiKey,
      api_secret: config.cloudinaryApiSecret,
    });

    // For simplicity, we're just returning success here
    // In a real implementation, you would handle storage of the new tag

    return {
      success: true,
      message: `Tag ${tag} added successfully`,
    };
  } catch (error) {
    console.error('Error adding tag:', error);

    return createError({
      statusCode: 500,
      statusMessage: 'Failed to add tag',
      data: error,
    });
  }
});
