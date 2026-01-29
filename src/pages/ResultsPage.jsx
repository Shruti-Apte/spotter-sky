import { Box, Button, CircularProgress, Skeleton, Stack, Typography } from '@mui/material'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import FlightCard from '../components/FlightCard.jsx'
import SearchForm from '../components/SearchForm.jsx'
import FiltersBar from '../components/FiltersBar.jsx'
import PriceGraph from '../components/PriceGraph.jsx'
import FlightsTable from '../components/FlightsTable.jsx'
import Footer from '../components/Footer.jsx'
import { usePagination } from '../hooks/usePagination.js'

export default function ResultsPage({ flights }) {
  const {
    searchParams,
    results,
    filteredResults,
    topResults,
    otherResults,
    sortMode,
    setSortMode,
    filters,
    updateFilters,
    loading,
    error,
    searchFlights,
    availableAirlines,
    priceRangeBounds,
    durationBounds,
    graphPoints,
  } = flights
  const searchParamsKey = useMemo(() => {
    if (!searchParams) return 'empty'
    return [
      searchParams.origin,
      searchParams.destination,
      searchParams.departureDate,
      searchParams.returnDate ?? '',
      String(searchParams.passengers?.adults ?? 1),
      searchParams.travelClass,
    ].join('|')
  }, [searchParams])

  // Option A: single sorted list so table, cards, and graph stay in sync.
  const sortedFilteredResults = useMemo(
    () => [...(topResults || []), ...(otherResults || [])],
    [topResults, otherResults],
  )
  const { page, setPage, pageCount, paginatedItems } = usePagination(sortedFilteredResults, 10)
  const [viewMode, setViewMode] = useState('cards')
  const [expandedFlightId, setExpandedFlightId] = useState(null)
  const [searchParamsFromUrl] = useSearchParams()

  // Restore search from URL on reload (persist origin, destination, dates)
  useEffect(() => {
    const origin = searchParamsFromUrl.get('origin')
    const destination = searchParamsFromUrl.get('destination')
    const departureDate = searchParamsFromUrl.get('departureDate')
    if (!searchParams && origin && destination && departureDate) {
      const params = {
        origin,
        destination,
        originLabel: searchParamsFromUrl.get('originLabel') ?? origin,
        destinationLabel: searchParamsFromUrl.get('destinationLabel') ?? destination,
        departureDate,
        returnDate: searchParamsFromUrl.get('returnDate') || undefined,
        passengers: { adults: Number(searchParamsFromUrl.get('adults')) || 1 },
        travelClass: searchParamsFromUrl.get('travelClass') || 'ECONOMY',
      }
      searchFlights(params)
    }
  }, [searchParamsFromUrl, searchParams, searchFlights])

  return (
    <Box sx={{ position: 'relative', zIndex: 1 }}>
      <Stack spacing={2} sx={{ pt: { xs: 1, sm: 2 }, pb: { xs: 6, sm: 8 } }}>
        <SearchForm
          key={searchParamsKey}
          onSearch={searchFlights}
          initialSearchParams={searchParams}
          autoSearch
          showSubmit={false}
        />

        {/* Inline status above filters/results: error or empty, with clear copy + CTA. */}
        {(error || (!loading && filteredResults.length === 0)) && (
          <Box
            sx={{
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'rgba(211,47,47,0.28)',
              bgcolor: error ? 'rgba(255,235,238,0.9)' : 'rgba(227,242,253,0.9)',
              px: 1.5,
              py: 1.25,
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="flex-start" justifyContent="space-between">
              <Stack direction="row" spacing={1.25} alignItems="flex-start">
                {error ? (
                  <ErrorOutlineIcon color="error" fontSize="small" sx={{ mt: 0.3 }} />
                ) : (
                  <FilterAltOffIcon color="primary" fontSize="small" sx={{ mt: 0.3 }} />
                )}
                <Stack spacing={0.25}>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 700 }}
                    color={error ? 'error.main' : 'text.primary'}
                  >
                    {error
                      ? 'We couldn’t load flights.'
                      : results.length === 0
                        ? 'No flights found for this search.'
                        : 'No flights match these filters.'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {error
                      ? 'Please check your connection or try searching again in a moment.'
                      : results.length === 0
                        ? 'Try different dates, airports, or passenger options above.'
                        : 'Widen your price or duration range, or clear some filters.'}
                  </Typography>
                </Stack>
              </Stack>

              <Stack direction="row" spacing={1}>
                {error && (
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      if (searchParams) {
                        // Reuse last successful search parameters.
                        searchFlights(searchParams)
                      }
                    }}
                  >
                    Retry search
                  </Button>
                )}
                {!error && results.length > 0 && filteredResults.length === 0 && (
                  <Button
                    size="small"
                    variant="text"
                    onClick={() =>
                      updateFilters({
                        stops: [],
                        airlines: [],
                        priceRange: null,
                        maxDurationMinutes: null,
                      })
                    }
                  >
                    Clear filters
                  </Button>
                )}
              </Stack>
            </Stack>
          </Box>
        )}

        <FiltersBar
          filters={filters}
          availableAirlines={availableAirlines}
          priceRangeBounds={priceRangeBounds}
          durationBounds={durationBounds}
          onChangeFilters={updateFilters}
          loading={loading && !results.length}
        />

      <PriceGraph points={graphPoints} loading={loading} />

        {/* Sort: pill / chip style – active contained, inactive outlined */}
        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
          <Button
            size="medium"
            variant={sortMode === 'CHEAPEST' ? 'contained' : 'outlined'}
            onClick={() => setSortMode('CHEAPEST')}
            sx={{
              ...(sortMode === 'CHEAPEST' && { fontWeight: 700 }),
              ...(sortMode !== 'CHEAPEST' && { color: 'text.secondary', borderColor: 'divider' }),
            }}
          >
            Cheapest
          </Button>
          <Button
            size="medium"
            variant={sortMode === 'BEST' ? 'contained' : 'outlined'}
            onClick={() => setSortMode('BEST')}
            sx={{
              ...(sortMode === 'BEST' && { fontWeight: 700 }),
              ...(sortMode !== 'BEST' && { color: 'text.secondary', borderColor: 'divider' }),
            }}
          >
            Best
          </Button>
        </Stack>

        <Stack spacing={1}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Flights
            </Typography>
            <Stack direction="row" spacing={0.5}>
              <Button
                size="medium"
                variant={viewMode === 'cards' ? 'contained' : 'text'}
                onClick={() => setViewMode('cards')}
              >
                Cards
              </Button>
              <Button
                size="medium"
                variant={viewMode === 'table' ? 'contained' : 'text'}
                onClick={() => setViewMode('table')}
              >
                Table
              </Button>
            </Stack>
          </Stack>
          {loading ? (
            // Skeleton list preserves list height and avoids layout jumps during search.
            <Stack spacing={1.25} sx={{ py: 0.5 }}>
              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 0.5 }}>
                <CircularProgress size={18} />
                <Typography color="text.secondary">Searching flights…</Typography>
              </Stack>
              {[0, 1, 2].map((i) => (
                <Skeleton
                  key={`skeleton-${i}`}
                  variant="rectangular"
                  height={80}
                  sx={{ borderRadius: 2 }}
                />
              ))}
            </Stack>
          ) : topResults.length > 0 ? (
            <Box
              key={sortMode}
              sx={{
                '@keyframes fadeIn': {
                  from: { opacity: 0.7 },
                  to: { opacity: 1 },
                },
                animation: 'fadeIn 200ms ease-out',
              }}
            >
              {viewMode === 'cards' ? (
                <Stack spacing={1.25}>
                  {page === 1 && paginatedItems.length > 0 ? (
                    <>
                      <Stack spacing={0.75}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          Top flights
                        </Typography>
                        <Stack spacing={1.25}>
                          {paginatedItems.slice(0, 3).map((flight) => (
                            <FlightCard
                              key={flight.id}
                              flight={flight}
                              expanded={flight.id === expandedFlightId}
                              onToggle={() =>
                                setExpandedFlightId((prev) => (prev === flight.id ? null : flight.id))
                              }
                            />
                          ))}
                        </Stack>
                      </Stack>
                      {paginatedItems.length > 3 && (
                        <Stack spacing={0.75}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }} color="text.secondary">
                            Other flights
                          </Typography>
                          <Stack spacing={1.0}>
                            {paginatedItems.slice(3).map((flight) => (
                              <FlightCard
                                key={flight.id}
                                flight={flight}
                                expanded={flight.id === expandedFlightId}
                                onToggle={() =>
                                  setExpandedFlightId((prev) => (prev === flight.id ? null : flight.id))
                                }
                              />
                            ))}
                          </Stack>
                        </Stack>
                      )}
                    </>
                  ) : (
                    <Stack spacing={1.25}>
                      {paginatedItems.map((flight) => (
                        <FlightCard
                          key={flight.id}
                          flight={flight}
                          expanded={flight.id === expandedFlightId}
                          onToggle={() =>
                            setExpandedFlightId((prev) => (prev === flight.id ? null : flight.id))
                          }
                        />
                      ))}
                    </Stack>
                  )}
                </Stack>
              ) : (
                <FlightsTable rows={paginatedItems} />
              )}
              {pageCount >= 1 && (
                <Stack direction="row" alignItems="center" spacing={2} sx={{ py: 1 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <Typography variant="body2" color="text.secondary">
                    Page {page} of {pageCount}
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    disabled={page >= pageCount}
                    onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                  >
                    Next
                  </Button>
                </Stack>
              )}
            </Box>
          ) : null}
        </Stack>
        <Footer />
      </Stack>
    </Box>
  )
}

