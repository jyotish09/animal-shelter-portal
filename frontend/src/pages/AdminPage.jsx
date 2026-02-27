import { Box, Paper, Typography } from '@mui/material';

export default function AdminPage() {
  return (
    <Box>
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h5" sx={{ fontFamily: 'Nunito', fontWeight: 900 }}>Admin</Typography>
        <Typography color="text.secondary" sx={{ mt: 1, fontWeight: 600 }}>
          Placeholder. Admin applications UI will be added next.
        </Typography>
      </Paper>
    </Box>
  );
}
