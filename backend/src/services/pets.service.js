/**
 * Pet read operations.
 */

const { getDb } = require('../config/db');
const petsRepo = require('../repositories/pets.repo');
const { newId } = require('../utils/id');

/**
 * List pets with offset pagination and filters.
 *
 * @param {{
 *   search?: string,
 *   status?: string,
 *   ageGroup?: 'PUPPY' | 'ADULT' | 'SENIOR',
 *   page?: number,
 *   limit?: number
 * }} [opts]
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

/**
 * Create a new pet for the shelter.
 *
 * @param {{
 *   name: string,
 *   breed: string,
 *   ageYears: number,
 *   imageUrl: string
 * }} payload
 */
async function createPet(payload) {
  const db = await getDb();

  return petsRepo.createPet(db, {
    id: newId(),
    name: payload.name,
    breed: payload.breed,
    ageYears: payload.ageYears,
    status: 'AVAILABLE',
    imageUrl: payload.imageUrl
  });
}

module.exports = { listPets, getPet, createPet };
