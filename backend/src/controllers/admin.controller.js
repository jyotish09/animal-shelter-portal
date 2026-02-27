/**
 * src/controllers/admin.controller.js
 *
 * Admin controllers (no auth per requirements).
 */

const adoptionService = require('../services/adoption.service');

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
    const { status, petId, page = 1, limit = 20 } = req.query;

    const { items, total } = await adoptionService.listApplications({
      status,
      petId,
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

module.exports = {
  listApplications,
  listApplicationsForPet,
  approveApplication
};
