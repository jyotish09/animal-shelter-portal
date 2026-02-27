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
 * - status is not strictly validated yet (kept flexible).
 * - page/limit validated and coerced to numbers.
 */
const listPetsQuerySchema = paginationQuerySchema.extend({
  status: z.string().optional()
});

/**
 * GET /api/pets?status=AVAILABLE&page=1&limit=20
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
