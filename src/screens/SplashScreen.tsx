/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useFunnel } from '../store/funnel'
import logoIcon from '../assets/icon_dark2.png'

const M = motion as any
const f    = "'Clash Display','Unbounded',sans-serif"
const mono = "'JetBrains Mono',monospace"

// Triangle: FLAT TOP, vertex pointing DOWN — Chimera style
// ViewBox 0 0 100 100
const TRI    = 'M 5,6 L 95,6 L 50,97 Z'
const TRI_IN = 'M 18,20 L 82,20 L 50,83 Z'

// Deterministic dust particles
const DUST = Array.from({ length: 24 }, (_, i) => ({
  x:   ((i * 47 + 13) % 95) + 2.5,
  y:   ((i * 31 + 57) % 90) + 5,
  s:    0.9 + (i % 4) * 0.45,
  dur:  2.4 + (i % 6) * 0.6,
  del:  (i * 0.19) % 3.5,
  col: ['rgba(167,139,250,.7)','rgba(139,92,246,.5)','rgba(196,181,253,.6)','rgba(245,243,255,.4)'][i % 4],
}))

const TITLE = 'Chimera AI'
const letterV = {
  hidden:  { opacity: 0, y: 20, scale: 0.8 },
  visible: (i: number) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { delay: i * 0.055, duration: 0.5, type: 'spring', stiffness: 155, damping: 17 },
  }),
}

const GRAD_TITLE = 'linear-gradient(135deg,#FFFFFF 0%,#EDE9FE 22%,#A78BFA 52%,#7C3AED 100%)'

// Vertex positions for sparkle dots (in SVG viewbox units)
const VERTS = [
  { cx:5,  cy:6,  delay:0.04 },
  { cx:95, cy:6,  delay:0.52 },
  { cx:50, cy:97, delay:0.86 },
]

