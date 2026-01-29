import { createTheme } from '@mui/material/styles'

export const THEME_STORAGE_KEY = 'spotter-sky:color-mode'

export function getStoredMode() {
  const value = window.localStorage.getItem(THEME_STORAGE_KEY)
  return value === 'light' || value === 'dark' ? value : null
}

export function storeMode(mode) {
  window.localStorage.setItem(THEME_STORAGE_KEY, mode)
}

export function getSystemMode() {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function createAppTheme(mode) {
  const isDark = mode === 'dark'

  return createTheme({
    palette: {
      mode,
      primary: { main: '#020079' },
      // secondary: { main: '#5C6BC0' },
      secondary: { main: '#7C4DFF' },
      background: {
        default: isDark ? '#071A2A' : '#F6FAFF',
        paper: isDark ? '#0B2336' : '#FFFFFF',
      },
      text: {
        primary: isDark ? '#EAF2FF' : '#0B2239',
        secondary: isDark ? 'rgba(234,242,255,0.72)' : 'rgba(11,34,57,0.72)',
      },
    },
    shape: { borderRadius: 14 },
    typography: {
      fontFamily: [
        'ui-sans-serif',
        'system-ui',
        '-apple-system',
        'Segoe UI',
        'Roboto',
        'Helvetica',
        'Arial',
        'Apple Color Emoji',
        'Segoe UI Emoji',
      ].join(','),
      h1: { fontWeight: 800, letterSpacing: -0.6 },
      h2: { fontWeight: 750, letterSpacing: -0.4 },
      h3: { fontWeight: 720 },
      button: { textTransform: 'none', fontWeight: 650 },
    },
  })
}

