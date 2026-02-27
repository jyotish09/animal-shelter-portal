import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { fetchPet } from '../api/pets.api';

/**
 * usePetsByIds
 * - Fetches multiple pets by id (N queries), cached by React Query
 * - Intended for admin table enrichment (petId -> pet name)
 */
export function usePetsByIds(petIds) {
  const ids = useMemo(() => Array.from(new Set((petIds || []).filter(Boolean))), [petIds]);

  const queries = useQueries({
    queries: ids.map((id) => ({
      queryKey: ['pet', id],
      queryFn: () => fetchPet(id),
      enabled: Boolean(id),
      staleTime: 60_000
    }))
  });

  const petMap = useMemo(() => {
    const map = {};
    for (let i = 0; i < ids.length; i++) {
      const pet = queries[i]?.data?.data;
      if (pet) map[ids[i]] = pet;
    }
    return map;
  }, [ids, queries]);

  return { petMap };
}
