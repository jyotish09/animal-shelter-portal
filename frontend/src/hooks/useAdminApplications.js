import { useQuery } from '@tanstack/react-query';
import { fetchAdminApplications } from '../api/admin.api';

/**
 * useAdminApplications
 * - Fetches paginated applications list for admin view
 * - Returns backend envelope: { data, meta, requestId }
 */
export function useAdminApplications({ status, petId, page, limit }) {
  return useQuery({
    queryKey: ['adminApplications', { status, petId, page, limit }],
    queryFn: () => fetchAdminApplications({ status, petId, page, limit }),
    keepPreviousData: true
  });
}
