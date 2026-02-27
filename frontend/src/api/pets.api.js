import { httpJson } from './http';

/**
 * GET /api/pets (paginated)
 * Query: search?, status?, page?, limit?
 */
export function fetchPets({ search, status, page, limit }) {
  return httpJson('/api/pets', {
    query: { search, status, page, limit }
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