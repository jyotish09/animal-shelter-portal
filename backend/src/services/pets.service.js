/**
 * src/services/pets.service.js
 *
 * Pet read operations.
 */

const { getDb } = require('../config/db');
const petsRepo = require('../repositories/pets.repo');

/**
 * List pets with offset pagination.
 *
 * @param {{ status?: string, page?: number, limit?: number }} [opts]
 * @returns {Promise<{items: any[], total: number}>}
 */
async function listPets(opts = {}) {
  const db = await getDb();
  return petsRepo.listPetsPaged(db, opts);
}

/**
 * Get a pet by ID.
 *
 * @param {string} petId
 */
async function getPet(petId) {
  const db = await getDb();
  return petsRepo.getPetById(db, petId);
}

module.exports = { listPets, getPet };