export default function SplashScreen() {
  const go = useFunnel(s => s.go)
  const [phase, setPhase] = useState(0)
  const [flash, setFlash]  = useState(false)

  useEffect(() => {
    const t = [
      setTimeout(() => setPhase(1), 80),
      setTimeout(() => { setPhase(2); setFlash(true); setTimeout(() => setFlash(false), 750) }, 1060),
      setTimeout(() => setPhase(3), 1480),
      setTimeout(() => setPhase(4), 3200),
    ]
    const nav = setTimeout(() => go('cover'), 3680)
    return () => [...t, nav].forEach(clearTimeout)
  }, [go])

  const p = phase

  return (
    <M.div
      animate={{ opacity: p === 4 ? 0 : 1, scale: p === 4 ? 1.06 : 1 }}
      transition={{ duration: 0.46, ease: [0.4, 0, 1, 1] }}
      style={{ height:'100%', display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center',
        background:'#04020D', overflow:'hidden', position:'relative', userSelect:'none' }}
    >

      {/* ── Noise grain ─────────────────────────────────────────── */}
      <div style={{ position:'absolute', inset:0, opacity:.025, pointerEvents:'none',
        mixBlendMode:'overlay' as const,
        backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`
      }}/>

      {/* ── Floating dust ────────────────────────────────────────── */}
      {DUST.map((d, i) => (
        <M.div key={i}
          animate={{ opacity: p >= 1 ? [0, d.s*0.6, 0] : 0, y: [0, -22, 0] }}
          transition={{
            opacity:{ duration:d.dur, repeat:Infinity, delay:d.del, ease:'easeInOut' },
            y:      { duration:d.dur*1.25, repeat:Infinity, delay:d.del, ease:'easeInOut' },
          }}
          style={{ position:'absolute', left:`${d.x}%`, top:`${d.y}%`,
            width:d.s+0.8, height:d.s+0.8, borderRadius:'50%', pointerEvents:'none',
            background:d.col, boxShadow:`0 0 5px ${d.col}` }}
        />
      ))}

      {/* ── Main deep glow (breathes after complete) ─────────────── */}
      <M.div
        animate={{
          opacity: p === 0 ? 0 : p >= 2 ? [0.38, 0.72, 0.38] : 0.22,
          scale:   p >= 2 ? [1, 1.15, 1] : 1,
        }}
        transition={{ duration:3.4, repeat: p >= 2 ? Infinity : 0, ease:'easeInOut' }}
        style={{ position:'absolute', top:'42%', left:'50%', transform:'translate(-50%,-50%)',
          width:420, height:420, borderRadius:'50%', pointerEvents:'none',
          background:'radial-gradient(circle,rgba(109,40,217,.36) 0%,rgba(76,29,149,.12) 42%,transparent 66%)' }}
      />

      {/* ── Secondary inner glow ring ────────────────────────────── */}
      <M.div
        animate={{ opacity: p >= 2 ? [0.25, 0.55, 0.25] : 0, scale: p >= 2 ? [0.8, 1, 0.8] : 0.8 }}
        transition={{ duration:2.2, repeat: p >= 2 ? Infinity : 0, ease:'easeInOut', delay:0.4 }}
        style={{ position:'absolute', top:'42%', left:'50%', transform:'translate(-50%,-50%)',
          width:220, height:220, borderRadius:'50%', pointerEvents:'none',
          background:'radial-gradient(circle,rgba(167,139,250,.22) 0%,transparent 60%)' }}
      />

      {/* ── Flash bloom ──────────────────────────────────────────── */}
      {flash && (
        <M.div
          initial={{ opacity:0.85, scale:0.35 }}
          animate={{ opacity:0, scale:4 }}
          transition={{ duration:0.7, ease:[0,0,0.15,1] }}
          style={{ position:'absolute', top:'42%', left:'50%',
            width:260, height:260, marginTop:-130, marginLeft:-130,
            borderRadius:'50%', pointerEvents:'none',
            background:'radial-gradient(circle,rgba(255,255,255,.55) 0%,rgba(196,181,253,.3) 32%,transparent 62%)' }}
        />
      )}

      {/* ── Shockwave ring ───────────────────────────────────────── */}
      {p >= 2 && (
        <M.div
          initial={{ opacity:0.65, scale:0.4 }}
          animate={{ opacity:0, scale:1 }}
          transition={{ duration:0.95, ease:[0,0,0.35,1] }}
          style={{ position:'absolute', top:'42%', left:'50%',
            width:420, height:420, marginTop:-210, marginLeft:-210,
            borderRadius:'50%', pointerEvents:'none',
            border:'1.5px solid rgba(196,181,253,.65)' }}
        />
      )}

      {/* ── Second shockwave (slight delay) ─────────────────────── */}
      {p >= 2 && (
        <M.div
          initial={{ opacity:0.4, scale:0.5 }}
          animate={{ opacity:0, scale:1 }}
          transition={{ duration:0.85, ease:[0,0,0.4,1], delay:0.15 }}
          style={{ position:'absolute', top:'42%', left:'50%',
            width:340, height:340, marginTop:-170, marginLeft:-170,
            borderRadius:'50%', pointerEvents:'none',
            border:'1px solid rgba(139,92,246,.5)' }}
        />
      )}

      {/* ── Outer dashed orbit ring ───────────────────────────────── */}
      <M.div
        animate={{ opacity: p >= 1 ? 0.45 : 0, rotate: p >= 1 ? 360 : 0 }}
        transition={{ opacity:{duration:0.6}, rotate:{duration:24, repeat:Infinity, ease:'linear'} }}
        style={{ position:'absolute', top:'42%', left:'50%',
          width:330, height:330, marginTop:-165, marginLeft:-165,
          borderRadius:'50%', pointerEvents:'none',
          border:'1px dashed rgba(139,92,246,.36)' }}
      />

      {/* ── Inner counter-orbit ring ─────────────────────────────── */}
      <M.div
        animate={{ opacity: p >= 1 ? 0.22 : 0, rotate: p >= 1 ? -360 : 0 }}
        transition={{ opacity:{duration:0.6, delay:0.2}, rotate:{duration:16, repeat:Infinity, ease:'linear'} }}
        style={{ position:'absolute', top:'42%', left:'50%',
          width:262, height:262, marginTop:-131, marginLeft:-131,
          borderRadius:'50%', pointerEvents:'none',
          border:'1px dashed rgba(196,181,253,.18)' }}
      />

      {/* ── Tiny orbit dots on the ring ───────────────────────────── */}
      {[0, 120, 240].map((deg, i) => (
        <M.div key={i}
          animate={{ opacity: p >= 2 ? [0.4,1,0.4] : 0, rotate: p >= 2 ? 360 : 0 }}
          transition={{
            opacity:{ duration:2+i*0.5, repeat:Infinity, ease:'easeInOut', delay:i*0.6 },
            rotate:{ duration:24, repeat:Infinity, ease:'linear' },
          }}
          style={{ position:'absolute', top:'42%', left:'50%',
            width:330, height:330, marginTop:-165, marginLeft:-165,
            borderRadius:'50%', pointerEvents:'none',
            transformOrigin:'center center',
          }}
        >
          <div style={{ position:'absolute',
            top: `${50 - 50*Math.cos(deg*Math.PI/180)}%`,
            left:`${50 + 50*Math.sin(deg*Math.PI/180)}%`,
            width:5, height:5, borderRadius:'50%', marginTop:-2.5, marginLeft:-2.5,
            background:'rgba(167,139,250,.9)',
            boxShadow:'0 0 8px rgba(139,92,246,.8), 0 0 16px rgba(109,40,217,.4)',
          }}/>
        </M.div>
      ))}

      {/* ══ Main composition ═══════════════════════════════════════ */}
      <div style={{ position:'relative', flexShrink:0, marginBottom:26, marginTop:-24, width:252, height:252 }}>

        {/* ── SVG Triangle ──────────────────────────────────────── */}
        <M.svg
          viewBox="0 0 100 100" width={252} height={252}
          overflow="visible"
          style={{ display:'block' }}
          animate={{ filter: p >= 2
            ? ['drop-shadow(0 0 22px rgba(139,92,246,.82)) drop-shadow(0 0 55px rgba(109,40,217,.44))',
               'drop-shadow(0 0 36px rgba(167,139,250,.98)) drop-shadow(0 0 88px rgba(139,92,246,.58))',
               'drop-shadow(0 0 22px rgba(139,92,246,.82)) drop-shadow(0 0 55px rgba(109,40,217,.44))']
            : 'drop-shadow(0 0 12px rgba(139,92,246,.52))' }}
          transition={{ duration:3.2, repeat: p >= 2 ? Infinity : 0, ease:'easeInOut' }}
        >
          <defs>
            <linearGradient id="gStroke" x1="5%" y1="6%" x2="95%" y2="97%" gradientUnits="userSpaceOnUse">
              <stop offset="0%"   stopColor="#FFFFFF"  stopOpacity="1"/>
              <stop offset="15%"  stopColor="#EDE9FE"  stopOpacity="1"/>
              <stop offset="52%"  stopColor="#A78BFA"  stopOpacity="1"/>
              <stop offset="100%" stopColor="#4C1D95"  stopOpacity="0.9"/>
            </linearGradient>
            <linearGradient id="gInner" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor="rgba(196,181,253,.32)"/>
              <stop offset="100%" stopColor="rgba(109,40,217,.1)"/>
            </linearGradient>
            <radialGradient id="gFill" cx="50%" cy="38%" r="65%">
              <stop offset="0%"   stopColor="rgba(55,20,100,.96)"/>
              <stop offset="100%" stopColor="rgba(10,5,26,.98)"/>
            </radialGradient>
          </defs>

          {/* Outer glow backing */}
          <path d={TRI} fill="none" stroke="rgba(109,40,217,.22)" strokeWidth="8"
            style={{ filter:'blur(6px)' }}/>

          {/* Main triangle — self-drawing */}
          <M.path
            d={TRI}
            fill={p >= 2 ? 'url(#gFill)' : 'none'}
            stroke="url(#gStroke)"
            strokeWidth="1.65"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength:0, opacity:0 }}
            animate={{ pathLength: p >= 1 ? 1 : 0, opacity: p >= 1 ? 1 : 0 }}
            transition={{ pathLength:{ duration:0.96, ease:[0.4,0,0.2,1] }, opacity:{ duration:0.12 } }}
            style={{ transition: p >= 2 ? 'fill .3s ease' : 'none' }}
          />

          {/* Inner decorative triangle */}
          <M.path
            d={TRI_IN}
            fill="none"
            stroke="url(#gInner)"
            strokeWidth="0.6"
            strokeDasharray="2.2 3.2"
            initial={{ pathLength:0, opacity:0 }}
            animate={{ pathLength: p >= 2 ? 1 : 0, opacity: p >= 2 ? 1 : 0 }}
            transition={{ pathLength:{ duration:0.7, ease:'easeOut', delay:0.1 }, opacity:{ duration:0.1, delay:0.1 } }}
          />

          {/* Energy arc curves between vertices */}
          {[
            { d:'M 5,6 Q 50,44 95,6',   col:'rgba(253,230,138,.52)' },
            { d:'M 95,6 Q 73,52 50,97',  col:'rgba(110,231,183,.52)' },
            { d:'M 50,97 Q 27,52 5,6',   col:'rgba(196,181,253,.52)' },
          ].map((arc, i) => (
            <M.path key={i}
              d={arc.d} fill="none"
              stroke={arc.col} strokeWidth="0.55"
              initial={{ pathLength:0, opacity:0 }}
              animate={{ pathLength: p >= 2 ? [0,1,1]:0, opacity: p >= 2 ? [0,0.85,0]:0 }}
              transition={{ duration:0.9, times:[0,.45,1], delay: i*0.07 }}
            />
          ))}

          {/* Radial facet lines (subtle, from centroid) */}
          <M.g
            initial={{ opacity:0 }} animate={{ opacity: p >= 3 ? 0.15 : 0 }}
            transition={{ duration:0.6 }}
            stroke="rgba(196,181,253,.55)" strokeWidth="0.3"
          >
            <line x1="50" y1="6"  x2="50" y2="97"/>
            <line x1="5"  y1="6"  x2="72" y2="51"/>
            <line x1="95" y1="6"  x2="28" y2="51"/>
          </M.g>

          {/* Vertex sparkle dots */}
          {VERTS.map((v, i) => (
            <M.circle key={i} cx={v.cx} cy={v.cy} r="1.7"
              fill="white"
              initial={{ opacity:0, scale:0 }}
              animate={{ opacity: p>=1 ? [0,1,0.75]:0, scale: p>=1 ? [0,2.4,1]:0 }}
              transition={{ delay:v.delay, duration:0.3, times:[0,.28,1] }}
              style={{ filter:'drop-shadow(0 0 2px rgba(255,255,255,.9))' }}
            />
          ))}
        </M.svg>

        {/* ── Logo inside triangle ──────────────────────────────── */}
        {/* Triangle ∇ visual center ≈ y=51% of SVG (NOT CSS transform — conflicts with FM scale) */}
        <M.div
          initial={{ opacity:0, scale:0.2 }}
          animate={{ opacity: p >= 3 ? 1 : 0, scale: p >= 3 ? 1 : 0.2 }}
          transition={{ duration:0.6, type:'spring', stiffness:90, damping:11, delay:0.06 }}
          style={{ position:'absolute',
            top: 252 * 0.51 - 55,   /* 51% of 252 minus half icon height (110/2=55) */
            left: 252 * 0.50 - 55,  /* exactly centered horizontally */
            width:110, height:110 }}
        >
          {/* Halo behind logo */}
          <M.div
            animate={{ opacity: p >= 3 ? [0.4,0.8,0.4] : 0, scale: p >= 3 ? [0.9,1.1,0.9] : 0.9 }}
            transition={{ duration:2.6, repeat:Infinity, ease:'easeInOut' }}
            style={{ position:'absolute', inset:-18, borderRadius:'50%',
              background:'radial-gradient(circle,rgba(139,92,246,.4) 0%,transparent 65%)',
              pointerEvents:'none' }}
          />
          <M.img
            src={logoIcon} alt=""
            animate={{ filter: p >= 3
              ? [
                  'drop-shadow(0 0 12px rgba(167,139,250,.85))',
                  'drop-shadow(0 0 24px rgba(167,139,250,1)) drop-shadow(-1.5px 0 rgba(239,68,68,.22)) drop-shadow(1.5px 0 rgba(59,130,246,.22))',
                  'drop-shadow(0 0 12px rgba(167,139,250,.85))',
                ]
              : 'none' }}
            transition={{ duration:2.8, repeat:Infinity, ease:'easeInOut' }}
            style={{ width:'100%', height:'100%', objectFit:'contain', position:'relative' }}
          />
        </M.div>

        {/* ── Scan-line sweep ───────────────────────────────────── */}
        {p === 2 && (
          <M.div
            initial={{ top:'6%', opacity:0 }}
            animate={{ top:'90%', opacity:[0,0.75,0.75,0] }}
            transition={{ duration:0.58, ease:'easeInOut', times:[0,.08,.85,1] }}
            style={{ position:'absolute', left:'5%', right:'5%', height:2.5, pointerEvents:'none',
              background:'linear-gradient(90deg,transparent,rgba(167,139,250,.7) 18%,rgba(255,255,255,.95) 50%,rgba(167,139,250,.7) 82%,transparent)',
              filter:'blur(1.2px)', borderRadius:2 }}
          />
        )}

      </div>

      {/* ── Title: per-letter spring (gradient on each span) ───────── */}
      <div style={{ display:'flex', gap:0, marginBottom:10,
        fontFamily:f, fontWeight:900, fontSize:30, letterSpacing:'.04em',
        filter:'drop-shadow(0 0 20px rgba(139,92,246,.45))' }}>
        {TITLE.split('').map((ch, i) => (
          <M.span key={i} custom={i}
            initial="hidden"
            animate={p >= 3 ? 'visible' : 'hidden'}
            variants={letterV}
            style={{
              display:'inline-block',
              minWidth: ch === ' ' ? '0.28em' : undefined,
              background: GRAD_TITLE,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {ch === ' ' ? ' ' : ch}
          </M.span>
        ))}
      </div>

      {/* ── Tagline ───────────────────────────────────────────────── */}
      <M.div
        initial={{ opacity:0, y:10 }}
        animate={{ opacity: p >= 3 ? 1 : 0, y: p >= 3 ? 0 : 10 }}
        transition={{ duration:0.55, delay:0.4 }}
        style={{ fontFamily:mono, fontSize:8.5, letterSpacing:'.3em',
          color:'rgba(167,139,250,.44)', textTransform:'uppercase',
          textAlign:'center', marginBottom:24 }}
      >
        Quattro · Intelligentia · Una
      </M.div>

      {/* ── Progress bar (wrapper + inner fill) ──────────────────── */}
      <M.div
        initial={{ opacity:0 }}
        animate={{ opacity: p >= 3 ? 1 : 0 }}
        transition={{ duration:0.3, delay:0.25 }}
        style={{ width:148, height:2, borderRadius:2,
          background:'rgba(139,92,246,.15)', overflow:'hidden' }}
      >
        <M.div
          initial={{ scaleX:0 }}
          animate={{ scaleX: p >= 3 ? 1 : 0 }}
          transition={{ duration:1.6, ease:[0.4,0,0.2,1], delay:0.32 }}
          style={{ height:'100%', transformOrigin:'left',
            background:'linear-gradient(90deg,#5B21B6,#A78BFA,#EDE9FE)',
            borderRadius:2 }}
        />
      </M.div>

    </M.div>
  )
}
