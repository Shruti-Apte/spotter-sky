import { Box, Skeleton, Typography } from '@mui/material'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

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
        borderColor: (t) => (t.palette.mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(11,34,57,0.12)'),
        height: { xs: 220, sm: 260 },
        position: 'relative',
      }}
    >
      <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>
        Price trends
      </Typography>

      {showSkeleton ? (
        <Skeleton variant="rectangular" sx={{ mt: 1.5, borderRadius: 2 }} height="70%" />
      ) : points.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          No price data yet. Run a search or adjust filters.
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
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip
                formatter={(value) => [`$${value}`, 'Price']}
                labelFormatter={(label, items) =>
                  `Option ${label}${
                    items?.[0]?.payload?.airline ? ` • ${items[0].payload.airline}` : ''
                  }`
                }
                // Micro-interaction: slightly elevated, theme-aware tooltip panel.
                contentStyle={{
                  borderRadius: 12,
                  border: '1px solid rgba(11,34,57,0.12)',
                  boxShadow: '0 8px 24px rgba(15,30,50,0.25)',
                  padding: '8px 10px',
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
            // Overlay skeleton during refetch to suggest activity without layout shift.
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

