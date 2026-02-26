/**
 * src/utils/id.js
 *
 * ID utilities.
 * We use UUIDs for pets and applications, matching the SQLite schema.
 */

const crypto = require('crypto');

/**
 * Generate a new UUID (Node 18+).
 *
 * @returns {string} uuid
 */
function newId() {
  return crypto.randomUUID();
}

module.exports = { newId };
