import { Box, IconButton, Popover, Stack, Typography } from '@mui/material'
import { Add, Remove } from '@mui/icons-material'
import { useState } from 'react'

const MAX_PASSENGERS_DEFAULT = 6

function formatSummary(adults, children) {
  const parts = []
  parts.push(`${adults} adult${adults > 1 ? 's' : ''}`)
  if (children > 0) parts.push(`${children} child${children > 1 ? 'ren' : ''}`)
  return parts.join(', ')
}

export default function PassengerSelector({
  adults,
  children: childrenCount,
  onAdultsChange,
  onChildrenChange,
  maxPassengers = MAX_PASSENGERS_DEFAULT,
}) {
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)
  const total = adults + childrenCount

  return (
    <>
      <Box
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{
          width: '49.5%',
          borderRadius: 1,
          border: '1px solid',
          borderColor: (t) => (t.palette.mode === 'dark' ? 'rgba(255,255,255,0.18)' : 'rgba(11,34,57,0.22)'),
          px: 1.5,
          py: 0.5,
          height: 40,
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          '&:hover': { borderColor: 'primary.main' },
        }}
      >
        <Typography variant="caption" color="text.secondary">
          Passengers
        </Typography>
        <Typography variant="body2">{formatSummary(adults, childrenCount)}</Typography>
      </Box>

      <Popover
        open={open}
        onClose={() => setAnchorEl(null)}
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        PaperProps={{ sx: { mt: 1, p: 2, borderRadius: 2, minWidth: 260 } }}
      >
        <Stack spacing={1.5}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Adults
            </Typography>
            <Stack direction="row" spacing={1}>
              <IconButton size="small" onClick={() => onAdultsChange((n) => Math.max(1, n - 1))} disabled={adults <= 1}>
                <Remove fontSize="inherit" />
              </IconButton>
              <Typography sx={{ minWidth: 16, textAlign: 'center' }}>{adults}</Typography>
              <IconButton
                size="small"
                onClick={() => onAdultsChange((n) => Math.min(maxPassengers, n + 1))}
                disabled={total >= maxPassengers}
              >
                <Add fontSize="inherit" />
              </IconButton>
            </Stack>
          </Stack>

          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Children
            </Typography>
            <Stack direction="row" spacing={1}>
              <IconButton size="small" onClick={() => onChildrenChange((n) => Math.max(0, n - 1))} disabled={childrenCount <= 0}>
                <Remove fontSize="inherit" />
              </IconButton>
              <Typography sx={{ minWidth: 16, textAlign: 'center' }}>{childrenCount}</Typography>
              <IconButton
                size="small"
                onClick={() => onChildrenChange((n) => (total < maxPassengers ? n + 1 : n))}
                disabled={total >= maxPassengers}
              >
                <Add fontSize="inherit" />
              </IconButton>
            </Stack>
          </Stack>
        </Stack>
      </Popover>
    </>
  )
}
