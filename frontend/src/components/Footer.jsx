import { Box, Container, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <Box component="footer" sx={{ mt: 6, pb: 4 }}>
      <Container maxWidth="lg">
        <Box sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 2 }}>
          <Stack spacing={0.75}>
            <Typography variant="body2" color="text.secondary">{t('footer.contact')}</Typography>
            <Typography variant="body2" color="text.secondary">{t('footer.hours')}</Typography>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
