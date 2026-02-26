/**
 * src/middleware/validate.middleware.js
 *
 * Request validation middleware using Zod schemas.
 */

const { badRequest } = require('./error.middleware');

/**
 * Validate request parts using Zod schemas.
 *
 * @param {{ body?: any, params?: any, query?: any }} schemas
 * @returns {import('express').RequestHandler}
 */
function validate(schemas) {
  return (req, _res, next) => {
    try {
      if (schemas.body) {
        const r = schemas.body.safeParse(req.body);
        if (!r.success) throw badRequest('Invalid request body', r.error.flatten());
        req.body = r.data;
      }
      if (schemas.params) {
        const r = schemas.params.safeParse(req.params);
        if (!r.success) throw badRequest('Invalid route params', r.error.flatten());
        req.params = r.data;
      }
      if (schemas.query) {
        const r = schemas.query.safeParse(req.query);
        if (!r.success) throw badRequest('Invalid query params', r.error.flatten());
        req.query = r.data;
      }
      return next();
    } catch (err) {
      return next(err);
    }
  };
}

module.exports = { validate };
