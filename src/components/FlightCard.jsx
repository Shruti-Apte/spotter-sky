import {
  Box,
  Card,
  CardContent,
  Collapse,
  Stack,
  Typography,
  useTheme,
  useMediaQuery
} from '@mui/material'
import { ExpandMore } from '@mui/icons-material'
import {
  formatPrice,
  getAirlineName,
  getAirportLabel,
  getCabinLabel,
  getAircraftLabel,
} from '../utils/helpers'

// Timeline dot and connector for expanded segment view.

function TimelineNode() {
  return (
    <Box
      sx={{
        width: 14,
        height: 14,
        borderRadius: '50%',
        border: '2px solid',
        borderColor: 'text.secondary',
        bgcolor: 'background.paper',
        zIndex: 1,
      }}
    />
  )
}

function TimelineConnector() {
  return (
    <Box
      sx={{
        flexGrow: 1,
        width: 2,
        my: 0.5,
        borderLeft: '2px dotted',
        borderColor: 'text.disabled',
        minHeight: 24,
      }}
    />
  )
}

function SegmentDetailRow({ segment, getAirlineName, getCabinLabel, getAircraftLabel, getAirportLabel }) {
  const detailsParts = []
  const carrier = segment.carrierCode ? getAirlineName(segment.carrierCode) : null
  const cabin = getCabinLabel(segment.cabin)
  const aircraft = segment.aircraftCode ? getAircraftLabel(segment.aircraftCode) : segment.aircraftCode
  const number = segment.number ? `${segment.carrierCode ?? ''} ${segment.number}`.trim() : null

  if (carrier) detailsParts.push(carrier)
  if (cabin) detailsParts.push(cabin)
  if (aircraft) detailsParts.push(aircraft)
  if (number) detailsParts.push(number)

  const detailsString = detailsParts.join(' · ')

  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 0 }}>
      {/* 1. Timeline Column - Fixed width, no shrink */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 0.5, width: 20, flexShrink: 0 }}>
        <TimelineNode />
        <TimelineConnector />
        <TimelineNode />
      </Box>

      {/* 2. Content Column */}
      <Box sx={{ flexGrow: 1, pb: 2, minWidth: 0 }}>
        {/* Departure */}
        <Typography variant="body1" sx={{ fontWeight: 500, lineHeight: 1.2 }}>
          {segment.departureTime} · {getAirportLabel(segment.departureIata)}
        </Typography>

        {/* Travel Time */}
        <Box sx={{ my: 1.5, display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
           <Typography variant="caption" sx={{ fontSize: '0.85rem' }}>
             Travel time: {segment.duration}
           </Typography>
        </Box>

        {/* Arrival */}
        <Typography variant="body1" sx={{ fontWeight: 500, lineHeight: 1.2 }}>
          {segment.arrivalTime} · {getAirportLabel(segment.arrivalIata)}
        </Typography>

        {/* Footer Details */}
        {detailsString && (
          <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary', fontSize: '0.85rem' }}>
            {detailsString}
          </Typography>
        )}
      </Box>
    </Box>
  )
}

function ExpandedSegmentView({
  flight,
  getAirportLabel,
  getAirlineName,
  getCabinLabel,
  getAircraftLabel,
}) {
  const segments = flight.segments ?? []
  const layovers = flight.layovers ?? []

  return (
    <Box sx={{ px: { xs: 2, sm: 3 }, pb: 2, pt: 2, fontFamily: 'Roboto, sans-serif' }}>
      {segments.map((segment, i) => {
        const layover = layovers[i]
        return (
          <Box key={i}>
            <SegmentDetailRow 
                segment={segment}
                getAirlineName={getAirlineName}
                getCabinLabel={getCabinLabel}
                getAircraftLabel={getAircraftLabel}
                getAirportLabel={getAirportLabel}
            />
            {layover && (
              <Box
                sx={{
                  py: 1.5,
                  my: 1,
                  borderTop: '1px solid',
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 400 }}>
                  {layover.duration ?? `${layover.durationMinutes} min`} layover
                  <Box component="span" sx={{ color: 'text.secondary' }}>
                    {' · '}
                    {getAirportLabel(layover.airportIata)}
                  </Box>
                </Typography>
              </Box>
            )}
          </Box>
        )
      })}
    </Box>
  )
}

