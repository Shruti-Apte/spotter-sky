import { useEffect, useState } from 'react'
import { Box } from '@mui/material'

const FluffyCloud = ({ top, left, scale, opacity, scrollSpeed, scrollY }) => (
  <Box
    sx={{
      position: 'absolute',
      top,
      left,
      opacity,
      // The magic: clouds at the bottom move much faster to "pull" the group apart
      transform: `translateY(${scrollY * scrollSpeed}px) scale(${scale})`,
      pointerEvents: 'none',
      filter: 'blur(10px)',
    }}
  >
    <Box sx={{ position: 'relative', width: '450px', height: '80px' }}>
      <Box sx={{ position: 'absolute', bottom: 10, width: '420px', height: '35px', bgcolor: 'white', borderRadius: '60px' }} />
      <Box sx={{ position: 'absolute', top: 5, left: 40, width: 70, height: 70, bgcolor: 'white', borderRadius: '50%' }} />
      <Box sx={{ position: 'absolute', top: -15, left: 100, width: 100, height: 100, bgcolor: 'white', borderRadius: '50%' }} />
      <Box sx={{ position: 'absolute', top: -5, left: 180, width: 85, height: 85, bgcolor: 'white', borderRadius: '50%' }} />
      <Box sx={{ position: 'absolute', top: 10, left: 250, width: 75, height: 75, bgcolor: 'white', borderRadius: '50%' }} />
      <Box sx={{ position: 'absolute', top: 20, left: 320, width: 60, height: 60, bgcolor: 'white', borderRadius: '50%' }} />
    </Box>
  </Box>
);


export default function CloudLayer() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const skyTop = '#77C9FF'
  const skyBottom = '#D0EFFF'

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        background: `linear-gradient(180deg, ${skyTop} 0%, ${skyBottom} 100%)`,
      }}
    >
      {/* THE COMPRESSED CLOUD CLUSTER (Stacked at the top) */}
      
      {/* BACK ROW (Moves slowest) */}
      <FluffyCloud top="2%" left="-10%" scale={0.6} opacity={0.4} scrollSpeed={0.05} scrollY={scrollY} />
      <FluffyCloud top="5%" left="30%" scale={0.7} opacity={0.5} scrollSpeed={0.06} scrollY={scrollY} />
      <FluffyCloud top="3%" left="70%" scale={0.6} opacity={0.4} scrollSpeed={0.04} scrollY={scrollY} />

      {/* MIDDLE ROW */}
      <FluffyCloud top="10%" left="10%" scale={1.0} opacity={0.6} scrollSpeed={0.15} scrollY={scrollY} />
      <FluffyCloud top="12%" left="55%" scale={0.9} opacity={0.7} scrollSpeed={0.18} scrollY={scrollY} />
      <FluffyCloud top="8%" left="-20%" scale={1.1} opacity={0.5} scrollSpeed={0.12} scrollY={scrollY} />

      {/* FRONT ROW (Moves fastest, "breaking away" from the cluster) */}
      <FluffyCloud top="15%" left="-5%" scale={1.3} opacity={0.8} scrollSpeed={0.4} scrollY={scrollY} />
      <FluffyCloud top="18%" left="40%" scale={1.6} opacity={0.7} scrollSpeed={0.55} scrollY={scrollY} />
      <FluffyCloud top="22%" left="75%" scale={1.4} opacity={0.8} scrollSpeed={0.45} scrollY={scrollY} />
      <FluffyCloud top="25%" left="15%" scale={2.0} opacity={0.6} scrollSpeed={0.7} scrollY={scrollY} />
    </Box>
  )
}