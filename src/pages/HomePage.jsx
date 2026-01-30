import { useEffect, useRef, useState } from 'react'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Card,
  CardActionArea,
  Chip,
  IconButton,
  Stack,
  Typography,
} from '@mui/material'
import {
  ChevronLeft,
  ChevronRight,
  ExpandMore,
  FlightTakeoff,
  FormatQuote,
  LocalOffer,
  Security,
  Support,
} from '@mui/icons-material'
import SearchForm from '../components/SearchForm.jsx'
import Footer from '../components/Footer.jsx'
import {
  HOME_OFFERS,
  HOME_DESTINATIONS,
  HOME_POPULAR_ROUTES,
  HOME_TESTIMONIALS,
  HOME_FAQS,
  buildSearchParamsFromDestination,
} from '../data/homeContent.js'

const TRUST_ITEMS = [
  { icon: LocalOffer, label: 'Best price' },
  { icon: Security, label: 'Secure booking' },
  { icon: Support, label: '24/7 support' },
  { icon: FlightTakeoff, label: 'No hidden fees' },
]

const EXPLORE_CAROUSEL_INTERVAL_MS = 4500
const EXPLORE_CARD_WIDTH = 200
const EXPLORE_CARD_GAP = 16

// Landing sections.
export default function HomePage({ onSearch }) {
  const exploreCarouselRef = useRef(null)
  const [exploreIndex, setExploreIndex] = useState(0)
  const numExplore = HOME_DESTINATIONS.length
  const exploreStep = EXPLORE_CARD_WIDTH + EXPLORE_CARD_GAP

  useEffect(() => {
    const t = setInterval(() => {
      setExploreIndex((prev) => (prev + 1) % numExplore)
    }, EXPLORE_CAROUSEL_INTERVAL_MS)
    return () => clearInterval(t)
  }, [numExplore])

  useEffect(() => {
    if (exploreCarouselRef.current) {
      exploreCarouselRef.current.scrollTo({
        left: exploreIndex * exploreStep,
        behavior: 'smooth',
      })
    }
  }, [exploreIndex, exploreStep])

  const handleDestinationClick = (item) => {
    const params = buildSearchParamsFromDestination(item)
    onSearch?.(params)
  }

  return (
    <Box sx={{ position: 'relative', zIndex: 1 }}>
      <Stack spacing={6} sx={{ pt: { xs: 3, sm: 5 }, pb: { xs: 8, sm: 10 } }}>
        {/* Hero */}
        <Box>
          <Typography
            variant="h1"
            sx={{
              fontWeight: 850,
              letterSpacing: -0.8,
              fontSize: { xs: '2.5rem', sm: '3rem' },
              lineHeight: 1.15,
              color: 'primary.main',
            }}
          >
            Find flights fast.
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ maxWidth: '100%', fontSize: '0.9rem' }}
          >
            Search, compare, and book, no hidden fees.
          </Typography>
          {/* Search — more padding */}
        <Box sx={{ py: 2 }}>
          <SearchForm onSearch={onSearch} />
        </Box>
        </Box>

        

        {/* Top offers */}
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 650, mb: 2 }}>
            Top offers
          </Typography>
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              overflowX: 'auto',
              pb: 1,
              scrollSnapType: 'x mandatory',
              '& > *': { scrollSnapAlign: 'start', flexShrink: 0 },
            }}
          >
            {HOME_OFFERS.map((offer) => (
              <Card
                key={offer.id}
                elevation={0}
                sx={{
                  width: 200,
                  minWidth: 200,
                  borderRadius: 2,
                  overflow: 'hidden',
                  border: '1px solid',
                  borderColor: 'divider',
                  transition: 'box-shadow 0.2s, transform 0.2s',
                  '&:hover': {
                    boxShadow: 3,
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <CardActionArea
                  onClick={() => handleDestinationClick(offer)}
                  sx={{ display: 'block', height: 240 }}
                >
                  <Box
                    sx={{
                      height: '100%',
                      backgroundImage: offer.imageUrl ? `url(${offer.imageUrl})` : undefined,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      justifyContent: 'flex-end',
                      p: 1.5,
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 55%)',
                        pointerEvents: 'none',
                      },
                    }}
                  >
                    {offer.badge && (
                      <Chip
                        label={offer.badge}
                        size="small"
                        color="primary"
                        sx={{ mb: 1, height: 20, fontSize: '0.7rem', position: 'relative', zIndex: 1 }}
                      />
                    )}
                    <Typography variant="subtitle1" fontWeight={600} sx={{ color: 'white', textShadow: '0 1px 2px rgba(0,0,0,0.8)', position: 'relative', zIndex: 1 }}>
                      {offer.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.9)', textShadow: '0 1px 2px rgba(0,0,0,0.8)', position: 'relative', zIndex: 1 }}>
                      {offer.subtitle}
                    </Typography>
                  </Box>
                </CardActionArea>
              </Card>
            ))}
          </Box>
        </Box>

         {/* Why book */}
         <Box
          sx={{
            py: 3.5,
            px: 2,
            borderRadius: 2,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant="h6" fontWeight={650} sx={{ mb: 0.5, textAlign: 'center' }}>
            Why book with Spotter Sky
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 2, maxWidth: 420, mx: 'auto' }}>
            Compare hundreds of routes in one place. No hidden fees, no surprises, just clear prices and a simple booking experience.
          </Typography>
          <Stack
            direction="row"
            flexWrap="wrap"
            justifyContent="center"
            useFlexGap
            spacing={{ xs: 2, sm: 3 }}
          >
            {TRUST_ITEMS.map((item) => {
              const IconComponent = item.icon
              return (
                <Stack key={item.label} alignItems="center" spacing={0.5} sx={{ minWidth: 80 }}>
                  <IconComponent sx={{ fontSize: 28, color: 'primary.main' }} />
                  <Typography variant="caption" color="text.secondary">
                    {item.label}
                  </Typography>
                </Stack>
              )
            })}
          </Stack>
        </Box>

        {/* Explore carousel */}
        <Box sx={{ position: 'relative' }}>
          <Typography variant="h6" sx={{ fontWeight: 650, mb: 2 }}>
            Explore the world with Spotter Sky
          </Typography>
          <Box
            ref={exploreCarouselRef}
            sx={{
              display: 'flex',
              gap: 2,
              overflowX: 'auto',
              pb: 1,
              scrollSnapType: 'x mandatory',
              scrollBehavior: 'smooth',
              WebkitOverflowScrolling: 'touch',
              '&::-webkit-scrollbar': { display: 'none' },
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              '& > *': { scrollSnapAlign: 'start', flexShrink: 0 },
            }}
          >
            {HOME_DESTINATIONS.map((dest) => (
              <Card
                key={dest.id}
                elevation={0}
                sx={{
                  width: 200,
                  minWidth: 200,
                  borderRadius: 2,
                  overflow: 'hidden',
                  border: '1px solid',
                  borderColor: 'divider',
                  transition: 'box-shadow 0.2s, transform 0.2s',
                  '&:hover': {
                    boxShadow: 3,
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <CardActionArea
                  onClick={() => handleDestinationClick(dest)}
                  sx={{ display: 'block', height: 240 }}
                >
                  <Box
                    sx={{
                      height: '100%',
                      backgroundImage: dest.imageUrl ? `url(${dest.imageUrl})` : undefined,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      display: 'flex',
                      alignItems: 'flex-end',
                      p: 1.5,
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)',
                        pointerEvents: 'none',
                      },
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      fontWeight={600}
                      sx={{
                        color: 'white',
                        textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                        position: 'relative',
                        zIndex: 1,
                      }}
                    >
                      {dest.label}
                    </Typography>
                  </Box>
                </CardActionArea>
              </Card>
            ))}
          </Box>
        </Box>

        {/* Pitch strip */}
        <Box
          sx={{
            py: 4,
            px: 2,
            borderRadius: 2,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            textAlign: 'center',
          }}
        >
          <FlightTakeoff sx={{ fontSize: 40, color: 'primary.main', mb: 1.5 }} />
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 0.5 }}>
            Compare prices. Book in one place. No hidden fees.
          </Typography>
          <Typography variant="body2" color="text.secondary">
           Spotter Sky, Your next trip starts here.
          </Typography>
        </Box>
        
        {/* Popular routes (placeholder) */}
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 650, mb: 2 }}>
            Popular routes
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {HOME_POPULAR_ROUTES.map((route) => (
              <Chip
                key={route}
                label={route}
                variant="outlined"
                sx={{
                  borderColor: 'divider',
                  cursor: 'default',
                  '&:hover': { bgcolor: 'transparent' },
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Testimonials */}
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 650, mb: 2 }}>
            What travellers say
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            {HOME_TESTIMONIALS.map((t, i) => (
              <Card
                key={i}
                elevation={0}
                sx={{
                  flex: 1,
                  minWidth: 0,
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                }}
              >
                <FormatQuote sx={{ color: 'divider', fontSize: 28, mb: 0.5 }} />
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {t.quote}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  — {t.name}
                </Typography>
              </Card>
            ))}
          </Stack>
        </Box>

        {/* Travel tips */}
        <Box
          sx={{
            py: 3,
            px: 2,
            borderRadius: 2,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 650, mb: 2 }}>
            Travel tips
          </Typography>
          <Stack spacing={1.5}>
            <Typography variant="body2" color="text.secondary">
              • Book in advance for better prices on popular routes.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Compare one-way and round-trip. sometimes two one-ways can be cheaper.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Use filters to find nonstop flights or your preferred airline.
            </Typography>
          </Stack>
        </Box>

        {/* FAQ */}
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 650, mb: 2 }}>
            Frequently asked questions
          </Typography>
          {HOME_FAQS.map((faq, i) => (
            <Accordion
              key={i}
              disableGutters
              elevation={0}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                '&:not(:last-of-type)': { mb: 1 },
                '&:before': { display: 'none' },
              }}
            >
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="subtitle2" fontWeight={600}>
                  {faq.question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="text.secondary">
                  {faq.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>

        <Footer />
      </Stack>
    </Box>
  )
}
