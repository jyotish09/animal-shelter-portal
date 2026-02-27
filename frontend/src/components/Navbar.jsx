import { AppBar, Toolbar, Box, Button, IconButton, Typography, Stack } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SecurityIcon from '@mui/icons-material/Security';
import PetsIcon from '@mui/icons-material/Pets';
import { NavLink, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Navbar() {
  const { t } = useTranslation();

  return (
    <AppBar position="sticky" elevation={0}>
      <Toolbar sx={{ minHeight: 68 }}>
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Box component={Link} to="/" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, textDecoration: 'none', color: 'text.primary' }}>
            <Box sx={{ width: 36, height: 36, borderRadius: 2, display: 'grid', placeItems: 'center', border: '1px solid', borderColor: 'divider',
              background: 'linear-gradient(135deg, rgba(34,197,94,0.18), rgba(245,158,11,0.18))' }}>
              <PetsIcon fontSize="small" />
            </Box>
            <Typography variant="h6" sx={{ fontFamily: 'Nunito', fontWeight: 900 }}>
              {t('nav.brand')}
            </Typography>
          </Box>
        </Box>

        <Stack direction="row" spacing={1} sx={{ display: { xs: 'none', md: 'flex' } }}>
          <Button component={NavLink} to="/" end
            sx={{ fontWeight: 800, borderRadius: 999, px: 1.5, color: 'text.secondary', '&.active': { color: 'text.primary', bgcolor: 'rgba(34,197,94,0.10)' } }}>
            {t('nav.dogs')}
          </Button>
          <Button href="#how-it-works" sx={{ fontWeight: 800, borderRadius: 999, px: 1.5, color: 'text.secondary' }}>
            {t('nav.howItWorks')}
          </Button>
          <Button href="#about" sx={{ fontWeight: 800, borderRadius: 999, px: 1.5, color: 'text.secondary' }}>
            {t('nav.about')}
          </Button>
        </Stack>

        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1 }}>
          <IconButton aria-label="Search (placeholder)" size="small">
            <SearchIcon />
          </IconButton>

          <Button component={Link} to="/admin" variant="outlined" size="small" startIcon={<SecurityIcon />}
            sx={{ borderRadius: 999, fontWeight: 800 }}>
            {t('nav.admin')}
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
