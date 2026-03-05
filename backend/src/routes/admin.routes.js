/**
 * src/routes/admin.routes.js
 *
 * Admin routes (no auth per requirements).
 */

const express = require('express');
const { validate } = require('../middleware/validate.middleware');
const { uploadPetImage } = require('../middleware/upload.middleware');
const adminController = require('../controllers/admin.controller');
const {
  approveParamsSchema,
  listApplicationsQuerySchema,
  petParamsSchema
} = require('../validators/applications.schemas');
const {
  createPetBodySchema,
  validatePetImageSource
} = require('../validators/admin-pets.schemas');
const { paginationQuerySchema } = require('../validators/pagination.schemas');

const router = express.Router();

/**
 * GET /api/admin/applications?status=SUBMITTED&search=lola&page=1&limit=10
 */
router.get(
  '/applications',
  validate({ query: listApplicationsQuerySchema.merge(paginationQuerySchema) }),
  adminController.listApplications
);

/**
 * GET /api/admin/pets/:petId/applications?page=1&limit=20
 */
router.get(
  '/pets/:petId/applications',
  validate({ params: petParamsSchema, query: paginationQuerySchema }),
  adminController.listApplicationsForPet
);

/**
 * PATCH /api/admin/applications/:applicationId/approve
 */
router.patch(
  '/applications/:applicationId/approve',
  validate({ params: approveParamsSchema }),
  adminController.approveApplication
);

/**
 * POST /api/admin/pets
 * multipart/form-data
 *
 * Fields:
 * - name
 * - breed
 * - ageYears
 * - imageFile (optional, mutually exclusive with imageUrl)
 * - imageUrl (optional, mutually exclusive with imageFile)
 */
router.post(
  '/pets',
  uploadPetImage.single('imageFile'),
  validate({ body: createPetBodySchema }),
  validatePetImageSource,
  adminController.createPet
);

module.exports = { adminRouter: router };