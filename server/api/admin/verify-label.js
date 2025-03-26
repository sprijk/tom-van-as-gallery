// server/api/admin/verify-label.js
import { getDatabase } from '../../utils/db';

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

    if (!labelNumber) {
      return createError({
        statusCode: 400,
        statusMessage: 'labelNumber is required',
      });
    }

    // For now, verification just ensures the label exists in the database
    // We could add a "verified" column in the future if needed
    const db = await getDatabase();
    const painting = await db.getPaintingById(imageId, true);

    if (!painting) {
      return createError({
        statusCode: 404,
        statusMessage: `Image with ID ${imageId} not found`,
      });
    }

    if (painting.labelNumber !== labelNumber) {
      return createError({
        statusCode: 400,
        statusMessage: `Label number mismatch. Database has ${painting.labelNumber} but received ${labelNumber}`,
      });
    }

    return {
      success: true,
      message: `Label number ${labelNumber} verified successfully for image ${imageId}`,
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
