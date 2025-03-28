// server/api/paintings/[id].js
import { getDatabase } from '../../utils/db';

export default defineEventHandler(async (event) => {
  const id = event.context.params.id;

  // Check if this is an admin request
  const isAdmin = event.path.includes('/admin') || event.headers.get('x-is-admin') === 'true';

  try {
    const db = await getDatabase();
    const painting = await db.getPaintingById(id, isAdmin);

    if (!painting) {
      console.error(`Painting with ID ${id} not found`);
      throw createError({
        statusCode: 404,
        statusMessage: `Painting with ID ${id} not found`,
      });
    }

    // Add the complete URLs to the painting object
    return painting;
  } catch (error) {
    console.error(`Error fetching painting with ID ${id}:`, error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || `Error fetching painting with ID ${id}`,
      data: error,
    });
  }
});
