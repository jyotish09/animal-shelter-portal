/**
 * src/middleware/error.middleware.js
 *
 * Central error handling middleware.
 *
 * - Converts thrown errors into consistent JSON responses.
 * - Logs server-side errors with context.
 *
 * Error response shape:
 *   { error: { code, message, details? }, requestId }
 */

const { logger } = require('../utils/logger');

class HttpError extends Error {
  /**
   * @param {number} status
   * @param {string} code
   * @param {string} message
   * @param {any} [details]
   */
  constructor(status, code, message, details) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

/**
 * @param {string} message
 * @param {any} [details]
 */
function badRequest(message, details) {
  return new HttpError(400, 'BAD_REQUEST', message, details);
}

/**
 * @param {string} message
 * @param {any} [details]
 */
function notFound(message, details) {
  return new HttpError(404, 'NOT_FOUND', message, details);
}

/**
 * @param {string} message
 * @param {any} [details]
 */
function conflict(message, details) {
  return new HttpError(409, 'CONFLICT', message, details);
}

/**
 * Express error-handling middleware.
 *
 * @param {any} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} _next
 */
function errorMiddleware(err, req, res, _next) {
  const requestId = req.id;

  if (err && err.name === 'HttpError') {
    const httpErr = /** @type {HttpError} */ (err);
    return res.status(httpErr.status).json({
      error: {
        code: httpErr.code,
        message: httpErr.message,
        details: httpErr.details
      },
      requestId
    });
  }

  if (err && typeof err.message === 'string' && err.message.includes('SQLITE_CONSTRAINT')) {
    logger.warn({ requestId, err }, 'Database constraint error');
    return res.status(409).json({
      error: {
        code: 'DB_CONSTRAINT',
        message: 'Request violates a database constraint.',
        details: err.message
      },
      requestId
    });
  }

  if (err && err.name === 'MulterError') {
    return res.status(400).json({
      error: {
        code: 'UPLOAD_ERROR',
        message:
          err.code === 'LIMIT_FILE_SIZE'
            ? 'Uploaded image is too large.'
            : 'Invalid file upload.'
      },
      requestId
    });
  }

  logger.error({ requestId, err }, 'Unhandled error');
  return res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Unexpected server error.'
    },
    requestId
  });
}

module.exports = {
  HttpError,
  badRequest,
  notFound,
  conflict,
  errorMiddleware
};
