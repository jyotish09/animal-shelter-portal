/**
 * src/routes/pets.routes.js
 */

const express = require('express');
const { validate } = require('../middleware/validate.middleware');
const petsController = require('../controllers/pets.controller');
const applicationsController = require('../controllers/applications.controller');
const {
  petIdParamsSchema,
  petParamsSchema,
  createApplicationBodySchema
} = require('../validators/applications.schemas');

const router = express.Router();

router.get('/', petsController.listPets);

router.get('/:petId', validate({ params: petParamsSchema }), petsController.getPet);

router.post(
  '/:petId/applications',
  validate({ params: petIdParamsSchema, body: createApplicationBodySchema }),
  applicationsController.createApplication
);

module.exports = { petsRouter: router };
