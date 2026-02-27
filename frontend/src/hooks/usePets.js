import { useQuery } from '@tanstack/react-query';
import { fetchPets } from '../api/pets.api';

export function usePets({ status, page, limit }) {
  return useQuery({
    queryKey: ['pets', { status, page, limit }],
    queryFn: () => fetchPets({ status, page, limit })
  });
}
