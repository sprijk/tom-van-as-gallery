// server/api/admin/update-label.js
import { getDatabase } from '../../utils/db';

export default defineEventHandler(async (event) => {
  try {
    // Get request body
    const body = await readBody(event);
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

    // Update label number in database
    const db = await getDatabase();
    const success = await db.updateLabelNumber(imageId, labelNumber);

    if (!success) {
      return createError({
        statusCode: 404,
        statusMessage: `Image with ID ${imageId} not found`,
      });
    }

    return {
      success: true,
      message: `Label number ${labelNumber} added successfully to image ${imageId}`,
    };
  } catch (error) {
    console.error('Error updating label:', error);

    return createError({
      statusCode: 500,
      statusMessage: 'Failed to update label',
      data: error,
    });
  }
});
