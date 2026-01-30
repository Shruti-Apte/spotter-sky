import { useCallback, useMemo, useRef, useState } from 'react'
import { searchFlights as searchFlightsService } from '../services/flightService.js'

const TOP_FLIGHTS_COUNT = 3
const BEST_STOPS_WEIGHT = 0.35
const BEST_DURATION_WEIGHT = 0.35
const BEST_PRICE_WEIGHT = 0.3

export function useFlights() {
  const [searchParams, setSearchParams] = useState(null)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    stops: [],
    airlines: [],
    priceRange: null,
    maxDurationMinutes: null,
  })
  const [sortMode, setSortMode] = useState('CHEAPEST')

  const requestIdRef = useRef(0)

  const searchFlights = useCallback(async (nextParams) => {
    setSearchParams(nextParams)
    setLoading(true)
    setError(null)

    const requestId = ++requestIdRef.current

    try {
      const data = await searchFlightsService(nextParams)

      if (requestId !== requestIdRef.current) return

      setResults(data)
      setLoading(false)
    } catch (e) {
      if (requestId !== requestIdRef.current) return

      setResults([])
      setLoading(false)
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.')
    }
  }, [])

  const updateFilters = useCallback((partial) => {
    setFilters((prev) => ({
      ...prev,
      ...partial,
    }))
  }, [])

  const availableAirlines = useMemo(() => {
    const set = new Set()
    for (const f of results) {
      if (f.airline) set.add(f.airline)
    }
    return Array.from(set).sort()
  }, [results])

  const priceRangeBounds = useMemo(() => {
    if (!results.length) return null
    let min = Number.POSITIVE_INFINITY
    let max = 0
    for (const f of results) {
      const value = typeof f.price === 'string' ? Number.parseFloat(f.price.replace(/[^\d.]/g, '')) : f.price?.total
      if (Number.isFinite(value)) {
        if (value < min) min = value
        if (value > max) max = value
      }
    }
    if (!Number.isFinite(min) || !Number.isFinite(max)) return null
    return [min, max]
  }, [results])

  const durationBounds = useMemo(() => {
    if (!results.length) return null
    let min = Number.POSITIVE_INFINITY
    let max = 0
    for (const f of results) {
      if (typeof f.durationMinutes === 'number') {
        if (f.durationMinutes < min) min = f.durationMinutes
        if (f.durationMinutes > max) max = f.durationMinutes
      }
    }
    if (!Number.isFinite(min) || !Number.isFinite(max)) return null
    return [min, max]
  }, [results])

  const effectivePriceRange = useMemo(() => {
    if (!priceRangeBounds) return null
    const [min, max] = priceRangeBounds
    if (!filters.priceRange) return [min, max]
    let [curMin, curMax] = filters.priceRange
    curMin = Math.max(min, Math.min(curMin, max))
    curMax = Math.max(curMin, Math.min(curMax, max))
    return [curMin, curMax]
  }, [filters.priceRange, priceRangeBounds])

  const effectiveMaxDuration = useMemo(() => {
    if (!durationBounds) return null
    const [, max] = durationBounds
    if (filters.maxDurationMinutes == null) return max
    return Math.min(Math.max(filters.maxDurationMinutes, durationBounds[0]), max)
  }, [durationBounds, filters.maxDurationMinutes])

  const filteredResults = useMemo(() => {
    if (!results.length) return []

    return results.filter((f) => {
      // stops
      if (filters.stops.length > 0) {
        const stopsVal = typeof f.stops === 'number' ? f.stops : null
        const matchesStops =
          stopsVal === null
            ? false
            : (stopsVal === 0 && filters.stops.includes(0)) ||
              (stopsVal === 1 && filters.stops.includes(1)) ||
              (stopsVal >= 2 && filters.stops.includes('2+'))
        if (!matchesStops) return false
      }

      // airlines
      if (filters.airlines.length > 0 && !filters.airlines.includes(f.airline)) {
        return false
      }

      // price
      if (effectivePriceRange) {
        const [minPrice, maxPrice] = effectivePriceRange
        const priceValue =
          typeof f.price === 'string'
            ? Number.parseFloat(f.price.replace(/[^\d.]/g, ''))
            : f.price?.total
        if (!Number.isFinite(priceValue) || priceValue < minPrice || priceValue > maxPrice) {
          return false
        }
      }

      // duration
      if (effectiveMaxDuration != null && typeof f.durationMinutes === 'number') {
        if (f.durationMinutes > effectiveMaxDuration) return false
      }

      return true
    })
  }, [effectiveMaxDuration, effectivePriceRange, filters.airlines, filters.stops, results])

  const graphPoints = useMemo(() => {
    if (!filteredResults.length) return []
    const sorted = [...filteredResults].sort((a, b) => {
      const pa =
        typeof a.price === 'string'
          ? Number.parseFloat(a.price.replace(/[^\d.]/g, ''))
          : a.price?.total ?? 0
      const pb =
        typeof b.price === 'string'
          ? Number.parseFloat(b.price.replace(/[^\d.]/g, ''))
          : b.price?.total ?? 0
      return pa - pb
    })

    return sorted.map((f, index) => ({
      index: index + 1,
      price:
        typeof f.price === 'string'
          ? Number.parseFloat(f.price.replace(/[^\d.]/g, ''))
          : f.price?.total ?? 0,
      airline: f.airline,
    }))
  }, [filteredResults])

  const { topResults, otherResults } = useMemo(() => {
    if (!filteredResults.length) {
      return { topResults: [], otherResults: [] }
    }

    const withPrice = filteredResults.map((f) => {
      const priceValue =
        typeof f.price === 'string'
          ? Number.parseFloat(f.price.replace(/[^\d.]/g, ''))
          : f.price?.total ?? Number.POSITIVE_INFINITY
      return { flight: f, priceValue }
    })

    // "Best" score uses filtered subset (e.g. non-stop only)
    let minPrice = Number.POSITIVE_INFINITY
    let maxPrice = 0
    let minDur = Number.POSITIVE_INFINITY
    let maxDur = 0
    let minStops = Number.POSITIVE_INFINITY
    let maxStops = -1
    for (const f of filteredResults) {
      const p =
        typeof f.price === 'string'
          ? Number.parseFloat(f.price.replace(/[^\d.]/g, ''))
          : f.price?.total
      if (Number.isFinite(p)) {
        minPrice = Math.min(minPrice, p)
        maxPrice = Math.max(maxPrice, p)
      }
      if (typeof f.durationMinutes === 'number') {
        minDur = Math.min(minDur, f.durationMinutes)
        maxDur = Math.max(maxDur, f.durationMinutes)
      }
      if (typeof f.stops === 'number') {
        minStops = Math.min(minStops, f.stops)
        maxStops = Math.max(maxStops, f.stops)
      }
    }
    if (!Number.isFinite(minPrice)) minPrice = maxPrice = 0
    if (!Number.isFinite(minDur)) minDur = maxDur = 0
    if (!Number.isFinite(minStops)) minStops = 0
    if (maxStops < 0) maxStops = 0

    const clamp01 = (v) => {
      if (!Number.isFinite(v)) return 1
      if (v <= 0) return 0
      if (v >= 1) return 1
      return v
    }

    const scored = withPrice.map(({ flight, priceValue }) => {
      const priceNorm =
        maxPrice > minPrice
          ? clamp01((priceValue - minPrice) / (maxPrice - minPrice))
          : 0
      const durMinutes = typeof flight.durationMinutes === 'number' ? flight.durationMinutes : null
      const durNorm =
        durMinutes != null && maxDur > minDur
          ? clamp01((durMinutes - minDur) / (maxDur - minDur))
          : 0
      const stopsVal = typeof flight.stops === 'number' ? flight.stops : null
      const stopsNorm =
        stopsVal != null && maxStops > minStops
          ? clamp01((stopsVal - minStops) / (maxStops - minStops))
          : 0

      let bestScore
      if (maxStops === minStops) {
        bestScore = durNorm * 0.5 + priceNorm * 0.5
      } else {
        bestScore =
          stopsNorm * BEST_STOPS_WEIGHT +
          durNorm * BEST_DURATION_WEIGHT +
          priceNorm * BEST_PRICE_WEIGHT
      }

      return {
        flight,
        priceValue,
        bestScore,
      }
    })

    const sorted = [...scored].sort((a, b) => {
      if (sortMode === 'BEST') {
        const diff = a.bestScore - b.bestScore
        if (diff !== 0) return diff
        return a.priceValue - b.priceValue
      }
      return a.priceValue - b.priceValue
    })

    const orderedFlights = sorted.map((s) => s.flight)
    const topCount = Math.min(TOP_FLIGHTS_COUNT, orderedFlights.length)

    return {
      topResults: orderedFlights.slice(0, topCount),
      otherResults: orderedFlights.slice(topCount),
    }
  }, [filteredResults, sortMode])

  return {
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
    availableAirlines,
    priceRangeBounds,
    durationBounds,
    graphPoints,
    searchFlights,
  }
}

