import { CssBaseline, Container, Box } from '@mui/material'
import { ThemeProvider } from '@mui/material/styles'
import { useMemo, useState, useCallback } from 'react'
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import CloudLayer from './components/CloudLayer.jsx'
import IntroLoader from './components/IntroLoader.jsx'
import AutonomousFlight from './components/AutonomousFlight.jsx'
import NavBar from './components/NavBar.jsx'
import HomePage from './pages/HomePage.jsx'
import ResultsPage from './pages/ResultsPage.jsx'
import { createAppTheme } from './theme.js'
import { useFlights } from './hooks/useFlights.js'

// TODO: analytics (params, no PII)
function AppRoutes({ flights }) {
  const navigate = useNavigate()

  const handleSearch = (params) => {
    flights.searchFlights(params)
    const q = new URLSearchParams()
    q.set('origin', params.origin ?? '')
    q.set('destination', params.destination ?? '')
    q.set('originLabel', params.originLabel ?? '')
    q.set('destinationLabel', params.destinationLabel ?? '')
    q.set('departureDate', params.departureDate ?? '')
    if (params.returnDate) q.set('returnDate', params.returnDate)
    q.set('adults', String(params.passengers?.adults ?? 1))
    q.set('travelClass', params.travelClass ?? 'ECONOMY')
    navigate(`/results?${q.toString()}`)
  }

  return (
    <Routes>
      <Route path="/" element={<HomePage onSearch={handleSearch} />} />
      <Route path="/results" element={<ResultsPage flights={flights} />} />
    </Routes>
  )
}

export default function App() {
  const theme = useMemo(() => createAppTheme(), [])
  const flights = useFlights()
  const [introDone, setIntroDone] = useState(false)
  const handleIntroComplete = useCallback(() => setIntroDone(true), [])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {!introDone && <IntroLoader onComplete={handleIntroComplete} />}
      <Box sx={{ minHeight: '100dvh', position: 'relative' }}>
      
        <Box sx={{ position: 'fixed', inset: 0, zIndex: -1 }}>
          <CloudLayer />
          <AutonomousFlight />
        </Box>

        <BrowserRouter>
          <Container
            maxWidth="md"
            sx={{
              position: 'relative',
              zIndex: 1,
              px: { xs: 2, sm: 2.5 },
            }}
          >
            <NavBar />
            <AppRoutes flights={flights} />
          </Container>
        </BrowserRouter>
      </Box>
    </ThemeProvider>
  )
}
