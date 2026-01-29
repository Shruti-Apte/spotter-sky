import { useState } from 'react'
import {
  Box,
  Chip,
  Skeleton,
  Slider,
  Stack,
  Typography,
  Popover,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Checkbox,
  Radio,
} from '@mui/material'

export default function FiltersBar({
  filters,
  availableAirlines,
  priceRangeBounds,
  durationBounds,
  onChangeFilters,
  loading = false,
}) {
  const [stopsAnchor, setStopsAnchor] = useState(null)
  const [airlinesAnchor, setAirlinesAnchor] = useState(null)
  const [priceAnchor, setPriceAnchor] = useState(null)
  const [durationAnchor, setDurationAnchor] = useState(null)

  const toggleAirline = (airline) => {
    const current = filters.airlines ?? []
    const exists = current.includes(airline)
    const next = exists ? current.filter((v) => v !== airline) : [...current, airline]
    onChangeFilters({ airlines: next })
  }

  const [minPrice, maxPrice] = priceRangeBounds ?? [0, 0]
  const activePriceRange =
    filters.priceRange && priceRangeBounds
      ? [
          Math.max(minPrice, Math.min(filters.priceRange[0], maxPrice)),
          Math.max(
            Math.max(minPrice, Math.min(filters.priceRange[0], maxPrice)),
            Math.min(filters.priceRange[1], maxPrice),
          ),
        ]
      : priceRangeBounds

  const [minDuration, maxDuration] = durationBounds ?? [0, 0]
  const activeMaxDuration =
    filters.maxDurationMinutes && durationBounds
      ? Math.max(minDuration, Math.min(filters.maxDurationMinutes, maxDuration))
      : maxDuration

  const stopsValue = (filters.stops && filters.stops[0]) ?? null
  let stopsLabel = 'Stops'
  if (stopsValue === 0) stopsLabel = 'Nonstop'
  else if (stopsValue === 1) stopsLabel = '1 stop or fewer'
  else if (stopsValue === '2+') stopsLabel = '2+ stops'

  const airlineCount = filters.airlines?.length ?? 0
  const airlinesLabel = airlineCount > 0 ? `Airlines (${airlineCount})` : 'Airlines'

  let priceLabel = 'Price'
  if (priceRangeBounds && activePriceRange) {
    const [, upperBound] = priceRangeBounds
    const [, currentMax] = activePriceRange
    if (currentMax < upperBound) {
      priceLabel = `up to $${Math.round(currentMax)}`
    }
  }

  let durationLabel = 'Duration'
  if (durationBounds && activeMaxDuration != null && activeMaxDuration < maxDuration) {
    const h = Math.floor(activeMaxDuration / 60)
    const m = activeMaxDuration % 60
    durationLabel = `up to ${h}h ${m}m`
  }

  const filterChipSx = {
    borderRadius: 999,
    minWidth: 110,
    transition: 'background-color 140ms ease-out, border-color 140ms ease-out, box-shadow 140ms ease-out',
    '&:hover': {
      bgcolor: (t) =>
        t.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(25,118,210,0.06)',
      borderColor: 'primary.main',
      boxShadow: (t) =>
        t.palette.mode === 'dark'
          ? '0 0 0 1px rgba(144,202,249,0.5)'
          : '0 0 0 1px rgba(25,118,210,0.25)',
    },
    '&:focus-visible': {
      outline: 'none',
      boxShadow: (t) =>
        `0 0 0 2px ${t.palette.mode === 'dark' ? 'rgba(144,202,249,0.8)' : 'rgba(25,118,210,0.7)'}`,
    },
  }

  return (
    <Box
      sx={{
        borderRadius: 3,
        bgcolor: 'background.paper',
        p: { xs: 1.5, sm: 2 },
        border: '1px solid',
        borderColor: (t) => (t.palette.mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(11,34,57,0.10)'),
      }}
    >
      <Box
        sx={{
          display: 'flex',
          overflowX: 'auto',
          pb: 1,
          WebkitOverflowScrolling: 'touch',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        <Stack direction="row" spacing={1} sx={{ minWidth: '100%' }}>
          {loading ? (
            <>
              <Skeleton
                variant="rectangular"
                sx={{ borderRadius: 999, width: 110, height: 28 }}
              />
              <Skeleton
                variant="rectangular"
                sx={{ borderRadius: 999, width: 110, height: 28 }}
              />
              <Skeleton
                variant="rectangular"
                sx={{ borderRadius: 999, width: 110, height: 28 }}
              />
            </>
          ) : (
            <>
              <Chip
                variant="outlined"
                size="small"
                label={stopsLabel}
                onClick={(e) => setStopsAnchor(e.currentTarget)}
                sx={filterChipSx}
              />
              {availableAirlines.length > 0 && (
                <Chip
                  variant="outlined"
                  size="small"
                  label={airlinesLabel}
                  onClick={(e) => setAirlinesAnchor(e.currentTarget)}
                  sx={filterChipSx}
                />
              )}
              {priceRangeBounds && (
                <Chip
                  variant="outlined"
                  size="small"
                  label={priceLabel}
                  onClick={(e) => setPriceAnchor(e.currentTarget)}
                  sx={filterChipSx}
                />
              )}
              {durationBounds && (
                <Chip
                  variant="outlined"
                  size="small"
                  label={durationLabel}
                  onClick={(e) => setDurationAnchor(e.currentTarget)}
                  sx={{ ...filterChipSx, minWidth: 120 }}
                />
              )}
            </>
          )}
        </Stack>
      </Box>

      {/* Stops popover */}
      <Popover
        open={Boolean(stopsAnchor)}
        anchorEl={stopsAnchor}
        onClose={() => setStopsAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <List dense sx={{ minWidth: 220 }}>
          {[
            { label: 'Any', value: 'ANY' },
            { label: 'Nonstop', value: 0 },
            { label: '1 stop', value: 1 },
            { label: '2+ stops', value: '2+' },
          ].map((option) => {
            const current = filters.stops ?? []
            const isAny = option.value === 'ANY'
            const selected = isAny ? current.length === 0 : current.includes(option.value)
            return (
              <ListItemButton
                key={option.label}
                onClick={() => {
                  if (isAny) {
                    onChangeFilters({ stops: [] })
                  } else {
                    onChangeFilters({ stops: [option.value] })
                  }
                }}
              >
                <ListItemIcon>
                  <Radio size="small" checked={selected} />
                </ListItemIcon>
                <ListItemText primary={option.label} />
              </ListItemButton>
            )
          })}
        </List>
      </Popover>

      {/* Airlines popover (multi-select) */}
      <Popover
        open={Boolean(airlinesAnchor)}
        anchorEl={airlinesAnchor}
        onClose={() => setAirlinesAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <List dense sx={{ minWidth: 220 }}>
          {availableAirlines.map((airline) => {
            const checked = filters.airlines.includes(airline)
            return (
              <ListItemButton key={airline} onClick={() => toggleAirline(airline)}>
                <ListItemIcon>
                  <Checkbox size="small" edge="start" checked={checked} />
                </ListItemIcon>
                <ListItemText primary={airline} />
              </ListItemButton>
            )
          })}
        </List>
      </Popover>

      {/* Price popover with slider */}
      <Popover
        open={Boolean(priceAnchor)}
        anchorEl={priceAnchor}
        onClose={() => setPriceAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        {priceRangeBounds && activePriceRange && (
          <Box sx={{ p: 2, minWidth: 260 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="caption" color="text.secondary">
                Price range
              </Typography>
              <Typography variant="caption">
                ${Math.round(activePriceRange[0])} – ${Math.round(activePriceRange[1])}
              </Typography>
            </Stack>
            <Slider
              size="small"
              value={activePriceRange}
              min={minPrice}
              max={maxPrice}
              sx={{ mt: 1 }}
              onChange={(_, value) => {
                const [vMin, vMax] = value
                onChangeFilters({ priceRange: [vMin, vMax] })
              }}
            />
          </Box>
        )}
      </Popover>

      {/* Duration popover with slider */}
      <Popover
        open={Boolean(durationAnchor)}
        anchorEl={durationAnchor}
        onClose={() => setDurationAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        {durationBounds && activeMaxDuration != null && (
          <Box sx={{ p: 2, minWidth: 260 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="caption" color="text.secondary">
                Max duration
              </Typography>
              <Typography variant="caption">
                {Math.round(activeMaxDuration / 60)}h {activeMaxDuration % 60}m
              </Typography>
            </Stack>
            <Slider
              size="small"
              value={activeMaxDuration}
              min={minDuration}
              max={maxDuration}
              sx={{ mt: 1 }}
              onChange={(_, value) => {
                onChangeFilters({ maxDurationMinutes: value })
              }}
            />
          </Box>
        )}
      </Popover>
    </Box>
  )
}

