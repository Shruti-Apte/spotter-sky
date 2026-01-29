// Amadeus flight + location APIs; token cached in memory. In production, use a backend proxy.
const AMADEUS_BASE_URL = 'https://test.api.amadeus.com'
const TOKEN_BUFFER_MS = 60_000
const DEFAULT_TOKEN_EXPIRY_SEC = 1800
const LOCATIONS_PAGE_LIMIT = 5
const MOCK_SEARCH_DELAY_MS = 1200
const MOCK_PRICE_BASE = 150
const MOCK_PRICE_RANGE = 180
const MOCK_LAYOVER_BASE_MIN = 60
const MOCK_LAYOVER_INCREMENT_MIN = 30
const MOCK_FLIGHT_NUMBER_MOD = 900
const MOCK_HUB_CODES = ['ORD', 'DEN', 'DFW', 'ATL', 'DXB']
const MOCK_AIRCRAFT_CODE = '333'
const MOCK_CABIN_CODE = 'Y'

let cachedAccessToken = null
let cachedTokenExpiresAt = 0

async function getAccessToken() {
  const clientId = import.meta.env.VITE_AMADEUS_CLIENT_ID
  const clientSecret = import.meta.env.VITE_AMADEUS_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('Amadeus client credentials are not configured in .env')
  }

  const now = Date.now()
  if (cachedAccessToken && cachedTokenExpiresAt - TOKEN_BUFFER_MS > now) {
    return cachedAccessToken
  }

  const body = new URLSearchParams()
  body.set('grant_type', 'client_credentials')
  body.set('client_id', clientId)
  body.set('client_secret', clientSecret)

  const response = await fetch(`${AMADEUS_BASE_URL}/v1/security/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  })

  if (!response.ok) {
    throw new Error('Failed to obtain Amadeus access token')
  }

  const data = await response.json()
  const expiresInSeconds = typeof data.expires_in === 'number' ? data.expires_in : DEFAULT_TOKEN_EXPIRY_SEC

  cachedAccessToken = data.access_token
  cachedTokenExpiresAt = Date.now() + expiresInSeconds * 1000

  return cachedAccessToken
}

function normalizeFlightOffer(offer) {
  const id = offer.id

  const itineraries = offer.itineraries ?? []
  const validatingCarriers = offer.validatingAirlineCodes ?? []
  const airlineCode = validatingCarriers[0] ?? offer.carrierCode ?? '—'

  const allSegments = itineraries.flatMap((it) => it.segments ?? [])

  if (!allSegments.length) {
    return null
  }

  const firstSegment = allSegments[0]
  const lastSegment = allSegments[allSegments.length - 1]

  const departureAt = firstSegment.departure?.at
  const arrivalAt = lastSegment.arrival?.at
  const departureIata = firstSegment.departure?.iataCode ?? null
  const arrivalIata = lastSegment.arrival?.iataCode ?? null

  const priceTotal = Number.parseFloat(offer.price?.total ?? 'NaN')
  const priceCurrency = offer.price?.currency ?? 'USD'

  const durationIso = itineraries[0]?.duration ?? offer.duration

  const durationMinutes = parseIsoDurationToMinutes(durationIso)
  const departureMinutes = departureAt ? dateTimeToMinutes(departureAt) : null

  const stops = Math.max(0, allSegments.length - 1)

  const fareDetailsBySegment = offer.travelerPricings?.[0]?.fareDetailsBySegment ?? []
  const segments = allSegments.map((seg, idx) => {
    const depAt = seg.departure?.at
    const arrAt = seg.arrival?.at
    const segDurIso = seg.duration
    const segDurMin = parseIsoDurationToMinutes(segDurIso)
    const fareDetail = fareDetailsBySegment[idx]
    const cabin = fareDetail?.cabin ?? seg.class ?? null
    return {
      departureTime: depAt ? depAt.slice(11, 16) : '—',
      arrivalTime: arrAt ? arrAt.slice(11, 16) : '—',
      departureIata: seg.departure?.iataCode ?? '—',
      arrivalIata: seg.arrival?.iataCode ?? '—',
      duration: segDurMin != null ? formatDuration(segDurMin) : '—',
      durationMinutes: segDurMin,
      carrierCode: seg.carrierCode ?? null,
      number: seg.number ?? null,
      aircraftCode: seg.aircraft?.code ?? null,
      cabin: cabin ?? null,
    }
  })

  const layovers = []
  for (let i = 0; i < allSegments.length - 1; i++) {
    const arrAt = allSegments[i].arrival?.at
    const depAt = allSegments[i + 1].departure?.at
    const airportIata = allSegments[i].arrival?.iataCode ?? '—'
    let durationMinutes = null
    if (arrAt && depAt) {
      const arrMs = new Date(arrAt).getTime()
      const depMs = new Date(depAt).getTime()
      durationMinutes = Math.round((depMs - arrMs) / 60000)
    }
    layovers.push({
      airportIata,
      durationMinutes: durationMinutes != null ? durationMinutes : 0,
      duration: durationMinutes != null ? formatDuration(durationMinutes) : '—',
    })
  }

  return {
    id,
    airlineCode,
    airline: airlineCode,
    price: Number.isFinite(priceTotal)
      ? { total: priceTotal, currency: priceCurrency }
      : { total: 0, currency: priceCurrency },
    stops,
    durationMinutes,
    departureMinutes,
    departureTime: departureAt ? departureAt.slice(11, 16) : '—',
    arrivalTime: arrivalAt ? arrivalAt.slice(11, 16) : '—',
    duration: durationMinutes != null ? formatDuration(durationMinutes) : '—',
    departureIata: departureIata || undefined,
    arrivalIata: arrivalIata || undefined,
    segments,
    layovers,
  }
}

function parseIsoDurationToMinutes(value) {
  if (!value || typeof value !== 'string') return null
  // Simple ISO-8601 duration parser for patterns like "PT10H20M".
  const match = value.match(/PT(?:(\d+)H)?(?:(\d+)M)?/)
  if (!match) return null
  const hours = match[1] ? Number(match[1]) : 0
  const minutes = match[2] ? Number(match[2]) : 0
  return hours * 60 + minutes
}

function dateTimeToMinutes(isoString) {
  // Use local time extracted from ISO string: "YYYY-MM-DDTHH:mm:ss"
  const timePart = isoString.split('T')[1] ?? ''
  const [hStr, mStr] = timePart.split(':')
  const h = Number(hStr ?? 0)
  const m = Number(mStr ?? 0)
  return h * 60 + m
}

function formatDuration(totalMinutes) {
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return `${h}h ${m}m`
}

async function searchFlightsAmadeus(searchParams) {
  const token = await getAccessToken()

  const { origin, destination, departureDate, returnDate, passengers, travelClass } = searchParams

  const url = new URL(`${AMADEUS_BASE_URL}/v2/shopping/flight-offers`)
  url.searchParams.set('originLocationCode', origin)
  url.searchParams.set('destinationLocationCode', destination)
  url.searchParams.set('departureDate', departureDate)
  if (returnDate) {
    url.searchParams.set('returnDate', returnDate)
  }
  url.searchParams.set('adults', String(passengers?.adults ?? 1))
  url.searchParams.set('currencyCode', 'USD')

  if (travelClass) {
    url.searchParams.set('travelClass', travelClass)
  }

  url.searchParams.set('max', '20')

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    // If error message is not available, use a default message
    let message = 'Amadeus flight search failed'
    try {
      const err = await response.json()
      if (Array.isArray(err.errors) && err.errors[0]?.detail) {
        message = err.errors[0].detail
      }
    } catch {
      // ignore JSON parse errors
    }
    throw new Error(message)
  }

  const payload = await response.json()
  const offers = Array.isArray(payload.data) ? payload.data : []

  const normalized = offers
    .map((offer) => normalizeFlightOffer(offer))
    .filter((f) => f !== null)

  // If nothing normalizes, fall back to empty list; UI will show empty state.
  return normalized
}

export async function searchLocations(keyword, signal = null) {
  if (!keyword || keyword.trim().length < 2) {
    return []
  }

  try {
    const token = await getAccessToken()

    const url = new URL(`${AMADEUS_BASE_URL}/v1/reference-data/locations`)
    url.searchParams.set('keyword', keyword.trim())
    url.searchParams.set('subType', 'AIRPORT,CITY')
    url.searchParams.set('page[limit]', String(LOCATIONS_PAGE_LIMIT))

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      signal,
    })

    if (!response.ok) return []

    const payload = await response.json()
    const locations = Array.isArray(payload.data) ? payload.data : []
    return locations
      .map((loc) => {
        const iata = loc.iataCode
        if (!iata) return null

        const name = loc.name ?? ''
        const subType = loc.subType ?? ''
        const cityName = loc.address?.cityName ?? ''

        let label = name
        if (subType === 'CITY' && cityName && cityName !== name) {
          label = `${cityName} (${iata})`
        } else if (subType === 'AIRPORT') {
          label = `${name} (${iata})`
        } else {
          label = `${name} (${iata})`
        }

        return { iata, label }
      })
      .filter((opt) => opt !== null)
  } catch (error) {
    if (error?.name === 'AbortError') {
      return []
    }
    return []
  }
}

export async function searchFlights(params) {
  try {
    return await searchFlightsAmadeus(params)
  } catch (error) {
    if (import.meta.env.DEV) {
      return await searchFlightsMock(params)
    }

    throw error instanceof Error ? error : new Error('Amadeus flight search failed')
  }
}

export async function searchFlightsMock(searchParams) {
  await new Promise((r) => setTimeout(r, MOCK_SEARCH_DELAY_MS))

  const { origin, destination, departureDate } = searchParams
  const seed = `${origin}-${destination}-${departureDate}`

  const hash = Array.from(seed).reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  const base = MOCK_PRICE_BASE + (hash % MOCK_PRICE_RANGE)

  const toTime = (minutes) => {
    const h = String(Math.floor(minutes / 60)).padStart(2, '0')
    const m = String(minutes % 60).padStart(2, '0')
    return `${h}:${m}`
  }

  const flights = [
    {
      id: `${seed}-1`,
      airline: 'SkyJet',
      price: { total: base + 25, currency: 'USD' },
      stops: 0,
      departureMinutes: 8 * 60 + 15,
      durationMinutes: 260,
    },
    {
      id: `${seed}-2`,
      airline: 'AeroBlue',
      price: { total: base + 5, currency: 'USD' },
      stops: 1,
      departureMinutes: 10 * 60 + 40,
      durationMinutes: 315,
    },
    {
      id: `${seed}-3`,
      airline: 'Nimbus Air',
      price: { total: base + 72, currency: 'USD' },
      stops: 0,
      departureMinutes: 18 * 60 + 20,
      durationMinutes: 250,
    },
    {
      id: `${seed}-4`,
      airline: 'SkyJet',
      price: { total: base + 55, currency: 'USD' },
      stops: 2,
      departureMinutes: 6 * 60 + 30,
      durationMinutes: 420,
    },
    {
      id: `${seed}-5`,
      airline: 'CloudNine',
      price: { total: base + 40, currency: 'USD' },
      stops: 1,
      departureMinutes: 13 * 60 + 5,
      durationMinutes: 310,
    },
    {
      id: `${seed}-6`,
      airline: 'AeroBlue',
      price: { total: base + 90, currency: 'USD' },
      stops: 2,
      departureMinutes: 21 * 60 + 10,
      durationMinutes: 460,
    },
    {
      id: `${seed}-7`,
      airline: 'Nimbus Air',
      price: { total: base + 10, currency: 'USD' },
      stops: 0,
      departureMinutes: 5 * 60 + 50,
      durationMinutes: 240,
    },
  ]

  return flights.map((f) => {
    const depTime = toTime(f.departureMinutes)
    const arrTime = toTime(f.departureMinutes + f.durationMinutes)
    const durationStr = `${Math.floor(f.durationMinutes / 60)}h ${f.durationMinutes % 60}m`
    const segCount = f.stops + 1
    const segDurationMin = Math.floor(f.durationMinutes / segCount)
    const segments = []
    const layovers = []
    let t = f.departureMinutes
    // Build segments and layovers for expanded card when Amadeus is unavailable.
    for (let i = 0; i < segCount; i++) {
      const isFirst = i === 0
      const isLast = i === segCount - 1
      const depIata = isFirst ? origin : MOCK_HUB_CODES[(i - 1) % MOCK_HUB_CODES.length]
      const arrIata = isLast ? destination : MOCK_HUB_CODES[i % MOCK_HUB_CODES.length]
      const arrT = t + segDurationMin
      segments.push({
        departureTime: toTime(t),
        arrivalTime: toTime(arrT),
        departureIata: depIata,
        arrivalIata: arrIata,
        duration: `${Math.floor(segDurationMin / 60)}h ${segDurationMin % 60}m`,
        durationMinutes: segDurationMin,
        carrierCode: f.airline || 'XX',
        number: String(100 + (f.departureMinutes % MOCK_FLIGHT_NUMBER_MOD)),
        aircraftCode: MOCK_AIRCRAFT_CODE,
        cabin: MOCK_CABIN_CODE,
      })
      if (!isLast) {
        const layoverMin = MOCK_LAYOVER_BASE_MIN + (i * MOCK_LAYOVER_INCREMENT_MIN)
        layovers.push({
          airportIata: arrIata,
          durationMinutes: layoverMin,
          duration: `${Math.floor(layoverMin / 60)}h ${layoverMin % 60}m`,
        })
        t = arrT + layoverMin
      } else {
        t = arrT
      }
    }
    return {
      ...f,
      departureTime: depTime,
      arrivalTime: arrTime,
      duration: durationStr,
      departureIata: origin,
      arrivalIata: destination,
      segments,
      layovers,
    }
  })
}

