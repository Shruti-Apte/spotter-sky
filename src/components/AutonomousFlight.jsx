import { Box, keyframes } from '@mui/material'

const airBob = keyframes`
  0%,100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
`

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`

export default function AutonomousFlight() {
  const planeStyle = (delay = '0s') => ({
    position: 'absolute',
    left: '-15%',
    top: '85%',
    pointerEvents: 'none',
    zIndex: 5,
    animation: `
      ${fadeIn} 2s ease-out ${delay} forwards,
      moveFlight 40s linear ${delay} infinite
    `,
    '@keyframes moveFlight': {
      to: { left: '110%', top: '-20%' },
    },
  })

  const planeContent = (angle = 315) => (
    <Box
      sx={{
        display: {'xs': 'none', 'sm': 'flex'},
        alignItems: 'center',
        transform: `rotate(${angle}deg)`,
        animation: `${airBob} 6s ease-in-out infinite`,
      }}
    >
      <Box
        sx={{
          width: 250,
          height: 6,
          mr: -25,
          filter: 'blur(2.5px)',
          background: 'linear-gradient(to left, rgba(255,255,255,0.6), transparent)',
          transform: 'translateX(-80%)',
        }}
      />
      <Box sx={{ width: 50, height: 50 }}>
        <Box
          component="svg"
          viewBox="0 0 24 24"
          sx={{
            width: '100%',
            height: '100%',
            fill: '#020079',
            transform: 'rotate(90deg)',
            filter: 'drop-shadow(0px 6px 8px rgba(0,0,0,0.25))',
          }}
        >
          <path d="M21,16L21,14L13,9L13,3.5A1.5,1.5 0 0,0 11.5,2A1.5,1.5 0 0,0 10,3.5L10,9L2,14L2,16L10,13.5V19L8,20.5V22L11.5,21L15,22V20.5L13,19V13.5L21,16Z" />
        </Box>
      </Box>
    </Box>
  )

  return (
    <>
      <Box sx={planeStyle('0s')}>{planeContent(315)}</Box>
      <Box sx={planeStyle('15s')}>{planeContent(320)}</Box>
      <Box sx={planeStyle('30s')}>{planeContent(320)}</Box>
    </>
  )
}
