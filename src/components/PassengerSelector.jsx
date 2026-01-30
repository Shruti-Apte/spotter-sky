import { Box, IconButton, Popover, Stack, Typography } from '@mui/material'
import { Add, Remove } from '@mui/icons-material'
import { useId, useState } from 'react'

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
  const popoverId = useId()

  const handleTriggerKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setAnchorEl(open ? null : e.currentTarget)
    }
  }

  return (
    <>
      <Box
        role="button"
        tabIndex={0}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? popoverId : undefined}
        onClick={(e) => setAnchorEl(e.currentTarget)}
        onKeyDown={handleTriggerKeyDown}
        sx={{
          width: { xs: '100%', sm: '49.5%' },
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'divider',
          px: 1.5,
          py: 0.5,
          height: 40,
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          '&:hover': { borderColor: 'primary.main' },
          '&:focus-visible': {
            borderColor: 'primary.main',
            outline: '2px solid',
            outlineColor: 'primary.main',
            outlineOffset: 2,
          },
        }}
      >
        <Typography variant="caption" color="text.secondary">
          Passengers
        </Typography>
        <Typography variant="body2">{formatSummary(adults, childrenCount)}</Typography>
      </Box>

      <Popover
        id={popoverId}
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
            <Stack direction="row" spacing={1} alignItems="center">
              <IconButton
                size="small"
                aria-label="Decrease adults"
                onClick={() => onAdultsChange((n) => Math.max(1, n - 1))}
                disabled={adults <= 1}
              >
                <Remove fontSize="inherit" />
              </IconButton>
              <Typography component="span" sx={{ minWidth: 24, textAlign: 'center' }} aria-live="polite">
                {adults}
              </Typography>
              <IconButton
                size="small"
                aria-label="Increase adults"
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
            <Stack direction="row" spacing={1} alignItems="center">
              <IconButton
                size="small"
                aria-label="Decrease children"
                onClick={() => onChildrenChange((n) => Math.max(0, n - 1))}
                disabled={childrenCount <= 0}
              >
                <Remove fontSize="inherit" />
              </IconButton>
              <Typography component="span" sx={{ minWidth: 24, textAlign: 'center' }} aria-live="polite">
                {childrenCount}
              </Typography>
              <IconButton
                size="small"
                aria-label="Increase children"
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
