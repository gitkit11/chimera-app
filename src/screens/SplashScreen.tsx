/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useFunnel } from '../store/funnel'
import logoIcon from '../assets/icon_dark2.png'

const M = motion as any
const f    = "'Clash Display','Unbounded',sans-serif"
const mono = "'JetBrains Mono',monospace"

const TRI    = 'M 5,6 L 95,6 L 50,97 Z'
const TRI_IN = 'M 18,20 L 82,20 L 50,83 Z'

const TITLE = 'Chimera AI'
const GRAD_TITLE = 'linear-gradient(135deg,#FFFFFF 0%,#EDE9FE 22%,#A78BFA 52%,#7C3AED 100%)'

const letterV = {
  hidden:  { opacity: 0, y: 16, scale: 0.85 },
  visible: (i: number) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { delay: i * 0.05, duration: 0.45, type: 'spring', stiffness: 160, damping: 18 },
  }),
}

export default function SplashScreen() {
  const go = useFunnel(s => s.go)
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    const t = [
      setTimeout(() => setPhase(1), 80),
      setTimeout(() => setPhase(2), 900),
      setTimeout(() => setPhase(3), 1300),
      setTimeout(() => setPhase(4), 2800),
    ]
    const nav = setTimeout(() => go('cover'), 3200)
    return () => [...t, nav].forEach(clearTimeout)
  }, [go])

  const p = phase

  return (
    <M.div
      animate={{ opacity: p === 4 ? 0 : 1, scale: p === 4 ? 1.04 : 1 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 1, 1] }}
      style={{ height: '100%', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: '#04020D', overflow: 'hidden', position: 'relative', userSelect: 'none' }}
    >

      {/* Ambient glow — CSS animation, GPU-only */}
      <div style={{ position: 'absolute', top: '42%', left: '50%', transform: 'translate(-50%,-50%)',
        width: 380, height: 380, borderRadius: '50%', pointerEvents: 'none',
        background: 'radial-gradient(circle,rgba(109,40,217,.3) 0%,rgba(76,29,149,.08) 45%,transparent 68%)',
        opacity: p >= 1 ? 1 : 0, transition: 'opacity .6s ease',
        animation: p >= 2 ? 'sp-glow 3s ease-in-out infinite' : 'none' }} />

      {/* Single orbit ring — CSS only */}
      <div style={{ position: 'absolute', top: '42%', left: '50%',
        width: 310, height: 310, marginTop: -155, marginLeft: -155,
        borderRadius: '50%', pointerEvents: 'none',
        border: '1px dashed rgba(139,92,246,.3)',
        opacity: p >= 1 ? 0.5 : 0, transition: 'opacity .5s ease',
        animation: 'sp-spin 22s linear infinite' }} />

      {/* Flash bloom — one-shot on phase 2 */}
      {p === 2 && (
        <M.div
          initial={{ opacity: 0.7, scale: 0.3 }}
          animate={{ opacity: 0, scale: 3.5 }}
          transition={{ duration: 0.65, ease: [0, 0, 0.2, 1] }}
          style={{ position: 'absolute', top: '42%', left: '50%',
            width: 240, height: 240, marginTop: -120, marginLeft: -120,
            borderRadius: '50%', pointerEvents: 'none',
            background: 'radial-gradient(circle,rgba(255,255,255,.45) 0%,rgba(196,181,253,.25) 35%,transparent 65%)' }}
        />
      )}

      {/* ── SVG Triangle ── */}
      <div style={{ position: 'relative', flexShrink: 0, marginBottom: 26, marginTop: -24, width: 240, height: 240 }}>

        <M.svg viewBox="0 0 100 100" width={240} height={240} overflow="visible" style={{ display: 'block' }}
          animate={{ filter: p >= 2
            ? ['drop-shadow(0 0 20px rgba(139,92,246,.8))','drop-shadow(0 0 34px rgba(167,139,250,.95))','drop-shadow(0 0 20px rgba(139,92,246,.8))']
            : 'drop-shadow(0 0 10px rgba(139,92,246,.5))' }}
          transition={{ duration: 3, repeat: p >= 2 ? Infinity : 0, ease: 'easeInOut' }}
        >
          <defs>
            <linearGradient id="gStroke" x1="5%" y1="6%" x2="95%" y2="97%" gradientUnits="userSpaceOnUse">
              <stop offset="0%"   stopColor="#FFFFFF"/>
              <stop offset="18%"  stopColor="#EDE9FE"/>
              <stop offset="52%"  stopColor="#A78BFA"/>
              <stop offset="100%" stopColor="#4C1D95" stopOpacity=".9"/>
            </linearGradient>
            <radialGradient id="gFill" cx="50%" cy="38%" r="65%">
              <stop offset="0%"   stopColor="rgba(55,20,100,.96)"/>
              <stop offset="100%" stopColor="rgba(10,5,26,.98)"/>
            </radialGradient>
          </defs>

          {/* Glow backing */}
          <path d={TRI} fill="none" stroke="rgba(109,40,217,.2)" strokeWidth="7"
            style={{ filter: 'blur(5px)' }}/>

          {/* Main triangle draw */}
          <M.path d={TRI}
            fill={p >= 2 ? 'url(#gFill)' : 'none'}
            stroke="url(#gStroke)" strokeWidth="1.65"
            strokeLinecap="round" strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: p >= 1 ? 1 : 0, opacity: p >= 1 ? 1 : 0 }}
            transition={{ pathLength: { duration: 0.9, ease: [0.4, 0, 0.2, 1] }, opacity: { duration: 0.1 } }}
          />

          {/* Inner dashed triangle */}
          <M.path d={TRI_IN} fill="none"
            stroke="rgba(167,139,250,.25)" strokeWidth="0.6" strokeDasharray="2 3"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: p >= 2 ? 1 : 0, opacity: p >= 2 ? 1 : 0 }}
            transition={{ duration: 0.65, delay: 0.1 }}
          />

          {/* Facet lines */}
          <M.g initial={{ opacity: 0 }} animate={{ opacity: p >= 3 ? 0.12 : 0 }} transition={{ duration: 0.5 }}
            stroke="rgba(196,181,253,.5)" strokeWidth="0.3">
            <line x1="50" y1="6"  x2="50" y2="97"/>
            <line x1="5"  y1="6"  x2="72" y2="51"/>
            <line x1="95" y1="6"  x2="28" y2="51"/>
          </M.g>
        </M.svg>

        {/* Logo inside */}
        <M.div
          initial={{ opacity: 0, scale: 0.3 }}
          animate={{ opacity: p >= 3 ? 1 : 0, scale: p >= 3 ? 1 : 0.3 }}
          transition={{ duration: 0.55, type: 'spring', stiffness: 100, damping: 12 }}
          style={{ position: 'absolute', top: 240 * 0.51 - 52, left: 240 * 0.50 - 52, width: 104, height: 104 }}>
          <img src={logoIcon} alt=""
            style={{ width: '100%', height: '100%', objectFit: 'contain',
              filter: 'drop-shadow(0 0 10px rgba(167,139,250,.8))' }} />
        </M.div>

        {/* Scan line */}
        {p === 2 && (
          <M.div
            initial={{ top: '6%', opacity: 0 }}
            animate={{ top: '90%', opacity: [0, 0.7, 0.7, 0] }}
            transition={{ duration: 0.5, ease: 'easeInOut', times: [0, .1, .85, 1] }}
            style={{ position: 'absolute', left: '5%', right: '5%', height: 2, pointerEvents: 'none',
              background: 'linear-gradient(90deg,transparent,rgba(167,139,250,.65) 20%,rgba(255,255,255,.9) 50%,rgba(167,139,250,.65) 80%,transparent)',
              filter: 'blur(1px)', borderRadius: 2 }}
          />
        )}
      </div>

      {/* Title */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 8,
        fontFamily: f, fontWeight: 900, fontSize: 28, letterSpacing: '.04em',
        filter: 'drop-shadow(0 0 18px rgba(139,92,246,.4))' }}>
        {TITLE.split('').map((ch, i) => (
          <M.span key={i} custom={i}
            initial="hidden" animate={p >= 3 ? 'visible' : 'hidden'} variants={letterV}
            style={{ display: 'inline-block', minWidth: ch === ' ' ? '0.28em' : undefined,
              background: GRAD_TITLE, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {ch === ' ' ? ' ' : ch}
          </M.span>
        ))}
      </div>

      {/* Tagline */}
      <M.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: p >= 3 ? 1 : 0, y: p >= 3 ? 0 : 8 }}
        transition={{ duration: 0.45, delay: 0.35 }}
        style={{ fontFamily: mono, fontSize: 8, letterSpacing: '.28em',
          color: 'rgba(167,139,250,.4)', textTransform: 'uppercase', textAlign: 'center', marginBottom: 22 }}>
        Quattro · Intelligentia · Una
      </M.div>

      {/* Progress bar */}
      <M.div initial={{ opacity: 0 }} animate={{ opacity: p >= 3 ? 1 : 0 }} transition={{ duration: 0.3, delay: 0.2 }}
        style={{ width: 140, height: 2, borderRadius: 2, background: 'rgba(139,92,246,.14)', overflow: 'hidden' }}>
        <M.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: p >= 3 ? 1 : 0 }}
          transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1], delay: 0.28 }}
          style={{ height: '100%', transformOrigin: 'left',
            background: 'linear-gradient(90deg,#5B21B6,#A78BFA,#EDE9FE)', borderRadius: 2 }}
        />
      </M.div>

      <style>{`
        @keyframes sp-glow { 0%,100%{opacity:.7} 50%{opacity:1} }
        @keyframes sp-spin  { to{transform:translate(-50%,-50%) rotate(360deg)} }
      `}</style>
    </M.div>
  )
}
