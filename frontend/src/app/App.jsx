import '../styles/global.css';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { theme } from './theme';
import AppRouter from './router';

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppRouter />
    </ThemeProvider>
  );
}
