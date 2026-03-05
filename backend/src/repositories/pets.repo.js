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
 * List pets with offset pagination and filters.
 *
 * Supported filters:
 * - status
 * - search: matches name OR breed (case-insensitive)
 * - ageGroup:
 *   - PUPPY => age_years <= 1
 *   - ADULT => age_years BETWEEN 2 AND 7
 *   - SENIOR => age_years >= 8
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

  if (opts.ageGroup === 'PUPPY') {
    where.push('age_years <= ?');
    params.push(1);
  } else if (opts.ageGroup === 'ADULT') {
    where.push('age_years BETWEEN ? AND ?');
    params.push(2, 7);
  } else if (opts.ageGroup === 'SENIOR') {
    where.push('age_years >= ?');
    params.push(8);
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

/**
 * Create a new pet.
 *
 * @param {import('sqlite').Database} db
 * @param {{
 *   id: string,
 *   name: string,
 *   breed: string,
 *   ageYears: number,
 *   status: 'AVAILABLE' | 'PENDING' | 'ADOPTED',
 *   imageUrl: string
 * }} pet
 */
async function createPet(db, pet) {
  await db.run(
    `INSERT INTO pets(id, name, breed, age_years, status, image_url)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      pet.id,
      pet.name,
      pet.breed,
      pet.ageYears,
      pet.status,
      pet.imageUrl
    ]
  );

  return getPetById(db, pet.id);
}

module.exports = {
  listPetsPaged,
  getPetById,
  updatePetStatus,
  createPet
};
