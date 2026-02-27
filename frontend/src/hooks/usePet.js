import { useQuery } from '@tanstack/react-query';
import { fetchPet } from '../api/pets.api';

/**
 * usePet
 * - Fetches a single pet by ID
 * - Returns backend envelope: { data, requestId }
 */
export function usePet(petId, { enabled = true } = {}) {
  return useQuery({
    queryKey: ['pet', petId],
    queryFn: () => fetchPet(petId),
    enabled: Boolean(petId) && enabled
  });
}
