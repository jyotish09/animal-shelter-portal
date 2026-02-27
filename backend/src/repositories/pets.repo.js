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
 * List pets with offset pagination and search.
 *
 * Search behavior:
 * - matches against name OR breed
 * - case-insensitive via LOWER(...)
 *
 * @param {import('sqlite').Database} db
 * @param {{ search?: string, status?: string, page?: number, limit?: number }} [opts]
 * @returns {Promise<{items: any[], total: number}>}
 */
async function listPetsPaged(db, opts = {}) {
  const page = Number(opts.page ?? 1);
  const limit = Number(opts.limit ?? 20);
  const offset = (page - 1) * limit;

  const params = [];
  const where = [];

  if (opts.status) {
    where.push('status = ?');
    params.push(opts.status);
  }

  if (opts.search) {
    const searchLike = `%${String(opts.search).toLowerCase()}%`;
    where.push('(LOWER(name) LIKE ? OR LOWER(breed) LIKE ?)');
    params.push(searchLike, searchLike);
  }

  const whereSql = where.length ? ` WHERE ${where.join(' AND ')}` : '';

  const totalRow = await db.get(
    `SELECT COUNT(*) AS total FROM pets${whereSql}`,
    params
  );

  const rows = await db.all(
    `SELECT *
     FROM pets${whereSql}
     ORDER BY created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return {
    items: rows.map(mapPet),
    total: Number(totalRow.total)
  };
}

/**
 * Get a pet by ID.
 *
 * @param {import('sqlite').Database} db
 * @param {string} petId
 */
async function getPetById(db, petId) {
  const row = await db.get('SELECT * FROM pets WHERE id = ?', [petId]);
  return row ? mapPet(row) : null;
}

/**
 * Update a pet's status and return the updated pet.
 *
 * @param {import('sqlite').Database} db
 * @param {string} petId
 * @param {string} status
 */
async function updatePetStatus(db, petId, status) {
  await db.run('UPDATE pets SET status = ? WHERE id = ?', [status, petId]);
  return getPetById(db, petId);
}

module.exports = { listPetsPaged, getPetById, updatePetStatus };