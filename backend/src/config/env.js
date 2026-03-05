/**
 * src/config/env.js
 *
 * Environment variable parsing and normalization.
 *
 * Why:
 * - Keeps config in one place
 * - Avoids sprinkling process.env access across the codebase
 *
 * This file is intentionally dependency-free.
 */

/**
 * Read an environment variable with a default.
 *
 * @param {string} key
 * @param {string} fallback
 * @returns {string}
 */
function readEnv(key, fallback) {
  const v = process.env[key];
  return (v === undefined || v === null || v === '') ? fallback : String(v);
}

/**
 * Read an environment variable as an integer.
 *
 * @param {string} key
 * @param {number} fallback
 * @returns {number}
 */
function readInt(key, fallback) {
  const v = readEnv(key, String(fallback));
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) ? n : fallback;
}

const env = Object.freeze({
  NODE_ENV: readEnv('NODE_ENV', 'development'),
  PORT: readInt('PORT', 4000),
  DB_PATH: readEnv('DB_PATH', '../db/shelter.sqlite'),
  LOG_LEVEL: readEnv('LOG_LEVEL', 'info'),
  CORS_ORIGIN: readEnv('CORS_ORIGIN', 'http://localhost:5173'),

  // Uploading files to test pet creation.
  UPLOAD_DIR: readEnv('UPLOAD_DIR', './uploads'),
  MAX_UPLOAD_BYTES: readInt('MAX_UPLOAD_BYTES', 15 * 1024 * 1024)
});

module.exports = { env };
