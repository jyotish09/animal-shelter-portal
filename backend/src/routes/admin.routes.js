/**
 * src/routes/admin.routes.js
 */

const express = require('express');
const { validate } = require('../middleware/validate.middleware');
const adminController = require('../controllers/admin.controller');
const {
  approveParamsSchema,
  listApplicationsQuerySchema,
  petParamsSchema
} = require('../validators/applications.schemas');

const router = express.Router();

router.get('/applications', validate({ query: listApplicationsQuerySchema }), adminController.listApplications);

router.get('/pets/:petId/applications', validate({ params: petParamsSchema }), adminController.listApplicationsForPet);

router.patch('/applications/:applicationId/approve', validate({ params: approveParamsSchema }), adminController.approveApplication);

module.exports = { adminRouter: router };
