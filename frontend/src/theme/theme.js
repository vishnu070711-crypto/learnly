import { createTheme } from '@mui/material/styles';

// Palette: deep indigo for trust/focus, warm amber for energy/progress,
// a soft violet-tinted off-white background so the app doesn't feel like
// a bare admin panel.
const palette = {
  primary: {
    main: '#4338CA', // indigo
    light: '#6D5CE0',
    dark: '#2E2789',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#F59E0B', // amber
    light: '#FBBF4B',
    dark: '#B4790A',
    contrastText: '#1E1B2E',
  },
  success: { main: '#16A34A' },
  warning: { main: '#F59E0B' },
  error: { main: '#DC2626' },
  info: { main: '#0EA5E9' },
  background: {
    default: '#F7F7FC',
    paper: '#FFFFFF',
  },
  text: {
    primary: '#1E1B2E',
    secondary: '#5B5670',
  },
  divider: '#E7E5F2',
};

const theme = createTheme({
  palette,
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: '"Inter", "Segoe UI", sans-serif',
    h1: { fontFamily: '"Poppins", sans-serif', fontWeight: 700 },
    h2: { fontFamily: '"Poppins", sans-serif', fontWeight: 700 },
    h3: { fontFamily: '"Poppins", sans-serif', fontWeight: 600 },
    h4: { fontFamily: '"Poppins", sans-serif', fontWeight: 600 },
    h5: { fontFamily: '"Poppins", sans-serif', fontWeight: 600 },
    h6: { fontFamily: '"Poppins", sans-serif', fontWeight: 600 },
    button: { fontFamily: '"Inter", sans-serif', fontWeight: 600, textTransform: 'none' },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          paddingTop: 9,
          paddingBottom: 9,
          paddingLeft: 20,
          paddingRight: 20,
        },
        containedPrimary: {
          boxShadow: '0 8px 20px -8px rgba(67, 56, 202, 0.55)',
          '&:hover': {
            boxShadow: '0 10px 24px -8px rgba(67, 56, 202, 0.65)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid #E7E5F2',
          boxShadow: '0 2px 10px -4px rgba(30, 27, 46, 0.08)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600 },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 0 0 #E7E5F2',
        },
      },
    },
  },
});

export default theme;
