// server/api/categories.js
import { getDatabase } from '../utils/db';

export default defineEventHandler(async () => {
  try {
    const db = await getDatabase();
    const categories = await db.getAllCategories();

    return categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    // Return the hardcoded list as a fallback
    return [
      'VROEG WERK (1950 - 1965)',
      'LANDSCHAPPEN - NEDERLAND',
      'LANDSCHAPPEN - BUITENLAND',
      'ATELIER WERK',
      'ANDERE (bevriende) KUNSTENAARS',
    ];
  }
});
