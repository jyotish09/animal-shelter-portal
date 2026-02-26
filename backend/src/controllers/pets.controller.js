/**
 * src/controllers/pets.controller.js
 */

const petsService = require('../services/pets.service');
const { notFound } = require('../middleware/error.middleware');

async function listPets(req, res, next) {
  try {
    const status = req.query.status;
    const pets = await petsService.listPets(status ? { status } : {});
    return res.json({ data: pets, requestId: req.id });
  } catch (err) {
    return next(err);
  }
}

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
