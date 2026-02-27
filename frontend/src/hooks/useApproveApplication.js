import { useMutation, useQueryClient } from '@tanstack/react-query';
import { approveApplication } from '../api/admin.api';

/**
 * useApproveApplication
 * - Approves a submitted application
 * - Invalidates adminApplications and pets lists so UI reflects adoption
 */
export function useApproveApplication() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (applicationId) => approveApplication(applicationId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['adminApplications'] });
      qc.invalidateQueries({ queryKey: ['pets'] });
    }
  });
}
