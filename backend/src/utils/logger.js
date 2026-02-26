/**
 * src/utils/logger.js
 *
 * Centralized application logger (Pino).
 *
 * Why:
 * - Structured logs (JSON) are easier to filter/parse than console strings.
 * - Can be reused across routes/services/repositories.
 *
 * Usage:
 *   const { logger } = require('../utils/logger');
 *   logger.info({ petId }, 'Pet fetched');
 */

const pino = require('pino');
const { env } = require('../config/env');

/**
 * Create a Pino logger instance.
 *
 * @returns {import('pino').Logger}
 */
function createLogger() {
  return pino({
    level: env.LOG_LEVEL,
    base: {
      service: 'animal-shelter-backend'
    },
    redact: {
      paths: [
        // If you later add auth or secrets, redact by default.
        'req.headers.authorization'
      ],
      remove: true
    }
  });
}

const logger = createLogger();

module.exports = { logger, createLogger };
