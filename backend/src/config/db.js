/**
 * src/config/db.js
 *
 * SQLite connection management (async).
 *
 * - Uses `sqlite` (promise wrapper) with `sqlite3` driver.
 * - Enables foreign keys for every connection.
 * - Exposes `getDb()` for shared access and `withTransaction()` for atomic workflows.
 *
 * Note:
 * - Schema/migrations are applied by the Python seed script in db/seeds/seed.py.
 * - The backend expects the DB file exists and schema is present.
 */

const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const { env } = require('./env');
const { logger } = require('../utils/logger');

/** @type {Promise<import('sqlite').Database> | null} */
let dbPromise = null;

/**
 * Resolve DB path relative to backend/ when a relative path is provided.
 *
 * @param {string} dbPath
 * @returns {string}
 */
function resolveDbPath(dbPath) {
  if (path.isAbsolute(dbPath)) return dbPath;
  return path.resolve(process.cwd(), dbPath);
}

/**
 * Get a shared database connection (singleton).
 *
 * @returns {Promise<import('sqlite').Database>}
 */
async function getDb() {
  if (!dbPromise) {
    const filename = resolveDbPath(env.DB_PATH);

    logger.info({ filename }, 'Opening SQLite database');

    dbPromise = open({
      filename,
      driver: sqlite3.Database
    }).then(async (db) => {
      await db.exec('PRAGMA foreign_keys = ON;');
      return db;
    });
  }
  return dbPromise;
}

/**
 * Close the shared database connection (for graceful shutdown).
 *
 * @returns {Promise<void>}
 */
async function closeDb() {
  if (!dbPromise) return;
  const db = await dbPromise;
  await db.close();
  dbPromise = null;
}

/**
 * Run a function inside a SQLite transaction.
 *
 * @template T
 * @param {(db: import('sqlite').Database) => Promise<T>} fn
 * @returns {Promise<T>}
 */
async function withTransaction(fn) {
  const db = await getDb();
  await db.exec('BEGIN;');
  try {
    const result = await fn(db);
    await db.exec('COMMIT;');
    return result;
  } catch (err) {
    try {
      await db.exec('ROLLBACK;');
    } catch (rollbackErr) {
      logger.error({ rollbackErr }, 'Failed to rollback transaction');
    }
    throw err;
  }
}

module.exports = { getDb, closeDb, withTransaction };
