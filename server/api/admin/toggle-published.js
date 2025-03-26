// server/api/admin/toggle-published.js
import { getDatabase } from '../../utils/db';

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

    // Update published status in database
    const db = await getDatabase();
    const success = await db.updatePublishedStatus(imageId, published);

    if (!success) {
      return createError({
        statusCode: 404,
        statusMessage: `Image with ID ${imageId} not found`,
      });
    }

    return {
      success: true,
      message: `Image ${imageId} publish state changed to ${published}`,
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
