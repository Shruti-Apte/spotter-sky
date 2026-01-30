import { Box, Stack, Typography } from '@mui/material'
import { FlightTakeoff } from '@mui/icons-material'
import { useEffect } from 'react'

const INTRO_DURATION_MS = 2000

export default function IntroLoader({ onComplete }) {
  useEffect(() => {
    const t = setTimeout(onComplete, INTRO_DURATION_MS)
    return () => clearTimeout(t)
  }, [onComplete])

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        animation: 'introFadeIn 0.4s ease-out',
        '@keyframes introFadeIn': {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
      }}
    >
      <Stack alignItems="center" spacing={2}>
        <FlightTakeoff
          sx={{
            fontSize: 48,
            color: 'primary.main',
            animation: 'iconPulse 1.2s ease-in-out infinite',
            '@keyframes iconPulse': {
              '0%, 100%': { opacity: 1, transform: 'scale(1)' },
              '50%': { opacity: 0.85, transform: 'scale(1.05)' },
            },
          }}
        />
        <Typography
          variant="h5"
          sx={{
            fontWeight: 850,
            letterSpacing: -0.6,
            color: 'primary.main',
          }}
        >
          Spotter Sky
        </Typography>
      </Stack>
    </Box>
  )
}
