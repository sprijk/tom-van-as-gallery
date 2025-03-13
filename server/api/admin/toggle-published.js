// server/api/admin/toggle-published.js
import { v2 as cloudinary } from 'cloudinary';

export default defineEventHandler(async (event) => {
  try {
    // Get request body
    const body = await readBody(event);
    const { imageId, published } = body;

    if (!imageId) {
      return createError({
        statusCode: 400,
        statusMessage: 'imageId is required',
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

    // Convert boolean to string for cloudinary context
    const publishedValue = published ? 'true' : 'false';

    // Update metadata in Cloudinary to set published state
    const result = await cloudinary.uploader.add_context(`published=${publishedValue}`, [imageId]);

    console.log(`Image ${imageId} publish state changed to ${publishedValue}`);

    // Return success response
    return {
      success: true,
      message: `Image ${imageId} publish state changed to ${publishedValue}`,
      data: result,
    };
  } catch (error) {
    console.error('Error toggling published state:', error);

    return createError({
      statusCode: 500,
      statusMessage: 'Failed to toggle published state',
      data: error,
    });
  }
});
