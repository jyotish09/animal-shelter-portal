import { useMemo, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  InputAdornment,
  Chip,
  Stack,
  FormControl,
  Select,
  MenuItem,
  Grid,
  Pagination,
  Skeleton,
  Alert
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useTranslation } from 'react-i18next';
import DogCard from '../components/DogCard';
import { PET_STATUS } from '../components/status';
import { usePets } from '../hooks/usePets';

export default function HomePage() {
  const { t } = useTranslation();

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(PET_STATUS.ALL);
  const [age, setAge] = useState('ANY');
  const [page, setPage] = useState(1);
  const limit = 12;

  const statusParam = status === PET_STATUS.ALL ? undefined : status;

  const petsQuery = usePets({ status: statusParam, page, limit });
  const pets = petsQuery.data?.data || [];
  const meta = petsQuery.data?.meta;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return pets.filter((p) => {
      const matchesSearch = !q || p.name.toLowerCase().includes(q) || (p.breed || '').toLowerCase().includes(q);

      const matchesAge =
        age === 'ANY' ||
        (age === 'PUPPY' && p.ageYears <= 1) ||
        (age === 'ADULT' && p.ageYears >= 2 && p.ageYears <= 7) ||
        (age === 'SENIOR' && p.ageYears >= 8);

      return matchesSearch && matchesAge;
    });
  }, [pets, search, age]);

  const countLabel = meta?.total ? `${meta.total} dogs` : `${filtered.length} dogs`;

  return (
    <Box>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.25, md: 3 },
          borderRadius: 4,
          background:
            'radial-gradient(800px 300px at 20% 0%, rgba(34,197,94,0.16), transparent 60%),' +
            'radial-gradient(700px 260px at 90% 20%, rgba(245,158,11,0.18), transparent 55%),' +
            '#FFFFFF'
        }}
      >
        <Typography variant="h3" sx={{ fontFamily: 'Nunito', fontWeight: 900, lineHeight: 1.1 }}>
          {t('home.headline')}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1, fontWeight: 600 }}>
          {t('home.subtext')}
        </Typography>

        <Box
          sx={{
            mt: 2.25,
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1.35fr 1fr' },
            gap: 1.5,
            alignItems: 'center'
          }}
        >
          <Stack spacing={1.25}>
            <TextField
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('home.searchPlaceholder')}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                )
              }}
            />

            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
              <Chip
                label={t('home.filters.all')}
                clickable
                onClick={() => { setStatus(PET_STATUS.ALL); setPage(1); }}
                variant={status === PET_STATUS.ALL ? 'filled' : 'outlined'}
                color={status === PET_STATUS.ALL ? 'primary' : 'default'}
                sx={{ fontWeight: 900 }}
              />
              <Chip
                label={t('home.filters.available')}
                clickable
                onClick={() => { setStatus(PET_STATUS.AVAILABLE); setPage(1); }}
                variant={status === PET_STATUS.AVAILABLE ? 'filled' : 'outlined'}
                color={status === PET_STATUS.AVAILABLE ? 'primary' : 'default'}
                sx={{ fontWeight: 900 }}
              />
              <Chip
                label={t('home.filters.pending')}
                clickable
                onClick={() => { setStatus(PET_STATUS.PENDING); setPage(1); }}
                variant={status === PET_STATUS.PENDING ? 'filled' : 'outlined'}
                color={status === PET_STATUS.PENDING ? 'primary' : 'default'}
                sx={{ fontWeight: 900 }}
              />
              <Chip
                label={t('home.filters.adopted')}
                clickable
                onClick={() => { setStatus(PET_STATUS.ADOPTED); setPage(1); }}
                variant={status === PET_STATUS.ADOPTED ? 'filled' : 'outlined'}
                color={status === PET_STATUS.ADOPTED ? 'primary' : 'default'}
                sx={{ fontWeight: 900 }}
              />
            </Stack>
          </Stack>

          <Stack direction="row" spacing={1.25} sx={{ justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
            <FormControl size="medium" sx={{ minWidth: 180 }}>
              <Select value={age} onChange={(e) => setAge(e.target.value)} displayEmpty>
                <MenuItem value="ANY">{t('home.age.any')}</MenuItem>
                <MenuItem value="PUPPY">{t('home.age.puppy')}</MenuItem>
                <MenuItem value="ADULT">{t('home.age.adult')}</MenuItem>
                <MenuItem value="SENIOR">{t('home.age.senior')}</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Box>
      </Paper>

      <Box sx={{ mt: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', mb: 1.5 }}>
          <Typography variant="h6" sx={{ fontFamily: 'Nunito', fontWeight: 900 }}>
            {t('home.sectionTitle')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
            {countLabel}
          </Typography>
        </Box>

        {petsQuery.isError ? <Alert severity="error">{petsQuery.error?.message || t('common.error')}</Alert> : null}

        <Grid container spacing={2}>
          {petsQuery.isLoading
            ? Array.from({ length: 12 }).map((_, idx) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={idx}>
                  <Paper elevation={0} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                    <Skeleton variant="rectangular" height={160} />
                    <Box sx={{ p: 2 }}>
                      <Skeleton width="70%" />
                      <Skeleton width="55%" />
                      <Skeleton width="40%" />
                    </Box>
                  </Paper>
                </Grid>
              ))
            : filtered.map((pet) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={pet.id}>
                  <DogCard pet={pet} />
                </Grid>
              ))}
        </Grid>

        {meta?.totalPages && meta.totalPages > 1 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination count={meta.totalPages} page={meta.page} onChange={(_, p) => setPage(p)} color="primary" shape="rounded" />
          </Box>
        ) : null}

        <Box id="how-it-works" sx={{ mt: 6, scrollMarginTop: 90 }}>
          <Typography variant="h6" sx={{ fontFamily: 'Nunito', fontWeight: 900 }}>How it works</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.75, fontWeight: 600 }}>
            Pick a dog, apply in under a minute, and we’ll contact you to meet your new best friend.
          </Typography>
        </Box>

        <Box id="about" sx={{ mt: 4, scrollMarginTop: 90 }}>
          <Typography variant="h6" sx={{ fontFamily: 'Nunito', fontWeight: 900 }}>About</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.75, fontWeight: 600 }}>
            HappyPaws is a friendly local shelter helping dogs find loving homes.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
