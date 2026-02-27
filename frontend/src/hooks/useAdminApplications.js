import { useQuery } from '@tanstack/react-query';
import { fetchAdminApplications } from '../api/admin.api';

/**
 * useAdminApplications
 * - Fetches paginated applications list for admin view
 * - Returns backend envelope: { data, meta, requestId }
 */
export function useAdminApplications({ status, search, page, limit }) {
  return useQuery({
    queryKey: ['adminApplications', { status, search, page, limit }],
    queryFn: () => fetchAdminApplications({ status, search, page, limit }),
    placeholderData: (previousData) => previousData
  });
}
