export const PET_STATUS = {
  ALL: 'ALL',
  AVAILABLE: 'AVAILABLE',
  PENDING: 'PENDING',
  ADOPTED: 'ADOPTED'
};

export function statusChipSx(status) {
  if (status === 'AVAILABLE') return { bgcolor: 'rgba(254, 255, 255, 0.85)', color: '#166534', borderColor: 'rgba(34,197,94,0.25)' };
  if (status === 'PENDING') return { bgcolor: 'rgba(245, 159, 11, 0.85)', color: '#92400E', borderColor: 'rgba(245,158,11,0.25)' };
  return { bgcolor: 'rgba(15,23,42,0.10)', color: '#0F172A', borderColor: 'rgba(15,23,42,0.20)' };
}
