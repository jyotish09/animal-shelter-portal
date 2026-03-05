/**
 * src/app.js
 *
 * Express app factory.
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const pinoHttp = require('pino-http');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const { env } = require('./config/env');
const { logger } = require('./utils/logger');
const { errorMiddleware } = require('./middleware/error.middleware');
const { healthRouter } = require('./routes/health.routes');
const { petsRouter } = require('./routes/pets.routes');
const { adminRouter } = require('./routes/admin.routes');

function createApp() {
  const app = express();

  const uploadDir = path.resolve(process.cwd(), env.UPLOAD_DIR);
  const petUploadDir = path.join(uploadDir, 'pets');

  fs.mkdirSync(petUploadDir, { recursive: true });

  app.use(helmet());
  app.use(express.json({ limit: '1mb' }));

  app.use(cors({ origin: env.CORS_ORIGIN, credentials: false }));

  app.use(
    pinoHttp({
      logger,
      genReqId: (req, res) => {
        const existing = req.headers['x-request-id'];
        const id = (typeof existing === 'string' && existing.trim()) ? existing : crypto.randomUUID();
        res.setHeader('x-request-id', id);
        return id;
      },
      customLogLevel: (_req, res, err) => {
        if (err || res.statusCode >= 500) return 'error';
        if (res.statusCode >= 400) return 'warn';
        return 'info';
      }
    })
  );

  // Serve uploaded files first
  app.use('/static/uploads', express.static(uploadDir));

  // Existing checked-in assets
  app.use('/static', express.static('src/static'));

  app.use('/api/health', healthRouter);
  app.use('/api/pets', petsRouter);
  app.use('/api/admin', adminRouter);

  app.use((_req, res) => {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found' } });
  });

  app.use(errorMiddleware);

  return app;
}

module.exports = { createApp };
