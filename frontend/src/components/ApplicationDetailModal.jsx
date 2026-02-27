import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Chip,
  Stack,
  Typography,
  Divider,
  Skeleton,
  Alert
} from '@mui/material';
import { useMemo } from 'react';
import { usePet } from '../hooks/usePet';
import { statusChipSx } from './status';

function shortId(id) {
  if (!id) return '';
  return `${id.slice(0, 8)}…${id.slice(-4)}`;
}

export default function ApplicationDetailModal({ open, onClose, application }) {
  const petId = application?.petId;
  const petQuery = usePet(petId, { enabled: open });

  const pet = petQuery.data?.data;

  const petMeta = useMemo(() => {
    if (!pet) return '';
    const age = `${pet.ageYears} yr${pet.ageYears === 1 ? '' : 's'}`;
    return `${humanizeBreed(pet.breed)} • ${age}`;
  }, [pet]);

  const photo = pet?.imageUrl || '/static/placeholder-dog.jpg';

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ fontFamily: 'Nunito', fontWeight: 900 }}>
        Application Details
      </DialogTitle>

      <DialogContent dividers>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          {/* Pet panel */}
          <Box sx={{ width: { xs: '100%', md: 360 } }}>
            <Typography sx={{ fontWeight: 900, mb: 1 }}>Pet</Typography>

            {petQuery.isError ? (
              <Alert severity="error">{petQuery.error?.message || 'Failed to load pet.'}</Alert>
            ) : (
              <Box
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 3,
                  overflow: 'hidden',
                  bgcolor: 'background.paper'
                }}
              >
                {petQuery.isLoading ? (
                  <Skeleton variant="rectangular" height={210} />
                ) : (
                  <Box sx={{ position: 'relative' }}>
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 14,
                        left: 14,
                        right: '38%',
                        height: 110,
                        borderRadius: 999,
                        transform: 'rotate(-6deg)',
                        background:
                          'radial-gradient(circle at 20% 30%, rgba(245,158,11,0.22), rgba(34,197,94,0.16))'
                      }}
                    />
                    <Box
                      component="img"
                      src={photo}
                      alt={pet?.name || 'Pet'}
                      onError={(e) => (e.currentTarget.src = '/static/placeholder-dog.jpg')}
                      sx={{
                        position: 'relative',
                        width: '100%',
                        aspectRatio: '3 / 2',
                        objectFit: 'cover',
                        borderBottom: '1px solid',
                        borderColor: 'divider'
                      }}
                    />
                    {pet ? (
                      <Chip
                        label={pet.status === 'ADOPTED' ? 'Adopted 🎉' : pet.status}
                        size="small"
                        variant="outlined"
                        sx={{
                          position: 'absolute',
                          top: 16,
                          right: 16,
                          fontWeight: 900,
                          ...statusChipSx(pet.status)
                        }}
                      />
                    ) : null}
                  </Box>
                )}

                <Box sx={{ p: 2 }}>
                  {petQuery.isLoading ? (
                    <>
                      <Skeleton width="70%" />
                      <Skeleton width="50%" />
                    </>
                  ) : pet ? (
                    <>
                      <Typography sx={{ fontFamily: 'Nunito', fontWeight: 900, fontSize: 18 }}>
                        {pet.name}
                      </Typography>
                      <Typography color="text.secondary" sx={{ fontWeight: 600, mt: 0.25 }}>
                        {petMeta}
                      </Typography>
                    </>
                  ) : (
                    <Typography color="text.secondary">No pet data.</Typography>
                  )}
                </Box>
              </Box>
            )}
          </Box>

          {/* Application panel */}
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontWeight: 900, mb: 1 }}>Application</Typography>

            <Box
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 3,
                p: 2,
                bgcolor: 'background.paper'
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5, flexWrap: 'wrap' }}>
                <Chip
                  label={application?.status || '—'}
                  size="small"
                  variant="outlined"
                  sx={{
                    fontWeight: 900,
                    ...(application?.status === 'SUBMITTED'
                      ? { bgcolor: 'rgba(245,158,11,0.12)', color: '#92400E', borderColor: 'rgba(245,158,11,0.25)' }
                      : application?.status === 'APPROVED'
                      ? { bgcolor: 'rgba(34,197,94,0.12)', color: '#166534', borderColor: 'rgba(34,197,94,0.25)' }
                      : { bgcolor: 'rgba(15,23,42,0.10)', color: '#0F172A', borderColor: 'rgba(15,23,42,0.20)' })
                  }}
                />
                <Typography color="text.secondary" sx={{ fontWeight: 700 }}>
                  Application ID: <span style={{ fontFamily: 'monospace' }}>{shortId(application?.id)}</span>
                </Typography>
              </Stack>

              <DetailRow label="Applicant" value={application?.applicantName} />
              <DetailRow label="Contact" value={application?.contact} monospace />
              <DetailRow label="Created" value={application?.createdAt} />
              <Divider sx={{ my: 1.5 }} />
              <Typography sx={{ fontWeight: 900, mb: 0.5 }}>Reason</Typography>
              <Typography color="text.secondary" sx={{ fontWeight: 600, whiteSpace: 'pre-wrap' }}>
                {application?.reason || '—'}
              </Typography>
            </Box>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button variant="outlined" onClick={onClose} sx={{ borderRadius: 999, fontWeight: 900 }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function DetailRow({ label, value, monospace }) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 1, py: 0.5 }}>
      <Typography color="text.secondary" sx={{ fontWeight: 800 }}>
        {label}
      </Typography>
      <Typography sx={{ fontWeight: 700, fontFamily: monospace ? 'monospace' : 'inherit' }}>
        {value || '—'}
      </Typography>
    </Box>
  );
}

function humanizeBreed(breed) {
  if (!breed) return 'Dog';
  if (breed.includes('/')) {
    const [main, sub] = breed.split('/');
    return `${titleCase(sub)} ${titleCase(main)}`;
  }
  return titleCase(breed);
}

function titleCase(s) {
  return String(s)
    .split(/[\s-_]+/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ');
}
