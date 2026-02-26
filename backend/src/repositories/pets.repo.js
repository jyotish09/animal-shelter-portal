/**
 * src/repositories/pets.repo.js
 *
 * Data access methods for `pets`.
 */

function mapPet(row) {
  return {
    id: row.id,
    name: row.name,
    breed: row.breed,
    ageYears: row.age_years,
    status: row.status,
    imageUrl: row.image_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

/**
 * @param {import('sqlite').Database} db
 * @param {{ status?: string }} [opts]
 */
async function listPets(db, opts = {}) {
  const { status } = opts;
  const rows = status
    ? await db.all("SELECT * FROM pets WHERE status = ? ORDER BY created_at DESC", [status])
    : await db.all("SELECT * FROM pets ORDER BY created_at DESC");
  return rows.map(mapPet);
}

/**
 * @param {import('sqlite').Database} db
 * @param {string} petId
 */
async function getPetById(db, petId) {
  const row = await db.get("SELECT * FROM pets WHERE id = ?", [petId]);
  return row ? mapPet(row) : null;
}

/**
 * @param {import('sqlite').Database} db
 * @param {string} petId
 * @param {string} status
 */
async function updatePetStatus(db, petId, status) {
  await db.run("UPDATE pets SET status = ? WHERE id = ?", [status, petId]);
  return getPetById(db, petId);
}

module.exports = { listPets, getPetById, updatePetStatus };
