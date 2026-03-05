import { httpJson } from './http';

/**
 * GET /api/admin/applications (paginated)
 * Query: status?, search?, page?, limit?
 */
export function fetchAdminApplications({ status, search, page, limit }) {
  return httpJson('/api/admin/applications', {
    query: { status, search, page, limit }
  });
}

/**
 * PATCH /api/admin/applications/:applicationId/approve
 */
export function approveApplication(applicationId) {
  return httpJson(`/api/admin/applications/${applicationId}/approve`, {
    method: 'PATCH'
  });
}

/**
 * GET /api/admin/pets/:petId/applications (paginated)
 * Optional: drill-down for a single pet.
 */
export function fetchApplicationsForPet({ petId, page, limit }) {
  return httpJson(`/api/admin/pets/${petId}/applications`, {
    query: { page, limit }
  });
}

/**
 * POST /api/admin/pets
 * multipart/form-data
 */
export async function createAdminPet(formData) {
  const res = await fetch('/api/admin/pets', {
    method: 'POST',
    body: formData
  });

  const text = await res.text();
  let json = null;

  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }

  if (!res.ok) {
    const message = json?.error?.message || `Request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    err.payload = json;
    throw err;
  }

  return json;
}