export default function FlightCard({ flight, expanded = false, onToggle }) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  if (!flight) return null

  const airlineName = getAirlineName(flight.airline ?? '')
  const priceText = formatPrice(flight.price)
  const stopsText =
    typeof flight.stops === 'number'
      ? flight.stops === 0
        ? 'Nonstop'
        : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`
      : '—'
  const departureTime = flight.departureTime ?? '—'
  const arrivalTime = flight.arrivalTime ?? '—'
  const duration = flight.duration ?? '—'

  return (
    <Card
      elevation={0}
      onClick={() => onToggle?.()}
      sx={{
        borderRadius: 4,
        mb: 2,
        border: '1px solid',
        borderColor: expanded ? 'primary.main' : 'divider',
        bgcolor: 'background.paper',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        overflow: 'hidden',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          borderColor: expanded ? 'primary.main' : 'text.disabled',
        },
      }}
    >
      <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
        <Stack spacing={0}>
          
          {/* --- RESPONSIVE HEADER ROW --- */}
          <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
            {isMobile ? (
              // MOBILE LAYOUT: Stacked Rows
              <Stack spacing={1.5}>
                {/* Row 1: Airline --- Price */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {airlineName}
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="body1" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {priceText}
                    </Typography>
                    <ExpandMore sx={{
                      color: 'action.active',
                      transform: expanded ? 'rotate(180deg)' : '0',
                      transition: 'transform 0.2s'
                    }} />
                  </Stack>
                </Box>
                
                {/* Row 2: Times --- Duration/Stops */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <Stack direction="row" spacing={0.5} alignItems="center">
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '1rem' }}>{departureTime}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mx: 0.5 }}>-</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '1rem' }}>{arrivalTime}</Typography>
                   </Stack>
                   
                   {!expanded && (
                      <Typography variant="caption" color="text.secondary">
                         {duration} · {stopsText}
                      </Typography>
                   )}
                </Box>
              </Stack>
            ) : (
              // DESKTOP LAYOUT: Single Row
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Stack direction="row" alignItems="center" spacing={3} sx={{ flex: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 500, minWidth: 120 }}>
                    {airlineName}
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>{departureTime}</Typography>
                    <Typography variant="body2" color="text.secondary">—</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>{arrivalTime}</Typography>
                  </Stack>
                </Stack>

                {!expanded && (
                   <Stack direction="row" spacing={1} alignItems="center" sx={{ flex: 1, justifyContent: 'center' }}>
                     <Typography variant="body2" color="text.secondary">{duration}</Typography>
                     <Typography variant="caption" color="text.disabled">·</Typography>
                     <Typography variant="body2" color="text.secondary">{stopsText}</Typography>
                   </Stack>
                )}

                <Stack direction="row" alignItems="center" spacing={2} sx={{ minWidth: 100, justifyContent: 'flex-end' }}>
                  <Typography variant="body1" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {priceText}
                  </Typography>
                  <ExpandMore sx={{
                    color: 'action.active',
                    transform: expanded ? 'rotate(180deg)' : '0',
                    transition: 'transform 0.2s'
                  }} />
                </Stack>
              </Box>
            )}
          </Box>

          {/* --- EXPANDED DETAILS --- */}
          <Collapse in={expanded}>
            <Box sx={{ borderTop: 1, borderColor: 'divider' }}>
              <ExpandedSegmentView
                flight={flight}
                getAirportLabel={getAirportLabel}
                getAirlineName={getAirlineName}
                getCabinLabel={getCabinLabel}
                getAircraftLabel={getAircraftLabel}
              />
            </Box>
          </Collapse>

        </Stack>
      </CardContent>
    </Card>
  )
}