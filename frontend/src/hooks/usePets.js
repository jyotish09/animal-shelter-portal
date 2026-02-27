import { useQuery } from '@tanstack/react-query';
import { fetchPets } from '../api/pets.api';

export function usePets({ search, status, ageGroup, page, limit }) {
  return useQuery({
    queryKey: ['pets', { search, status, ageGroup, page, limit }],
    queryFn: () => fetchPets({ search, status, ageGroup, page, limit }),
    placeholderData: (previousData) => previousData
  });
}