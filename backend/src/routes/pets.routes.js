/**
 * src/routes/pets.routes.js
 *
 * Pet routes (visitor-facing).
 */

const express = require('express');
const { z } = require('zod');
const { validate } = require('../middleware/validate.middleware');
const petsController = require('../controllers/pets.controller');
const applicationsController = require('../controllers/applications.controller');
const {
  petIdParamsSchema,
  petParamsSchema,
  createApplicationBodySchema
} = require('../validators/applications.schemas');
const { paginationQuerySchema } = require('../validators/pagination.schemas');

const router = express.Router();

/**
 * Pets list query:
 * - status: strict enum
 * - search: optional, trimmed, empty string becomes undefined
 * - page/limit validated and coerced to numbers
 */
const listPetsQuerySchema = paginationQuerySchema.extend({
  status: z.enum(['AVAILABLE', 'PENDING', 'ADOPTED']).optional(),
  ageGroup: z.enum(['PUPPY', 'ADULT', 'SENIOR']).optional(),
  search: z.preprocess(
    (value) => {
      if (typeof value !== 'string') return value;
      const trimmed = value.trim();
      return trimmed === '' ? undefined : trimmed;
    },
    z.string().max(100).optional()
  )
});

/**
 * GET /api/pets?search=pug&status=AVAILABLE&ageGroup=PUPPY&page=1&limit=12
 */
router.get('/', validate({ query: listPetsQuerySchema }), petsController.listPets);

/**
 * GET /api/pets/:petId
 */
router.get('/:petId', validate({ params: petParamsSchema }), petsController.getPet);

/**
 * POST /api/pets/:petId/applications
 */
router.post(
  '/:petId/applications',
  validate({ params: petIdParamsSchema, body: createApplicationBodySchema }),
  applicationsController.createApplication
);

module.exports = { petsRouter: router };