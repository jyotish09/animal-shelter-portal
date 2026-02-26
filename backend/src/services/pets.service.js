/**
 * src/services/pets.service.js
 *
 * Pet read operations.
 */

const { getDb } = require('../config/db');
const petsRepo = require('../repositories/pets.repo');

async function listPets(opts = {}) {
  const db = await getDb();
  return petsRepo.listPets(db, opts);
}

async function getPet(petId) {
  const db = await getDb();
  return petsRepo.getPetById(db, petId);
}

module.exports = { listPets, getPet };
