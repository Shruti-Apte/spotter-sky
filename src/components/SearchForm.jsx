import {
  Autocomplete,
  Alert,
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Stack,
  TextField,
  Typography,
  IconButton,
} from '@mui/material'
import { SwapHoriz } from '@mui/icons-material'
import PassengerSelector from './PassengerSelector.jsx'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { searchLocations } from '../services/flightService.js'
import { useDebounce } from '../hooks/useDebounce.js'

const DEBOUNCE_LOCATION_MS = 200
const DEBOUNCE_AUTOSEARCH_MS = 350
const RECENT_SEARCHES_MAX = 5
const MAX_PASSENGERS = 6

const DEFAULT_RECENT_SEARCHES = [
  { origin: 'JFK', originLabel: 'New York (JFK)', destination: 'LHR', destinationLabel: 'London (LHR)', departureDate: '' },
  { origin: 'LAX', originLabel: 'Los Angeles (LAX)', destination: 'SFO', destinationLabel: 'San Francisco (SFO)', departureDate: '' },
  { origin: 'DXB', originLabel: 'Dubai (DXB)', destination: 'DEL', destinationLabel: 'New Delhi (DEL)', departureDate: '' },
]

function useLocationSearch(input, optionsSetter, recentOptions = []) {
  const [loading, setLoading] = useState(false)
  const abortRef = useRef(null)
  const cacheRef = useRef(new Map())

  const debouncedInput = useDebounce(input, DEBOUNCE_LOCATION_MS)

  useEffect(() => {
    const keyword = debouncedInput.trim()
    if (keyword.length < 2) {
      optionsSetter(recentOptions)
      return
    }

    if (abortRef.current) abortRef.current.abort()

    const cacheKey = keyword.toLowerCase()
    if (cacheRef.current.has(cacheKey)) {
      optionsSetter(cacheRef.current.get(cacheKey))
      return
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetch, loading flag
    setLoading(true)
    const controller = new AbortController()
    abortRef.current = controller

    searchLocations(keyword, controller.signal)
      .then((results) => {
        if (controller.signal.aborted) return
        if (!results.length) {
          results.push({ label: keyword, iata: keyword.toUpperCase() })
        }
        cacheRef.current.set(cacheKey, results)
        optionsSetter(results)
        setLoading(false)
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          optionsSetter(recentOptions)
          setLoading(false)
        }
      })

    return () => controller.abort()
  }, [debouncedInput, optionsSetter, recentOptions])

  return loading
}

