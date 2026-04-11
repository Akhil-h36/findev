// src/pages/LandingPage.jsx
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import animationData from '../assets/animation2.json'

export default function LandingPage() {
  const navigate = useNavigate()
  const [fadeOut, setFadeOut] = useState(false)
  const [LottieComp, setLottieComp] = useState(null)
  const didNavigate = useRef(false)

  const handleComplete = () => {
    if (didNavigate.current) return
    didNavigate.current = true
    setFadeOut(true)
    setTimeout(() => navigate('/login'), 500)
  }

  // Dynamically import lottie-react so we can safely handle export shape
  useEffect(() => {
    import('lottie-react').then((mod) => {
      // lottie-react may ship as mod.default (a React component) or mod.default.default
      const comp = mod?.default?.default ?? mod?.default ?? null
      if (typeof comp === 'function') {
        setLottieComp(() => comp)
      }
    }).catch(() => {
      // lottie-react not installed — fallback spinner handles it
    })

    // Failsafe: navigate after 4.5 s regardless
    const timer = setTimeout(handleComplete, 4500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#faf9ff',
        zIndex: 1000, overflow: 'hidden',
        opacity: fadeOut ? 0 : 1,
        transition: 'opacity 0.5s ease',
      }}
    >
      {/* No blobs here — flat bg needed for mix-blend-mode to work correctly */}

      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', position:'relative', zIndex:10 }}>

        <div style={{ width:320, height:320, display:'flex', alignItems:'center', justifyContent:'center' }}>
          {LottieComp ? (
            <LottieComp
              animationData={animationData}
              loop={false}
              onComplete={handleComplete}
              style={{ width:'100%', height:'100%' }}
            />
          ) : (
            /* Spinner fallback while lottie loads (or if unavailable) */
            <div style={{
              width:96, height:96, borderRadius:'50%',
              border:'3px solid #ede9fe',
              borderTop:'3px solid #7c3aed',
              animation:'dm-spin 1s linear infinite',
            }} />
          )}
        </div>

        {/* <h1 style={{
          fontFamily:"'Fraunces', serif", fontStyle:'italic',
          fontSize:'2.5rem', color:'#7c3aed',
          marginTop: LottieComp ? -20 : 16,
          animation:'dm-pulse 2s ease-in-out infinite',
        }}>
          devMatch
        </h1>

        <p style={{
          fontFamily:"'DM Mono', monospace",
          fontSize:'0.85rem', color:'rgba(30,27,75,0.5)',
          marginTop:10, letterSpacing:1,
        }}>
          Initializing terminal...
        </p> */}
      </div>

      <style>{`
        @keyframes dm-pulse { 0%,100%{opacity:1} 50%{opacity:0.65} }
        @keyframes dm-spin   { to{transform:rotate(360deg)} }
      `}</style>
    </div>
  )
}