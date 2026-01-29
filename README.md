# SPOTTER SKY

Flight search UI that lets users enter origin/destination/dates and see results with filters, sorting, and price trends—without leaving the client.

---

## Project Overview

Spotter Sky is a single-page flight search app. Users set trip type, dates, passengers, and class; search runs against the Amadeus Self-Service API (or a mock when credentials are missing). Results support filtering by stops, airlines, price, and duration, plus sorting and a simple price-over-time graph.

## Tech Stack

- **Runtime:** React 19, Vite 7
- **UI:** MUI 7 (Material UI), Emotion, Recharts
- **Routing:** React Router 7
- **Data:** Amadeus Flight Create Order (test API) + Airport & City Search; all calls from the browser

## Pages

| Page | Purpose |
|------|--------|
| **Home** | Search form (origin, destination, dates, passengers, class). Submit navigates to Results. |
| **Results** | Renders search state from `useFlights`: loading/skeletons, error message, or flight list with FiltersBar, sort, and price graph. |

## Key Components

- **SearchForm** — Origin/destination autocomplete (Amadeus locations), dates, passenger selector, class; recent searches; optional auto-search on Results.
- **FiltersBar** — Stops, airlines, price range, max duration; chips with clear-all.
- **FlightCard** — Single flight: segments, times, carrier, price.
- **PriceGraph** — Recharts line chart of price vs. date for displayed results.
- **CloudLayer** — Scroll-linked sky/cloud background.
- **useFlights** — Single state owner for params, results, loading, error, filters, sort; exposes `searchFlights`, filtered/sorted lists, and actions. No React Context.
- **flightService** — Amadeus OAuth token (in-memory cache), `searchFlights`, `searchLocations`. Uses `VITE_*` env vars.

## Setup & Run

1. **Clone and install**
   ```bash
   npm install
   ```

2. **Amadeus env vars** (create `.env` in project root):
   ```env
   VITE_AMADEUS_CLIENT_ID=your_client_id
   VITE_AMADEUS_CLIENT_SECRET=your_client_secret
   ```
   Get credentials from [Amadeus Self-Service](https://developers.amadeus.com/). Without them, the app falls back to mock flight data so you can run and demo locally.

3. **Run**
   ```bash
   npm run dev
   ```
   Open the URL Vite prints (e.g. `http://localhost:5173`).

4. **Build**
   ```bash
   npm run build
   npm run preview   # optional: serve dist
   ```

## Notes

- **Client-side API usage is intentional** for this assignment: fast to implement and demo. For production, credentials and Amadeus calls should live behind a backend proxy.

---

## Design & Engineering Decisions

### Why Amadeus Self-Service API

Industry-standard flight API with a test sandbox, clear docs, and airport/search endpoints. Fits a portfolio project that needs real-ish data and realistic params (IATA, dates, class) without backend infra.

### Why Google Flights–style search params

Origin, destination, departure (and optional return) date, passengers, cabin class map cleanly to Amadeus and to user mental models. Single search form keeps the scope tight and the UX familiar.

### Why useFlights as single state owner (no Context yet)

All search state (params, results, loading, error, filters, sort) lives in one hook and is passed down via props. No global Context was added to avoid over-engineering for two routes and one main consumer (Results). If the app grew (e.g. shared state across many screens), lifting into Context or a small store would be the next step.

### Why client-side API (tradeoff explained)

Calling Amadeus from the browser gets the assignment running quickly and keeps the repo a single Vite app. The tradeoff is exposing client credentials in the built bundle; the code comments that production should use a backend proxy for token and API calls. Mock fallback when env vars are missing allows runs without Amadeus setup.

### UX priorities

- **Instant feedback:** Loading skeletons and disabled states so the UI never feels stuck.
- **Skeletons:** Results page shows skeleton cards while fetching instead of a blank area.
- **Filters:** Stops, airlines, price, duration as chips; filters apply in-memory to current result set so responses feel immediate without extra network round-trips.
