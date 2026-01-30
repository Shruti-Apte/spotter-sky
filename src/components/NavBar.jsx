import { Box, Stack, Typography } from '@mui/material'
import { FlightTakeoff } from '@mui/icons-material'
import { Link } from 'react-router-dom'

export default function NavBar() {
  return (
    <Box
      component="header"
      sx={{
        position: 'relative',
        zIndex: 1,
        pt: { xs: 2.5, sm: 3.5 },
        pb: { xs: 1.5, sm: 2 },
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
        <Stack
          component={Link}
          to="/"
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{ textDecoration: 'none', color: 'inherit' }}
        >
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
          <FlightTakeoff sx={{ fontSize: 28, color: 'primary.main' }} />
        </Stack>
      </Stack>
    </Box>
  )
}

