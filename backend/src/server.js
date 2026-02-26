/**
 * src/server.js
 *
 * HTTP server bootstrap.
 */

const { createApp } = require('./app');
const { env } = require('./config/env');
const { logger } = require('./utils/logger');
const { closeDb } = require('./config/db');

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info({ port: env.PORT, env: env.NODE_ENV }, 'Backend server started');
});

async function shutdown(signal) {
  logger.info({ signal }, 'Shutting down');

  server.close(async () => {
    try {
      await closeDb();
    } catch (err) {
      logger.error({ err }, 'Failed to close DB');
    } finally {
      process.exit(0);
    }
  });

  setTimeout(() => {
    logger.error('Forced shutdown');
    process.exit(1);
  }, 10_000).unref();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
