import { Box, Container, Paper, Typography, Button, Stack } from '@mui/material';
import { isRouteErrorResponse, useRouteError, Link } from 'react-router-dom';

/**
 * RouteErrorPage
 * Custom React Router errorElement to avoid the default dev error UI.
 */
export default function RouteErrorPage() {
  const err = useRouteError();

  let title = 'Something went wrong';
  let message = 'Unexpected application error.';
  let details = '';

  if (isRouteErrorResponse(err)) {
    title = `Error ${err.status}`;
    message = err.statusText || message;
    details = typeof err.data === 'string' ? err.data : '';
  } else if (err instanceof Error) {
    message = err.message || message;
    details = err.stack || '';
  } else if (typeof err === 'string') {
    message = err;
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 6 }}>
        <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
          <Stack spacing={1}>
            <Typography variant="h4" sx={{ fontFamily: 'Nunito', fontWeight: 900 }}>
              {title}
            </Typography>
            <Typography color="text.secondary" sx={{ fontWeight: 600 }}>
              {message}
            </Typography>

            {details ? (
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  bgcolor: 'rgba(15,23,42,0.04)',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  overflow: 'auto'
                }}
              >
                <Typography component="pre" sx={{ m: 0, fontSize: 12, whiteSpace: 'pre-wrap' }}>
                  {details}
                </Typography>
              </Box>
            ) : null}

            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
              <Button component={Link} to="/" variant="contained" sx={{ borderRadius: 999, fontWeight: 900 }}>
                Go to Home
              </Button>
              <Button variant="outlined" onClick={() => window.location.reload()} sx={{ borderRadius: 999, fontWeight: 900 }}>
                Reload
              </Button>
            </Box>
          </Stack>
        </Paper>
      </Box>
    </Container>
  );
}
