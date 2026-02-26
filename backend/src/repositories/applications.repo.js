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

async function listApplications(db, opts = {}) {
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

  const sql =
    "SELECT * FROM applications" +
    (where.length ? " WHERE " + where.join(" AND ") : "") +
    " ORDER BY created_at DESC";

  const rows = await db.all(sql, params);
  return rows.map(mapApplication);
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

async function listApplicationsForPet(db, petId) {
  const rows = await db.all(
    "SELECT * FROM applications WHERE pet_id = ? ORDER BY created_at DESC",
    [petId]
  );
  return rows.map(mapApplication);
}

module.exports = {
  createApplication,
  getApplicationById,
  listApplications,
  listApplicationsForPet,
  markApproved,
  invalidateOtherSubmitted
};