export default function SearchForm({ onSearch, initialSearchParams, autoSearch = false, showSubmit = true }) {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), [])

  const [tripType, setTripType] = useState(
    initialSearchParams?.returnDate ? 'ROUND_TRIP' : 'ONE_WAY',
  )
  const [departureDate, setDepartureDate] = useState(initialSearchParams?.departureDate ?? '')
  const [returnDate, setReturnDate] = useState(initialSearchParams?.returnDate ?? '')

  const [originLabel, setOriginLabel] = useState(initialSearchParams?.originLabel ?? '')
  const [originIata, setOriginIata] = useState(initialSearchParams?.origin ?? '')
  const [destinationLabel, setDestinationLabel] = useState(initialSearchParams?.destinationLabel ?? '')
  const [destinationIata, setDestinationIata] = useState(initialSearchParams?.destination ?? '')

  const [originOptions, setOriginOptions] = useState([])
  const [destinationOptions, setDestinationOptions] = useState([])
  const [recentSearches, setRecentSearches] = useState([])

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem('spotter-sky:recent-searches')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.length > 0) {
          // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate from storage once
          setRecentSearches(parsed.slice(0, RECENT_SEARCHES_MAX))
          return
        }
      }
      setRecentSearches(DEFAULT_RECENT_SEARCHES.slice(0, RECENT_SEARCHES_MAX))
    } catch {
      setRecentSearches(DEFAULT_RECENT_SEARCHES.slice(0, RECENT_SEARCHES_MAX))
    }
  }, [])

  const recentOriginOptions = useMemo(
    () =>
      recentSearches
        .map((s) => ({ label: s.originLabel || s.origin, iata: s.origin }))
        .filter((o, index, arr) => o.iata && arr.findIndex((x) => x.iata === o.iata) === index)
        .slice(0, RECENT_SEARCHES_MAX),
    [recentSearches],
  )

  const recentDestinationOptions = useMemo(
    () =>
      recentSearches
        .map((s) => ({ label: s.destinationLabel || s.destination, iata: s.destination }))
        .filter((o, index, arr) => o.iata && arr.findIndex((x) => x.iata === o.iata) === index)
        .slice(0, RECENT_SEARCHES_MAX),
    [recentSearches],
  )

  const originLoading = useLocationSearch(originLabel, setOriginOptions, recentOriginOptions)
  const destinationLoading = useLocationSearch(destinationLabel, setDestinationOptions, recentDestinationOptions)

  const filteredDestinationOptions = useMemo(
    () => destinationOptions.filter((o) => o.iata !== originIata),
    [destinationOptions, originIata],
  )

  const [adults, setAdults] = useState(initialSearchParams?.passengers?.adults ?? 1)
  const [children, setChildren] = useState(0)
  const [travelClass, setTravelClass] = useState(initialSearchParams?.travelClass ?? 'ECONOMY')

  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const lastSearchKeyRef = useRef(
    initialSearchParams
      ? JSON.stringify({
          origin: initialSearchParams.origin,
          destination: initialSearchParams.destination,
          departureDate: initialSearchParams.departureDate,
          returnDate: initialSearchParams.returnDate ?? '',
          adults: initialSearchParams.passengers?.adults ?? 1,
          travelClass: initialSearchParams.travelClass ?? 'ECONOMY',
        })
      : null,
  )
  const departureInputRef = useRef(null)
  const returnInputRef = useRef(null)

  const validate = useCallback(() => {
    const nextErrors = {}
    if (!originIata || !/^[A-Z]{3}$/.test(originIata))
      nextErrors.origin = 'Enter a valid 3-letter IATA code or select a suggestion.'
    if (!destinationIata || !/^[A-Z]{3}$/.test(destinationIata))
      nextErrors.destination = 'Enter a valid 3-letter IATA code or select a suggestion.'
    if (originIata && destinationIata && originIata === destinationIata)
      nextErrors.destination = 'Destination must be different from origin.'
    if (!departureDate) nextErrors.departureDate = 'Departure date is required.'
    if (departureDate && departureDate < today)
      nextErrors.departureDate = 'Departure date cannot be in the past.'
    if (tripType === 'ROUND_TRIP' && returnDate && returnDate < departureDate)
      nextErrors.returnDate = 'Return date must be on or after departure date.'
    if (!travelClass) nextErrors.travelClass = 'Travel class is required.'
    setErrors(nextErrors)
    return { isValid: Object.keys(nextErrors).length === 0 }
  }, [originIata, destinationIata, departureDate, returnDate, travelClass, tripType, today])

  const persistRecentSearch = useCallback(
    (params) => {
      const entry = {
        origin: params.origin,
        originLabel,
        destination: params.destination,
        destinationLabel,
        departureDate: params.departureDate,
        returnDate: params.returnDate ?? null,
        passengers: { adults: params.passengers?.adults ?? 1 },
        travelClass: params.travelClass,
      }
      setRecentSearches((prev) => {
        const existingIndex = prev.findIndex(
          (s) =>
            s.origin === entry.origin &&
            s.destination === entry.destination &&
            s.departureDate === entry.departureDate &&
            (s.returnDate ?? null) === (entry.returnDate ?? null) &&
            (s.passengers?.adults ?? 1) === (entry.passengers?.adults ?? 1) &&
            s.travelClass === entry.travelClass,
        )
        const next = [...prev]
        if (existingIndex !== -1) next.splice(existingIndex, 1)
        next.unshift(entry)
        const trimmed = next.slice(0, RECENT_SEARCHES_MAX)
        try {
          window.localStorage.setItem('spotter-sky:recent-searches', JSON.stringify(trimmed))
        } catch {
          // localStorage full/disabled
        }
        return trimmed
      })
    },
    [originLabel, destinationLabel],
  )

  const buildSearchParams = useCallback(
    () => ({
      origin: originIata,
      originLabel,
      destination: destinationIata,
      destinationLabel,
      departureDate,
      returnDate: returnDate || undefined,
      passengers: { adults: Number(adults) || 1 },
      travelClass,
    }),
    [adults, departureDate, destinationIata, destinationLabel, originIata, originLabel, returnDate, travelClass],
  )

  const handleSwap = useCallback(() => {
    setOriginLabel((prev) => {
      setDestinationLabel(prev)
      return destinationLabel
    })
    setOriginIata((prev) => {
      setDestinationIata(prev)
      return destinationIata
    })
  }, [destinationLabel, destinationIata])

  const handleSubmit = useCallback(
    (e) => {
      e?.preventDefault?.()
      setFormError('')
      const { isValid } = validate()
      if (!isValid) {
        setFormError('Please fix the highlighted fields and try again.')
        return
      }
      const searchParams = buildSearchParams()
      persistRecentSearch(searchParams)
      onSearch?.(searchParams)
    },
    [buildSearchParams, onSearch, persistRecentSearch, validate],
  )

  const onChangeDeparture = useCallback(
    (value) => {
      setDepartureDate(value)
      if (returnDate && value && returnDate < value) setReturnDate('')
    },
    [returnDate],
  )

  const onSelectLocation = useCallback((newValue, isOrigin) => {
    if (!newValue) return
    const label = newValue.label
    const iata = newValue.iata || label.toUpperCase()
    if (isOrigin) {
      setOriginLabel(label)
      setOriginIata(iata)
    } else {
      setDestinationLabel(label)
      setDestinationIata(iata)
    }
  }, [])

  const autoSearchKey = useDebounce(
    JSON.stringify({
      origin: originIata,
      destination: destinationIata,
      departureDate,
      returnDate: returnDate || '',
      adults,
      travelClass,
    }),
    DEBOUNCE_AUTOSEARCH_MS,
  )

  useEffect(() => {
    if (!autoSearch || !onSearch) return
    // eslint-disable-next-line react-hooks/set-state-in-effect -- validate() sets formError; run on param change
    const { isValid } = validate()
    if (!isValid) return
    const searchParams = buildSearchParams()
    const nextKey = JSON.stringify({
      origin: searchParams.origin,
      destination: searchParams.destination,
      departureDate: searchParams.departureDate,
      returnDate: searchParams.returnDate ?? '',
      adults: searchParams.passengers.adults,
      travelClass: searchParams.travelClass,
    })
    if (lastSearchKeyRef.current === nextKey) return
    lastSearchKeyRef.current = nextKey
    persistRecentSearch(searchParams)
    onSearch(searchParams)
  }, [autoSearch, autoSearchKey, buildSearchParams, onSearch, persistRecentSearch, validate])

  const swapButtonSx = {
    bgcolor: 'background.paper',
    border: '1px solid',
    borderColor: 'rgba(11,34,57,0.2)',
    boxShadow: '0 8px 20px rgba(15,30,50,0.22)',
    '&:hover': { bgcolor: 'rgba(240,248,255,0.96)' },
    transition: 'transform 160ms ease-out, box-shadow 160ms ease-out, background-color 160ms ease-out',
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        position: 'relative',
        zIndex: 1,
        bgcolor: 'background.paper',
        borderRadius: 3,
        p: { xs: 2, sm: 2.5 },
        boxShadow: '0 10px 30px rgba(11,34,57,0.10)',
        border: '1px solid',
        borderColor: 'rgba(11,34,57,0.10)',
      }}
    >
      <Stack spacing={1.5}>
        <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-start' }}>
          <Button
            size="small"
            variant={tripType === 'ROUND_TRIP' ? 'contained' : 'text'}
            onClick={() => setTripType('ROUND_TRIP')}
          >
            Round trip
          </Button>
          <Button
            size="small"
            variant={tripType === 'ONE_WAY' ? 'contained' : 'text'}
            onClick={() => setTripType('ONE_WAY')}
          >
            One way
          </Button>
        </Stack>

        <Box sx={{ position: 'relative' }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Autocomplete
              freeSolo
              options={originOptions}
              getOptionLabel={(o) => (typeof o === 'string' ? o : o?.label ?? '')}
              fullWidth
              sx={{ flex: 1, minWidth: 0 }}
              inputValue={originLabel}
              onInputChange={(_, v) => setOriginLabel(v)}
              onChange={(_, newValue) => onSelectLocation(newValue, true)}
              loading={originLoading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Origin"
                  size="small"
                  error={Boolean(errors.origin)}
                  helperText={errors.origin}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {originLoading ? <CircularProgress color="inherit" size={16} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />

            <Autocomplete
              freeSolo
              options={filteredDestinationOptions}
              getOptionLabel={(o) => (typeof o === 'string' ? o : o?.label ?? '')}
              fullWidth
              sx={{ flex: 1, minWidth: 0 }}
              inputValue={destinationLabel}
              onInputChange={(_, v) => setDestinationLabel(v)}
              onChange={(_, newValue) => onSelectLocation(newValue, false)}
              loading={destinationLoading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Destination"
                  size="small"
                  error={Boolean(errors.destination)}
                  helperText={errors.destination}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {destinationLoading ? <CircularProgress color="inherit" size={16} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          </Stack>

          <Box
            sx={{
              position: 'absolute',
              left: { xs: '50%', sm: 'auto' },
              right: { xs: 'auto', sm: '50%' },
              bottom: { xs: '30%', sm: '50%' },
              transform: {
                xs: 'translateX(-50%)',
                sm: 'translate(50%, 50%)',
              },
            }}
          >
            <IconButton
              size="small"
              aria-label="Swap origin and destination"
              onClick={handleSwap}
              sx={swapButtonSx}
            >
              <SwapHoriz fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <TextField
            fullWidth
            label="Depart"
            type="date"
            size="small"
            inputRef={departureInputRef}
            InputLabelProps={{ shrink: true }}
            inputProps={{ min: today }}
            value={departureDate}
            onChange={(e) => onChangeDeparture(e.target.value)}
            onClick={() => departureInputRef.current?.showPicker?.()}
            error={Boolean(errors.departureDate)}
            helperText={errors.departureDate}
            sx={{ cursor: 'pointer' }}
          />
          <TextField
            fullWidth
            label="Return"
            type="date"
            size="small"
            inputRef={returnInputRef}
            InputLabelProps={{ shrink: true }}
            inputProps={{ min: departureDate || today }}
            value={returnDate}
            onChange={(e) => setReturnDate(e.target.value)}
            onClick={() => returnInputRef.current?.showPicker?.()}
            error={Boolean(errors.returnDate)}
            helperText={errors.returnDate}
            sx={{ display: tripType === 'ROUND_TRIP' ? 'block' : 'none', cursor: 'pointer' }}
          />
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <PassengerSelector
            adults={adults}
            children={children}
            onAdultsChange={setAdults}
            onChildrenChange={setChildren}
            maxPassengers={MAX_PASSENGERS}
          />
          <TextField
            fullWidth
            select
            label="Class"
            value={travelClass}
            onChange={(e) => setTravelClass(e.target.value)}
            size="small"
            error={Boolean(errors.travelClass)}
            helperText={errors.travelClass}
            sx={{ flex: 1, minWidth: 0, '& .MuiInputBase-root': { height: 40, alignItems: 'center' } }}
          >
            <MenuItem value="ECONOMY">Economy</MenuItem>
            <MenuItem value="PREMIUM_ECONOMY">Premium economy</MenuItem>
            <MenuItem value="BUSINESS">Business</MenuItem>
            <MenuItem value="FIRST">First</MenuItem>
          </TextField>
        </Stack>

        {formError && <Alert severity="error">{formError}</Alert>}

        {showSubmit && (
          <Stack direction="row" justifyContent="flex-end">
            <Button type="submit" variant="contained" disableElevation>
              Search
            </Button>
          </Stack>
        )}
      </Stack>
    </Box>
  )
}
