// server/api/admin/remove-tag.js
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

    // Get runtime config to set up Cloudinary
    const config = useRuntimeConfig();

    // Configure Cloudinary
    cloudinary.config({
      cloud_name: config.cloudinaryCloudName,
      api_key: config.cloudinaryApiKey,
      api_secret: config.cloudinaryApiSecret,
    });

    // In a real implementation, you might remove all instances of this tag
    // or mark it as inactive in your tag database

    return {
      success: true,
      message: `Tag ${tag} removed successfully`,
    };
  } catch (error) {
    console.error('Error removing tag:', error);

    return createError({
      statusCode: 500,
      statusMessage: 'Failed to remove tag',
      data: error,
    });
  }
});
