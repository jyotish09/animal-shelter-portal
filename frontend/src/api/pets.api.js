import { httpJson } from './http';

export function fetchPets({ status, page, limit }) {
  return httpJson('/api/pets', { query: { status, page, limit } });
}

export function applyForAdoption(petId, payload) {
  return httpJson(`/api/pets/${petId}/applications`, { method: 'POST', body: payload });
}
