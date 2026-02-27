import { useMutation, useQueryClient } from '@tanstack/react-query';
import { applyForAdoption } from '../api/pets.api';

export function useApplyForAdoption() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ petId, payload }) => applyForAdoption(petId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pets'] });
    }
  });
}
