// server/api/admin/verify-label.js
import { v2 as cloudinary } from 'cloudinary';

export default defineEventHandler(async (event) => {
  try {
    // Get request body
    const body = await readBody(event);
    const { imageId, labelNumber } = body;

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

    // Update metadata in Cloudinary to mark as verified
    // Setting a verified flag in the context
    await cloudinary.uploader.add_context('verified=true', [imageId]);

    // If a labelNumber is provided, also ensure it's set correctly
    if (labelNumber) {
      await cloudinary.uploader.add_context(`label_number=${labelNumber}`, [imageId]);
    }

    // Return success response
    return {
      success: true,
      message: `Image ${imageId} has been verified${labelNumber ? ` with label number ${labelNumber}` : ''}`,
    };
  } catch (error) {
    console.error('Error verifying label:', error);

    return createError({
      statusCode: 500,
      statusMessage: 'Failed to verify label',
      data: error,
    });
  }
});
