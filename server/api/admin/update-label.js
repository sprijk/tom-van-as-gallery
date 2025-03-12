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

    // update the label_number in resource.context.custom.label_number
    const result = await cloudinary.api.update(imageId, {
      context: {
        custom: {
          label_number: labelNumber,
        },
      },
    });

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
