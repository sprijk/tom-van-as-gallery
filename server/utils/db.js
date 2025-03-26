// server/utils/db.js
import { DatabaseService } from './databaseService';

let dbInstance = null;

export async function getDatabase() {
  const config = useRuntimeConfig();

  if (!dbInstance) {
    dbInstance = new DatabaseService(config.dbPath);
    await dbInstance.init();
  }

  return dbInstance;
}
