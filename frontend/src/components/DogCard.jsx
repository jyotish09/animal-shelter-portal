import { useMemo, useState } from 'react';
import { Box, Card, CardContent, CardMedia, Chip, Typography, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import ApplyModal from './ApplyModal';
import { statusChipSx } from './status';

export default function DogCard({ pet }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const photo = pet.imageUrl || '/static/placeholder-dog.jpg';

  const meta = useMemo(() => {
    const age = `${pet.ageYears} yr${pet.ageYears === 1 ? '' : 's'}`;
    return `${humanizeBreed(pet.breed)} • ${age}`;
  }, [pet.ageYears, pet.breed]);

  const canApply = pet.status === 'AVAILABLE';

  const statusLabel =
    pet.status === 'ADOPTED' ? t('home.adopted') : t(`home.filters.${pet.status.toLowerCase()}`);

  return (
    <>
      <Card
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
          transition: 'transform 140ms ease, box-shadow 140ms ease',
          '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 14px 40px rgba(15,23,42,0.12)' }
        }}
        elevation={0}
      >
        <Box sx={{ position: 'relative', p: 1.5, pb: 0 }}>
          <Box
            sx={{
              position: 'absolute',
              top: 14,
              left: 16,
              right: '34%',
              height: 120,
              borderRadius: 999,
              transform: 'rotate(-6deg)',
              background: 'radial-gradient(circle at 20% 30%, rgba(245,158,11,0.22), rgba(34,197,94,0.16))'
            }}
          />
          <CardMedia
            component="img"
            image={photo}
            alt={pet.name}
            sx={{
              position: 'relative',
              borderRadius: 2.5,
              border: '1px solid',
              borderColor: 'divider',
              aspectRatio: '3 / 2',
              objectFit: 'cover',
              backgroundColor: '#EEF2FF'
            }}
            onError={(e) => {
              e.currentTarget.src = '/static/placeholder-dog.jpg';
            }}
          />
          <Chip
            label={statusLabel}
            size="small"
            variant="filled"
            sx={{ position: 'absolute', top: 25, right: 25, fontWeight: 900, ...statusChipSx(pet.status) }}
          />
        </Box>

        <CardContent sx={{ pt: 1.5 }}>
          <Typography variant="h6" sx={{ fontFamily: 'Nunito', fontWeight: 900, lineHeight: 1.2 }}>
            {pet.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontWeight: 600 }}>
            {meta}
          </Typography>

          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            {canApply ? (
              <Button variant="contained" onClick={() => setOpen(true)} sx={{ borderRadius: 999, fontWeight: 900 }}>
                {t('home.apply')}
              </Button>
            ) : pet.status === 'PENDING' ? (
              <Button variant="outlined" disabled sx={{ borderRadius: 999, fontWeight: 900 }}>
                {t('home.pendingReview')}
              </Button>
            ) : null}
          </Box>
        </CardContent>
      </Card>

      <ApplyModal open={open} onClose={() => setOpen(false)} pet={pet} />
    </>
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
