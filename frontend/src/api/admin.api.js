import { httpJson } from './http';

/**
 * GET /api/admin/applications (paginated)
 * Query: status?, petId?, page?, limit?
 */
export function fetchAdminApplications({ status, petId, page, limit }) {
  return httpJson('/api/admin/applications', {
    query: { status, petId, page, limit }
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
