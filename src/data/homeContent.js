// Homepage marketing content: offers and explore destinations.

const getDefaultDepartureDate = () => {
  const d = new Date()
  d.setDate(d.getDate() + 7)
  return d.toISOString().slice(0, 10)
}

// Default origin when user clicks an offer/destination (avoids empty-origin validation error).
export const DEFAULT_ORIGIN_FOR_OFFERS = {
  origin: 'DEL',
  originLabel: 'New Delhi (DEL)',
}

// Unsplash image IDs (w=400) for offers and explore; use landmark/country imagery.
const U = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=400&q=80`

export const HOME_OFFERS = [
  { id: 'dubai', title: 'Dubai', subtitle: 'From major cities', destination: 'DXB', destinationLabel: 'Dubai (DXB)', badge: 'Popular', imageUrl: U('1512453979798-5ea266f8880c') },
  { id: 'london', title: 'London', subtitle: 'Weekend getaways', destination: 'LHR', destinationLabel: 'London (LHR)', badge: null, imageUrl: U('1513635269975-59663e0ac1ad') },
  { id: 'singapore', title: 'Singapore', subtitle: 'Asia gateway', destination: 'SIN', destinationLabel: 'Singapore (SIN)', badge: null, imageUrl: U('1525625293386-3f8f99389edd') },
  { id: 'bangkok', title: 'Bangkok', subtitle: 'Best value', destination: 'BKK', destinationLabel: 'Bangkok (BKK)', badge: 'Deal', imageUrl: U('1528183928295-88a94fcdd936') },
]

export const HOME_DESTINATIONS = [
  { id: 'in', label: 'India', destination: 'DEL', destinationLabel: 'New Delhi (DEL)', imageUrl: U('1564507592333-c60657eea523') },
  { id: 'ae', label: 'UAE', destination: 'DXB', destinationLabel: 'Dubai (DXB)', imageUrl: U('1512453979798-5ea266f8880c') },
  { id: 'th', label: 'Thailand', destination: 'BKK', destinationLabel: 'Bangkok (BKK)', imageUrl: U('1528183928295-88a94fcdd936') },
  { id: 'sg', label: 'Singapore', destination: 'SIN', destinationLabel: 'Singapore (SIN)', imageUrl: U('1525625293386-3f8f99389edd') },
  { id: 'uk', label: 'UK', destination: 'LHR', destinationLabel: 'London (LHR)', imageUrl: U('1513635269975-59663e0ac1ad') },
  { id: 'us', label: 'USA', destination: 'JFK', destinationLabel: 'New York (JFK)', imageUrl: U('1496442226666-8d4d0e62e6e9') },
  { id: 'fr', label: 'France', destination: 'CDG', destinationLabel: 'Paris (CDG)', imageUrl: U('1502602898657-3e91760cbb34') },
  { id: 'jp', label: 'Japan', destination: 'NRT', destinationLabel: 'Tokyo (NRT)', imageUrl: U('1540959733332-eab4deabeeaf') },
  { id: 'au', label: 'Australia', destination: 'SYD', destinationLabel: 'Sydney (SYD)', imageUrl: U('1523482580671-f31bfd0e2f6b') },
  { id: 'ch', label: 'Switzerland', destination: 'ZRH', destinationLabel: 'Zurich (ZRH)', imageUrl: U('1531366936337-7c912a4589a7') },
]

// Placeholder content for scrollable homepage; no behaviour.
export const HOME_POPULAR_ROUTES = [
  'Delhi → Dubai',
  'Mumbai → Singapore',
  'Bangalore → London',
  'Chennai → Bangkok',
  'Delhi → New York',
  'Mumbai → Dubai',
  'Hyderabad → Singapore',
  'Kolkata → Bangkok',
]

export const HOME_TESTIMONIALS = [
  { quote: 'Found the best price in minutes. No hassle.', name: 'Priya M.' },
  { quote: 'Clean search, clear results. Will use again.', name: 'Rahul K.' },
  { quote: 'Easy to compare flights. Great experience.', name: 'Anita S.' },
]

export const HOME_FAQS = [
  { question: 'How do I search for flights?', answer: 'Enter your origin, destination, and travel dates in the search box. Spotter Sky compares prices across airlines and shows you the best options.' },
  { question: 'Are the prices in real time?', answer: 'Yes. We fetch live fares when you search so you see current availability and pricing.' },
  { question: 'Can I filter by stops or airline?', answer: 'Yes. Use the filters on the results page to narrow by number of stops, airline, price range, and duration.' },
  { question: 'Is my payment secure?', answer: 'Spotter Sky does not store payment details. When you book, you are directed to the airline or a secure payment partner.' },
  { question: 'Can I cancel or change my booking?', answer: 'Cancellation and change policies depend on the fare and airline. Check the fare rules before booking.' },
]

export function buildSearchParamsFromDestination({ destination, destinationLabel }) {
  return {
    origin: DEFAULT_ORIGIN_FOR_OFFERS.origin,
    originLabel: DEFAULT_ORIGIN_FOR_OFFERS.originLabel,
    destination: destination ?? '',
    destinationLabel: destinationLabel ?? '',
    departureDate: getDefaultDepartureDate(),
    returnDate: '',
    passengers: { adults: 1 },
    travelClass: 'ECONOMY',
  }
}
