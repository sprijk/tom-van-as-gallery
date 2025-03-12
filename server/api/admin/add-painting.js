// server/api/admin/add-painting-tag.js
import { v2 as cloudinary } from 'cloudinary';

export default defineEventHandler(async (event) => {
  try {
    // Get request body
    const body = await readBody(event);
    const { imageId, tag } = body;

    if (!imageId || !tag) {
      return createError({
        statusCode: 400,
        statusMessage: 'imageId and tag are required',
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

    // Add tag to the image in Cloudinary
    await cloudinary.uploader.add_tag(tag, [imageId]);

    return {
      success: true,
      message: `Tag ${tag} added to image ${imageId}`,
    };
  } catch (error) {
    console.error('Error adding tag to painting:', error);

    return createError({
      statusCode: 500,
      statusMessage: 'Failed to add tag to painting',
      data: error,
    });
  }
});
