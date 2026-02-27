/**
 * src/repositories/applications.repo.js
 *
 * Data access methods for `applications`.
 */

function mapApplication(row) {
  return {
    id: row.id,
    petId: row.pet_id,
    applicantName: row.applicant_name,
    contact: row.contact,
    reason: row.reason,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

async function createApplication(db, app) {
  await db.run(
    `INSERT INTO applications(id, pet_id, applicant_name, contact, reason, status)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [app.id, app.petId, app.applicantName, app.contact, app.reason, app.status]
  );
  return getApplicationById(db, app.id);
}

async function getApplicationById(db, applicationId) {
  const row = await db.get("SELECT * FROM applications WHERE id = ?", [applicationId]);
  return row ? mapApplication(row) : null;
}

/**
 * List applications with offset pagination and optional filters.
 *
 * @param {import('sqlite').Database} db
 * @param {{ status?: string, petId?: string, page?: number, limit?: number }} [opts]
 * @returns {Promise<{items: any[], total: number}>}
 */
async function listApplicationsPaged(db, opts = {}) {
  const page = Number(opts.page ?? 1);
  const limit = Number(opts.limit ?? 20);
  const offset = (page - 1) * limit;

  const params = [];
  const where = [];

  if (opts.status) {
    where.push("status = ?");
    params.push(opts.status);
  }
  if (opts.petId) {
    where.push("pet_id = ?");
    params.push(opts.petId);
  }

  const whereSql = where.length ? " WHERE " + where.join(" AND ") : "";

  const totalRow = await db.get(
    `SELECT COUNT(*) AS total FROM applications${whereSql}`,
    params
  );

  const rows = await db.all(
    `SELECT * FROM applications${whereSql} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return { items: rows.map(mapApplication), total: Number(totalRow.total) };
}

async function markApproved(db, applicationId) {
  await db.run("UPDATE applications SET status = 'APPROVED' WHERE id = ?", [applicationId]);
  return getApplicationById(db, applicationId);
}

async function invalidateOtherSubmitted(db, petId, approvedApplicationId) {
  await db.run(
    `UPDATE applications
     SET status = 'INVALIDATED'
     WHERE pet_id = ?
       AND id <> ?
       AND status = 'SUBMITTED'`,
    [petId, approvedApplicationId]
  );
}

/**
 * List applications for a pet with offset pagination.
 *
 * @param {import('sqlite').Database} db
 * @param {string} petId
 * @param {{ page?: number, limit?: number }} [opts]
 * @returns {Promise<{items: any[], total: number}>}
 */
async function listApplicationsForPetPaged(db, petId, opts = {}) {
  const page = Number(opts.page ?? 1);
  const limit = Number(opts.limit ?? 20);
  const offset = (page - 1) * limit;

  const totalRow = await db.get(
    `SELECT COUNT(*) AS total FROM applications WHERE pet_id = ?`,
    [petId]
  );

  const rows = await db.all(
    `SELECT * FROM applications WHERE pet_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [petId, limit, offset]
  );

  return { items: rows.map(mapApplication), total: Number(totalRow.total) };
}

module.exports = {
  createApplication,
  getApplicationById,
  listApplicationsPaged,
  listApplicationsForPetPaged,
  markApproved,
  invalidateOtherSubmitted
};
