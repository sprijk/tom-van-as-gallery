// seed.js
import fs from 'fs';
import path from 'path';
import sqlite3 from 'sqlite3';

// Configuration
const DB_PATH = process.env.DB_PATH || './data/database.sqlite';
const JSON_PATH = process.env.JSON_PATH || './data/images.json';

async function seed() {
  console.log('Starting seed process...');

  // Ensure the database directory exists
  const dbDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dbDir)) {
    console.log(`Creating database directory: ${dbDir}`);
    fs.mkdirSync(dbDir, { recursive: true });
  }

  // Create a new database connection
  const db = new sqlite3.Database(DB_PATH);

  // Wrap SQLite operations in promises
  const run = (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve(this);
      });
    });
  };

  const get = (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  };

  try {
    // Create table if it doesn't exist
    await run(`
      CREATE TABLE IF NOT EXISTS images (
        publicId TEXT PRIMARY KEY,
        oldUrl TEXT,
        newUrl TEXT,
        destPath TEXT,
        labelNumber TEXT,
        published INTEGER,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Table verified/created');

    // Read and parse JSON data
    const jsonData = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
    console.log(`Found ${jsonData.length} entries in JSON file`);

    // Insert records but skip existing ones
    let inserted = 0;
    let skipped = 0;

    for (const item of jsonData) {
      // Check if record already exists
      const existing = await get('SELECT publicId FROM images WHERE publicId = ?', [item.publicId]);

      if (!existing) {
        // Convert boolean to integer for SQLite
        const publishedValue = item.published ? 1 : 0;

        await run(
          `INSERT INTO images (publicId, oldUrl, newUrl, destPath, labelNumber, published)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [item.publicId, item.oldUrl, item.newUrl, item.destPath, item.labelNumber, publishedValue]
        );
        inserted++;
      } else {
        skipped++;
      }
    }

    console.log(
      `Seed completed: ${inserted} records inserted, ${skipped} records skipped (already exist)`
    );
  } catch (error) {
    console.error('Error during seed process:', error);
    process.exit(1);
  } finally {
    // Close the database connection
    db.close();
  }
}

// Execute the seed function
seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
