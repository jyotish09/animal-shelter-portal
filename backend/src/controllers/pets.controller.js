/**
 * src/controllers/pets.controller.js
 *
 * HTTP controllers for pet endpoints.
 * Controllers should:
 * - Read validated request data
 * - Call services
 * - Return JSON
 */

const petsService = require('../services/pets.service');
const { notFound } = require('../middleware/error.middleware');

function paginationMeta(page, limit, total) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return { page, limit, total, totalPages };
}

/**
 * GET /api/pets
 * Query:
 * - status?: string
 * - page?: number (default 1)
 * - limit?: number (default 20)
 */
async function listPets(req, res, next) {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const { items, total } = await petsService.listPets({
      status,
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
 * GET /api/pets/:petId
 */
async function getPet(req, res, next) {
  try {
    const { petId } = req.params;
    const pet = await petsService.getPet(petId);
    if (!pet) throw notFound('Pet not found', { petId });
    return res.json({ data: pet, requestId: req.id });
  } catch (err) {
    return next(err);
  }
}

module.exports = { listPets, getPet };
