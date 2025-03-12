// server/api/admin/add-tag.js
import { v2 as cloudinary } from 'cloudinary';

export default defineEventHandler(async (event) => {
  try {
    // Get request body
    const body = await readBody(event);
    // console.log('Body:', body);
    const { labelNumber, imageId } = body;

    if (!imageId) {
      return createError({
        statusCode: 400,
        statusMessage: 'image ID is required',
      });
    }

    if (!labelNumber) {
      return createError({
        statusCode: 400,
        statusMessage: 'label number is required',
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

    await cloudinary.uploader.add_context('verified=true', [imageId]);
    const result = await cloudinary.uploader.add_context(`label_number=${labelNumber}`, [imageId]);

    // get the result status and return the result
    return {
      success: true,
      statusCode: result.status,
      statusMessage: result.message,
      message: `Label number ${labelNumber} added successfully`,
      data: result,
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
