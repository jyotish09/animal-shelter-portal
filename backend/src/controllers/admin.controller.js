/**
 * src/controllers/admin.controller.js
 *
 * Admin controllers (no auth per requirements).
 */

const fs = require('fs/promises');

const adoptionService = require('../services/adoption.service');
const petsService = require('../services/pets.service');

function paginationMeta(page, limit, total) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return { page, limit, total, totalPages };
}

/**
 * GET /api/admin/applications
 * Query:
 * - status?: 'SUBMITTED'|'APPROVED'|'INVALIDATED'
 * - petId?: uuid
 * - page?: number (default 1)
 * - limit?: number (default 20)
 */
async function listApplications(req, res, next) {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;

    const { items, total } = await adoptionService.listApplications({
      status,
      search,
      page,
      limit
    });

    return res.json({
      data: items,
      meta: paginationMeta(page, limit, total),
      requestId: req.id
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * GET /api/admin/pets/:petId/applications
 * Query:
 * - page?: number (default 1)
 * - limit?: number (default 20)
 */
async function listApplicationsForPet(req, res, next) {
  try {
    const { petId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const { items, total } = await adoptionService.listApplicationsForPet(petId, {
      page,
      limit
    });

    return res.json({
      data: items,
      meta: paginationMeta(page, limit, total),
      requestId: req.id
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * PATCH /api/admin/applications/:applicationId/approve
 */
async function approveApplication(req, res, next) {
  try {
    const { applicationId } = req.params;
    const result = await adoptionService.approveApplication(applicationId);
    return res.json({ data: result, requestId: req.id });
  } catch (err) {
    return next(err);
  }
}

/**
 * POST /api/admin/pets
 */
async function createPet(req, res, next) {
  const uploadedFile = req.file;

  try {
    const imageUrl = uploadedFile
      ? `/static/uploads/pets/${uploadedFile.filename}`
      : req.body.imageUrl;

    const pet = await petsService.createPet({
      name: req.body.name,
      breed: req.body.breed,
      ageYears: req.body.ageYears,
      imageUrl
    });

    return res.status(201).json({
      data: pet,
      requestId: req.id
    });
  } catch (err) {
    // Clean up uploaded file if DB insert fails
    if (uploadedFile?.path) {
      try {
        await fs.unlink(uploadedFile.path);
      } catch (_cleanupErr) {
        // swallow cleanup errors; original error is more important
      }
    }
    return next(err);
  }
}

module.exports = {
  listApplications,
  listApplicationsForPet,
  approveApplication,
  createPet
};
