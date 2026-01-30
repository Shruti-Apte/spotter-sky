// Formatters + validators. IATA → airline name.

const AIRLINE_NAMES = {
  AA: 'American Airlines',
  AC: 'Air Canada',
  AD: 'Azul Brazilian Airlines',
  AF: 'Air France',
  AI: 'Air India',
  AM: 'Aeroméxico',
  AS: 'Alaska Airlines',
  AV: 'Avianca',
  AZ: 'ITA Airways',
  BA: 'British Airways',
  B6: 'JetBlue Airways',
  BR: 'EVA Air',
  CA: 'Air China',
  CI: 'China Airlines',
  CM: 'Copa Airlines',
  CZ: 'China Southern Airlines',
  DL: 'Delta Air Lines',
  DY: 'Norwegian Air Shuttle',
  EK: 'Emirates',
  ET: 'Ethiopian Airlines',
  EY: 'Etihad Airways',
  F9: 'Frontier Airlines',
  FR: 'Ryanair',
  GF: 'Gulf Air',
  G4: 'Allegiant Air',
  IB: 'Iberia',
  JL: 'Japan Airlines',
  JQ: 'Jetstar Airways',
  KE: 'Korean Air',
  KL: 'KLM',
  KQ: 'Kenya Airways',
  LA: 'LATAM Airlines',
  LH: 'Lufthansa',
  LX: 'Swiss International Air Lines',
  MS: 'EgyptAir',
  MU: 'China Eastern Airlines',
  NH: 'All Nippon Airways',
  NK: 'Spirit Airlines',
  NZ: 'Air New Zealand',
  OS: 'Austrian Airlines',
  OZ: 'Asiana Airlines',
  PR: 'Philippine Airlines',
  QF: 'Qantas',
  QR: 'Qatar Airways',
  SA: 'South African Airways',
  SK: 'Scandinavian Airlines',
  SN: 'Brussels Airlines',
  SQ: 'Singapore Airlines',
  SY: 'Sun Country Airlines',
  TG: 'Thai Airways',
  UA: 'United Airlines',
  UK: 'Vistara',
  U2: 'easyJet',
  VA: 'Virgin Australia',
  VN: 'Vietnam Airlines',
  VY: 'Vueling',
  WN: 'Southwest Airlines',
  WS: 'WestJet',
  WY: 'Oman Air',
  '2B': 'Aerolineas Argentinas',
  '5J': 'Cebu Pacific',
  '6E': 'IndiGo',
  // Mock carriers
  AeroBlue: 'AeroBlue',
  CloudNine: 'CloudNine',
  Nimbus: 'Nimbus Air',
  NimbusAir: 'Nimbus Air',
  SkyJet: 'SkyJet',
}

// IATA → city (City (CODE)). TODO: API lookup when available.
const AIRPORT_CITIES = {
  BOM: 'Mumbai', DEL: 'Delhi', BLR: 'Bengaluru', MAA: 'Chennai', HYD: 'Hyderabad',
  CCU: 'Kolkata', COK: 'Kochi', GOI: 'Goa', AMD: 'Ahmedabad', JFK: 'New York',
  EWR: 'Newark', LGA: 'New York', LAX: 'Los Angeles', SFO: 'San Francisco',
  ORD: 'Chicago', DFW: 'Dallas', MIA: 'Miami', BOS: 'Boston', IAD: 'Washington',
  ZRH: 'Zurich', GVA: 'Geneva', BSL: 'Basel', MUC: 'Munich', FRA: 'Frankfurt',
  CDG: 'Paris', LHR: 'London', AMS: 'Amsterdam', FCO: 'Rome', MAD: 'Madrid',
  DXB: 'Dubai', DOH: 'Doha', AUH: 'Abu Dhabi', SIN: 'Singapore', HKG: 'Hong Kong',
  NRT: 'Tokyo', KIX: 'Osaka', ICN: 'Seoul', PEK: 'Beijing', PVG: 'Shanghai',
  SYD: 'Sydney', MEL: 'Melbourne', AKL: 'Auckland', YYZ: 'Toronto', YVR: 'Vancouver',
  MEX: 'Mexico City', GRU: 'São Paulo', EZE: 'Buenos Aires', BOG: 'Bogotá',
  ATL: 'Atlanta', DEN: 'Denver', SEA: 'Seattle', PHX: 'Phoenix', LAS: 'Las Vegas',
}

// Cabin code → label
const CABIN_LABELS = {
  Y: 'Economy', M: 'Economy', W: 'Premium economy', C: 'Business', J: 'Business',
  F: 'First', P: 'First',
}

// Aircraft code → name
const AIRCRAFT_NAMES = {
  '333': 'Airbus A330', '339': 'Airbus A330neo', '359': 'Airbus A350', '388': 'Airbus A380',
  '320': 'Airbus A320', '321': 'Airbus A321', '319': 'Airbus A319', '32N': 'Airbus A320neo',
  '738': 'Boeing 737', '739': 'Boeing 737', '77W': 'Boeing 777', '788': 'Boeing 787',
  '789': 'Boeing 787', '78X': 'Boeing 787', '744': 'Boeing 747', '77L': 'Boeing 777',
  E90: 'Embraer E190', E95: 'Embraer E195', CR9: 'Bombardier CRJ900',
}

/** City (CODE); code only if unknown. */
export function getAirportLabel(iata) {
  if (iata == null || String(iata).trim() === '') return '—'
  const code = String(iata).trim().toUpperCase()
  const city = AIRPORT_CITIES[code]
  return city ? `${city} (${code})` : code
}

/** IATA or carrier name → display name; fallback to input. */
export function getAirlineName(code) {
  if (code == null || String(code).trim() === '') return '—'
  const key = String(code).trim()
  return AIRLINE_NAMES[key] ?? key
}

/** Cabin code → label (Y/C/W etc). */
export function getCabinLabel(code) {
  if (code == null || String(code).trim() === '') return ''
  const key = String(code).trim().toUpperCase()
  return CABIN_LABELS[key] ?? code
}

/** Aircraft code → display name. */
export function getAircraftLabel(code) {
  if (code == null || String(code).trim() === '') return ''
  const key = String(code).trim()
  return AIRCRAFT_NAMES[key] ?? code
}

/** Price for display; handles missing/invalid. */
export function formatPrice(price) {
  if (price == null) return '—'
  const total = price.total
  const currency = price.currency ?? 'USD'
  if (!Number.isFinite(total)) return '—'
  return `${currency} ${total}`
}
