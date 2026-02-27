/**
 * src/validators/pagination.schemas.js
 *
 * Shared pagination query schemas.
 *
 * Uses 1-based `page` with `limit`.
 * - page: default 1, min 1
 * - limit: default 20, min 1, max 100
 *
 * Notes:
 * - Express query params are strings. `z.coerce.number()` converts safely.
 * - The validate middleware overwrites `req.query` with parsed values.
 */

const { z } = require('zod');

const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20).optional()
});

module.exports = { paginationQuerySchema };
