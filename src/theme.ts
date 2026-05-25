import { useMemo } from 'react';
import { createTheme, ThemeOptions } from '@mui/material/styles';
import type { Locale } from './i18n/translations';

const baseThemeOptions: ThemeOptions = {
  palette: {
    mode: 'dark',
    primary: {
      main: '#4fc3f7', // Light blue — energetic and fun
    },
    secondary: {
      main: '#ff8a65', // Orange accent — warmth and excitement
    },
    success: {
      main: '#66bb6a', // Green for correct answers
    },
    error: {
      main: '#ef5350', // Red for wrong answers
    },
    background: {
      default: '#1a1a2e', // Deep navy
      paper: '#16213e', // Slightly lighter card backgrounds
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
    },
    h6: {
      fontSize: '1.1rem',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontSize: '1.1rem',
          padding: '12px 24px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
};

/**
 * Creates a MUI theme with the correct direction for the given locale.
 * Memoized so the theme object is only recreated when locale changes.
 */
export function useDirectionalTheme(locale: Locale) {
  return useMemo(
    () => createTheme({
      ...baseThemeOptions,
      direction: locale === 'he' ? 'rtl' : 'ltr',
    }),
    [locale],
  );
}

// Keep a default export for backward compatibility during migration
const defaultTheme = createTheme(baseThemeOptions);
export default defaultTheme;
