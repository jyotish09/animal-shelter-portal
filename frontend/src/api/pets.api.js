import { httpJson } from './http';

/**
 * GET /api/pets (paginated)
 * Query: search?, status?, ageGroup?, page?, limit?
 */
export function fetchPets({ search, status, ageGroup, page, limit }) {
  return httpJson('/api/pets', {
    query: { search, status, ageGroup, page, limit }
  });
}

/**
 * GET /api/pets/:petId
 */
export function fetchPet(petId) {
  return httpJson(`/api/pets/${petId}`);
}

/**
 * POST /api/pets/:petId/applications
 */
export function applyForAdoption(petId, payload) {
  return httpJson(`/api/pets/${petId}/applications`, {
    method: 'POST',
    body: payload
  });
}