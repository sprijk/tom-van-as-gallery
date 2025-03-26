// server/utils/databaseService.js
import { dirname } from 'path';
import fs from 'fs';
import sqlite3 from 'sqlite3';

/**
 * Initialize the database connection and provide utility functions
 */
export class DatabaseService {
  constructor(dbPath) {
    // Resolve the database path
    this.dbPath = dbPath;
    this.db = null;
    this.initialized = false;
  }

  /**
   * Initialize the database connection
   */
  async init() {
    if (this.initialized) return;

    // Check if the database directory exists
    const dbDir = dirname(this.dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          console.error('Error opening database:', err);
          reject(err);
        } else {
          this.initialized = true;
          console.log(`Connected to SQLite database at ${this.dbPath}`);
          resolve();
        }
      });
    });
  }

  /**
   * Execute a query and return multiple rows
   */
  async query(sql, params = []) {
    await this.init();
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          console.error('Database query error:', err);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  /**
   * Execute a query and return a single row
   */
  async get(sql, params = []) {
    await this.init();
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          console.error('Database get error:', err);
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  /**
   * Execute a query that doesn't return results
   */
  async run(sql, params = []) {
    await this.init();
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function (err) {
        if (err) {
          console.error('Database run error:', err);
          reject(err);
        } else {
          resolve({
            lastID: this.lastID,
            changes: this.changes,
          });
        }
      });
    });
  }

  /**
   * Close the database connection
   */
  async close() {
    if (!this.initialized) return;

    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) {
          console.error('Error closing database:', err);
          reject(err);
        } else {
          this.initialized = false;
          console.log('Database connection closed');
          resolve();
        }
      });
    });
  }

  /**
   * Get all paintings from the database
   */
  async getAllPaintings(includeUnpublished = false) {
    let sql = 'SELECT * FROM images';

    if (!includeUnpublished) {
      sql += ' WHERE published = 1';
    }

    const paintings = await this.query(sql);

    // Transform the data to match the expected format from the API
    return paintings.map((p) => ({
      id: p.publicId,
      title: `Nummer ${p.labelNumber}`,
      imageUrl: `${p.destPath}`,
      destPath: p.destPath,
      category: this.getCategoryFromPath(p.destPath),
      created: p.createdAt,
      labelNumber: p.labelNumber,
      published: p.published === 1,
    }));
  }

  /**
   * Get a single painting by ID
   */
  async getPaintingById(id, includeUnpublished = false) {
    let sql = 'SELECT * FROM images WHERE publicId = ?';

    if (!includeUnpublished) {
      sql += ' AND published = 1';
    }

    const painting = await this.get(sql, [id]);

    if (!painting) return null;

    // Transform the data to match the expected format from the API
    return {
      id: painting.publicId,
      title: `Nummer ${painting.labelNumber}`,
      imageUrl: `${painting.destPath}`,
      destPath: painting.destPath,
      category: this.getCategoryFromPath(painting.destPath),
      created: painting.createdAt,
      labelNumber: painting.labelNumber,
      published: painting.published === 1,
    };
  }

  /**
   * Get all categories from the painting paths in the database
   */
  async getAllCategories() {
    const paintings = await this.getAllPaintings();

    // Extract unique categories
    const categories = new Set();
    paintings.forEach((painting) => {
      if (painting.category) {
        categories.add(painting.category);
      }
    });

    return Array.from(categories);
  }

  /**
   * Update published status of a painting
   */
  async updatePublishedStatus(id, isPublished) {
    const sql = 'UPDATE images SET published = ?, updatedAt = CURRENT_TIMESTAMP WHERE publicId = ?';
    const result = await this.run(sql, [isPublished ? 1 : 0, id]);
    return result.changes > 0;
  }

  /**
   * Update the label number of a painting
   */
  async updateLabelNumber(id, labelNumber) {
    const sql =
      'UPDATE images SET labelNumber = ?, updatedAt = CURRENT_TIMESTAMP WHERE publicId = ?';
    const result = await this.run(sql, [labelNumber, id]);
    return result.changes > 0;
  }

  /**
   * Extract category from the destPath
   */
  getCategoryFromPath(path) {
    if (!path) return '';

    // Path format is expected to be "Tom van As Kunst/CATEGORY/filename.jpg"
    const parts = path.split('/');

    if (parts.length >= 2) {
      // Return the second part which should be the category
      return parts[1];
    }

    return '';
  }
}
