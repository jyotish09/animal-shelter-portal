import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    background: { default: '#F7FAFF', paper: '#FFFFFF' },
    primary: { main: '#22C55E', dark: '#16A34A' },
    secondary: { main: '#F59E0B' },
    text: { primary: '#0F172A', secondary: '#475569' },
    divider: '#E5EAF3'
  },
  shape: { borderRadius: 16 },
  typography: {
    fontFamily: '"Inter", ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial',
    h1: { fontFamily: '"Nunito", ui-sans-serif, system-ui', fontWeight: 800 },
    h2: { fontFamily: '"Nunito", ui-sans-serif, system-ui', fontWeight: 800 },
    h3: { fontFamily: '"Nunito", ui-sans-serif, system-ui', fontWeight: 800 }
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255,255,255,0.88)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid #E5EAF3'
        }
      }
    }
  }
});
