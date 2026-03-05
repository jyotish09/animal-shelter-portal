import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createAdminPet } from '../api/admin.api';

/**
 * useCreatePet
 * - creates a new pet via multipart/form-data
 * - refreshes pets + admin applications afterwards
 */
export function useCreatePet() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (formData) => createAdminPet(formData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pets'] });
      qc.invalidateQueries({ queryKey: ['adminApplications'] });
    }
  });
}