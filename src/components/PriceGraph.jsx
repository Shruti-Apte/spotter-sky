import { Box, Skeleton, Typography } from '@mui/material'
import { Area, AreaChart, Label, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export default function PriceGraph({ points, loading }) {
  const showSkeleton = loading && points.length === 0

  return (
    <Box
      sx={{
        mt: 1,
        borderRadius: 3,
        bgcolor: 'background.paper',
        p: { xs: 2, sm: 2.5 },
        border: '1px solid',
        borderColor: 'rgba(11,34,57,0.12)',
        height: { xs: 260, sm: 300 },
        position: 'relative',
      }}
    >
      <Box sx={{ mb: 0.5 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
          Price trends
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
          Across current results (sorted by price).
        </Typography>
      </Box>

      {showSkeleton ? (
        <Skeleton variant="rectangular" sx={{ mt: 1.5, borderRadius: 2 }} height="70%" />
      ) : points.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          No price data yet. Run a search or adjust filters. The graph updates when you change
          filters.
        </Typography>
      ) : (
        <Box sx={{ mt: 1, height: '70%', position: 'relative' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={points}>
              <XAxis
                dataKey="index"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11 }}
              >
                <Label value="Flight Option (by price)" position="insideBottom" offset={-4} style={{ fontSize: 11 }} />
              </XAxis>
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => `$${v}`}
              >
                <Label value="Price" angle={-95} position="insideLeft" style={{ fontSize: 11 }} />
              </YAxis>
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null
                  const p = payload[0].payload
                  return (
                    <Box
                      sx={{
                        borderRadius: 12,
                        border: '1px solid rgba(11,34,57,0.12)',
                        boxShadow: '0 8px 24px rgba(15,30,50,0.25)',
                        p: 1.25,
                        bgcolor: 'background.paper',
                      }}
                    >
                      <Typography variant="body2" fontWeight={600}>
                        Option {p.index} {p.airline ? `• ${p.airline}` : ''}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ${Number(p.price).toFixed(0)} — Sorted by price (cheapest first)
                      </Typography>
                    </Box>
                  )
                }}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke="#020079"
                fill="url(#priceArea)"
                strokeWidth={2}
                dot={{ r: 2 }}
                activeDot={{ r: 4 }}
              />
              <defs>
                <linearGradient id="priceArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#020079" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#020079" stopOpacity={0} />
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
          {loading && points.length > 0 ? (
            <Skeleton
              variant="rectangular"
              height="100%"
              sx={{
                position: 'absolute',
                inset: 0,
                borderRadius: 2,
                opacity: 0.35,
              }}
            />
          ) : null}
        </Box>
      )}
    </Box>
  )
}
