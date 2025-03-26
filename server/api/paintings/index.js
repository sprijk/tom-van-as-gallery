// server/api/paintings/index.js
import { getDatabase } from '../../utils/db';

export default defineEventHandler(async (event) => {
  // Check if this is an admin request
  const isAdmin = event.path.includes('/admin') || event.headers.get('x-is-admin') === 'true';

  try {
    const db = await getDatabase();
    const paintings = await db.getAllPaintings(isAdmin);

    return paintings;
  } catch (error) {
    console.error('Error fetching paintings:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error fetching paintings',
      data: error,
    });
  }
});
