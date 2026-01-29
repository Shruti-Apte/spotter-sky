import { createTheme } from '@mui/material/styles'

export function createAppTheme() {
  return createTheme({
    palette: {
      mode: 'light',
      primary: { main: '#020079' },
      secondary: { main: '#7C4DFF' },
      background: {
        default: '#F6FAFF',
        paper: '#FFFFFF',
      },
      text: {
        primary: '#0B2239',
        secondary: 'rgba(11,34,57,0.72)',
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
