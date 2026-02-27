import { useQuery } from '@tanstack/react-query';
import { fetchPets } from '../api/pets.api';

export function usePets({ search, status, page, limit }) {
  return useQuery({
    queryKey: ['pets', { search, status, page, limit }],
    queryFn: () => fetchPets({ search, status, page, limit }),
    placeholderData: (previousData) => previousData
  });
}