/**
 * src/utils/logger.js
 *
 * Centralized application logger (Pino).
 *
 * Why:
 * - Structured logs (JSON) are easier to filter/parse than console strings.
 * - Can be reused across routes/services/repositories.
 *
 * Dev: pretty, colorized output (pino-pretty)
 * Prod: structured JSON output (machine-friendly)
 *
 * Usage:
 *   const { logger } = require('../utils/logger');
 *   logger.info({ petId }, 'Pet fetched');
 */

const pino = require('pino');
const { env } = require('../config/env');

const isDev = env.NODE_ENV !== 'production';

/**
 * Create a Pino logger instance.
 *
 * @returns {import('pino').Logger}
 */
function createLogger() {
  const baseOptions = {
    level: env.LOG_LEVEL,
    base: {
      service: 'animal-shelter-backend'
    },
    timestamp: pino.stdTimeFunctions.isoTime,

    // Ensure error objects are serialized consistently (type/message/stack).
    serializers: {
      err: pino.stdSerializers.err
    },

    // Redact noisy/sensitive stuff if it ever appears on logs.
    redact: {
      paths: [
        'req.headers.authorization',
        'req.headers.cookie',
        'req.headers.set-cookie'
      ],
      remove: true
    }
  };

  // In dev, pretty-print logs with colors.
  // In prod, keep JSON for ingestion/aggregation.
  const transport = isDev
    ? pino.transport({
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss.l',
          singleLine: true,

          // Make sure pino-pretty treats these keys as error objects
          errorLikeObjectKeys: ['err', 'error'],
          errorProps: 'type,message,stack',

          // Hide noisy defaults (keep "service" visible)
          ignore: 'pid,hostname'
        }
      })
    : undefined;

  return pino(baseOptions, transport);
}

const logger = createLogger();

module.exports = { logger, createLogger };
