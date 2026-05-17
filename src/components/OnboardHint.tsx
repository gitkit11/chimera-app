/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const M = motion as any
const f    = "'Clash Display','Unbounded',sans-serif"
const mono = "'JetBrains Mono',monospace"

// ─── Illustrations ────────────────────────────────────────────────────

function TapIllustration() {
  return (
    <svg width="180" height="100" viewBox="0 0 180 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="t_card" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#1E1340"/><stop offset="100%" stopColor="#0A0720"/>
        </radialGradient>
        <radialGradient id="t_finger" cx="35%" cy="25%" r="65%">
          <stop offset="0%" stopColor="#EDE9FE"/><stop offset="50%" stopColor="#A78BFA"/><stop offset="100%" stopColor="#5B21B6"/>
        </radialGradient>
        <filter id="t_glow"><feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#A78BFA" floodOpacity="0.7"/></filter>
        <filter id="t_cglow"><feDropShadow dx="0" dy="2" stdDeviation="8" floodColor="#7C3AED" floodOpacity="0.5"/></filter>
      </defs>
      {/* Cards stacked */}
      <rect x="68" y="8" width="56" height="78" rx="10" fill="#16103A" stroke="rgba(167,139,250,.15)" strokeWidth="1" transform="rotate(3 96 47)"/>
      <rect x="62" y="8" width="56" height="78" rx="10" fill="#1A1440" stroke="rgba(167,139,250,.2)" strokeWidth="1" transform="rotate(-2 90 47)"/>
      {/* Front card */}
      <g filter="url(#t_cglow)">
        <rect x="56" y="10" width="56" height="78" rx="10" fill="url(#t_card)" stroke="rgba(167,139,250,.5)" strokeWidth="1.5"/>
      </g>
      {/* Card content lines */}
      <rect x="64" y="24" width="28" height="5" rx="2.5" fill="rgba(255,255,255,.1)"/>
      <rect x="64" y="34" width="22" height="4" rx="2" fill="rgba(255,255,255,.07)"/>
      {/* Lock */}
      <rect x="72" y="52" width="16" height="14" rx="4" fill="rgba(139,92,246,.2)" stroke="rgba(139,92,246,.45)" strokeWidth="1"/>
      <path d="M76,52 C76,48.5 88,48.5 88,52" stroke="rgba(167,139,250,.7)" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <circle cx="80" cy="59" r="2" fill="rgba(167,139,250,.75)"/>
      {/* Ripples from tap point */}
      <M.circle cx="134" cy="42" r="6" fill="none" stroke="#A78BFA" strokeWidth="1.5"
        animate={{r:[6,20], opacity:[0.8,0]}} transition={{duration:1.3,repeat:Infinity,ease:'easeOut'}}/>
      <M.circle cx="134" cy="42" r="6" fill="none" stroke="#7C3AED" strokeWidth="1"
        animate={{r:[6,28], opacity:[0.5,0]}} transition={{duration:1.3,repeat:Infinity,ease:'easeOut',delay:0.35}}/>
      {/* Finger */}
      <g filter="url(#t_glow)">
        <path d="M128,50 C126,50 124,48 124,46 L124,28 C124,24 126,21 130,21 C134,21 136,24 136,28 L136,46 C136,48 134,50 132,50 Z"
          fill="url(#t_finger)"/>
        <path d="M124,38 Q130,36.5 136,38" stroke="#7C3AED" strokeWidth="0.9" fill="none" opacity="0.4"/>
        <path d="M124,44 Q130,42.5 136,44" stroke="#7C3AED" strokeWidth="0.9" fill="none" opacity="0.3"/>
        <path d="M127,22 C127,21 128.5,21 130,21" stroke="white" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.35"/>
        <path d="M127,21.5 C127,20 129,19.5 131,19.5 C133,19.5 135,20 135,21.5 L135,27 C135,28.5 133,29 131,29 C129,29 127,28.5 127,27 Z"
          fill="#DDD6FE" opacity="0.75"/>
      </g>
      {/* Arrow */}
      <M.line x1="123" y1="42" x2="113" y2="42" stroke="#A78BFA" strokeWidth="1.5" strokeLinecap="round"
        strokeDasharray="2 2" animate={{opacity:[0.2,0.9,0.2]}} transition={{duration:1.4,repeat:Infinity}}/>
    </svg>
  )
}

function ChooseIllustration() {
  return (
    <svg width="180" height="100" viewBox="0 0 180 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="c_glow"><feDropShadow dx="0" dy="2" stdDeviation="8" floodColor="#A78BFA" floodOpacity="0.55"/></filter>
        <filter id="c_open"><feDropShadow dx="0" dy="3" stdDeviation="6" floodColor="#10B981" floodOpacity="0.7"/></filter>
      </defs>
      {/* 3 locked cards */}
      <rect x="118" y="16" width="46" height="64" rx="9" fill="#16103A" stroke="rgba(255,255,255,.08)" strokeWidth="1"/>
      <rect x="108" y="12" width="46" height="64" rx="9" fill="#1A1440" stroke="rgba(255,255,255,.1)" strokeWidth="1"/>
      {/* Open card — glowing green */}
      <g filter="url(#c_open)">
        <rect x="98" y="10" width="46" height="64" rx="9" fill="#0A1F12" stroke="#10B981" strokeWidth="1.5"/>
      </g>
      {/* Checkmark on open card */}
      <circle cx="121" cy="42" r="10" fill="rgba(16,185,129,.15)" stroke="rgba(16,185,129,.4)" strokeWidth="1.5"/>
      <M.path d="M115,42 L119,47 L127,36" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        initial={{pathLength:0}} animate={{pathLength:1}} transition={{duration:0.8,delay:0.4}}/>
      {/* Back card lock icons */}
      <rect x="118" y="37" width="14" height="12" rx="3" fill="rgba(255,255,255,.05)" stroke="rgba(255,255,255,.12)" strokeWidth="1"/>
      <path d="M120,37 C120,35 132,35 132,37" stroke="rgba(255,255,255,.15)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      {/* Badge "1 FREE" */}
      <g filter="url(#c_glow)">
        <rect x="30" y="38" width="56" height="22" rx="11" fill="#A78BFA"/>
      </g>
      <text x="58" y="49" textAnchor="middle" fontFamily="monospace" fontSize="7.5" fontWeight="800" fill="#04020D" letterSpacing="0.5">1 СИГНАЛ</text>
      <text x="58" y="57" textAnchor="middle" fontFamily="monospace" fontSize="6.5" fontWeight="600" fill="rgba(4,2,13,0.65)" letterSpacing="0.3">БЕСПЛАТНО</text>
      {/* Arrow */}
      <M.path d="M87,49 L97,49" stroke="#A78BFA" strokeWidth="1.5" strokeLinecap="round" markerEnd="url(#arrow)"
        animate={{x:[0,3,0]}} transition={{duration:1.2,repeat:Infinity,ease:'easeInOut'}}/>
      <line x1="86" y1="49" x2="96" y2="49" stroke="#A78BFA" strokeWidth="1.5" strokeLinecap="round"/>
      <polygon points="96,46 101,49 96,52" fill="#A78BFA"/>
    </svg>
  )
}

function ExpandIllustration() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="ex_glow"><feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#A78BFA" floodOpacity="0.8"/></filter>
      </defs>
      <g filter="url(#ex_glow)">
        {/* Expand arrows */}
        <path d="M8,20 L8,8 L20,8" stroke="#A78BFA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M28,8 L40,8 L40,20" stroke="#A78BFA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M40,28 L40,40 L28,40" stroke="#A78BFA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M20,40 L8,40 L8,28" stroke="#A78BFA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        {/* Center card hint */}
        <rect x="14" y="14" width="20" height="20" rx="4" fill="rgba(139,92,246,.2)" stroke="rgba(167,139,250,.4)" strokeWidth="1"/>
      </g>
    </svg>
  )
}

// ─── Main OnboardHint (bottom sheet style) ────────────────────────────
interface Props {
  id: string
  illustration: 'tap' | 'choose'
  title: string
  sub: string
  action: string
  onDone?: () => void
}

export default function OnboardHint({ id, illustration, title, sub, action, onDone }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const isDev = import.meta.env.DEV
    if (!isDev && localStorage.getItem(`ob_${id}`)) return
    const t = setTimeout(() => setVisible(true), 600)
    return () => clearTimeout(t)
  }, [id])

  const done = () => {
    localStorage.setItem(`ob_${id}`, '1')
    setVisible(false)
    onDone?.()
  }

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <M.div key="ob-bg"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: .25 }}
            onClick={done}
            style={{ position: 'absolute', inset: 0, zIndex: 490, background: 'rgba(4,2,13,.7)', backdropFilter: 'blur(3px)' }}
          />
          {/* Bottom sheet */}
          <M.div key="ob-sheet"
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0,      opacity: 1 }}
            exit={{    y: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 28 }}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
            style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 500,
              background: 'linear-gradient(180deg,#0D0A24 0%,#07050F 100%)',
              borderRadius: '24px 24px 0 0',
              borderTop: '1px solid rgba(167,139,250,.25)',
              boxShadow: '0 -20px 60px rgba(0,0,0,.6), 0 0 0 1px rgba(167,139,250,.1)',
            }}
          >
            {/* Handle bar */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '14px 0 0' }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,.15)' }} />
            </div>

            <div style={{ padding: '20px 28px 36px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {/* Illustration */}
              <M.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                style={{ marginBottom: 20 }}
              >
                {illustration === 'tap' ? <TapIllustration /> : <ChooseIllustration />}
              </M.div>

              {/* Text */}
              <div style={{
                fontFamily: f, fontWeight: 800, fontSize: 20, lineHeight: 1.15,
                textAlign: 'center', color: '#FAFAF8', marginBottom: 10,
                whiteSpace: 'pre-line',
              }}>{title}</div>
              <div style={{
                fontFamily: mono, fontSize: 11, lineHeight: 1.7,
                textAlign: 'center', color: 'rgba(255,255,255,.42)', marginBottom: 28,
                maxWidth: 240,
              }}>{sub}</div>

              {/* Button */}
              <M.button
                whileTap={{ scale: .97 }}
                onClick={done}
                style={{
                  width: '100%', padding: '16px', borderRadius: 16,
                  border: 'none', cursor: 'pointer',
                  background: 'linear-gradient(135deg,#3B0764,#6D28D9,#A78BFA)',
                  boxShadow: '0 0 0 1px rgba(139,92,246,.4),0 8px 24px -6px rgba(109,40,217,.6)',
                  fontFamily: f, fontWeight: 700, fontSize: 16,
                  letterSpacing: '.02em', color: '#F5F3FF',
                  position: 'relative', overflow: 'hidden',
                }}
              >
                <span aria-hidden style={{
                  position: 'absolute', inset: 0, pointerEvents: 'none',
                  background: 'linear-gradient(105deg,transparent 30%,rgba(255,255,255,.15) 50%,transparent 70%)',
                  animation: 'ob_shim 2.8s ease-in-out infinite',
                }}/>
                {action}
              </M.button>
            </div>

            <style>{`@keyframes ob_shim{0%,45%{transform:translateX(-100%)}65%,100%{transform:translateX(200%)}}`}</style>
          </M.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ─── Small expand hint (appears after card is chosen) ─────────────────
export function ExpandHint({ visible, onDismiss }: { visible: boolean, onDismiss: () => void }) {
  useEffect(() => {
    if (!visible) return
    const t = setTimeout(onDismiss, 4000)
    return () => clearTimeout(t)
  }, [visible, onDismiss])

  return (
    <AnimatePresence>
      {visible && (
        <M.div
          key="expand-hint"
          initial={{ opacity: 0, y: 16, scale: .92 }}
          animate={{ opacity: 1, y: 0,  scale: 1   }}
          exit={{    opacity: 0, y: 8,  scale: .95  }}
          transition={{ type: 'spring', stiffness: 280, damping: 22 }}
          onClick={onDismiss}
          style={{
            position: 'absolute', top: 110, left: 16, right: 16,
            zIndex: 400, cursor: 'pointer',
          }}
        >
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 16px 10px 10px',
            borderRadius: 18,
            background: 'rgba(12,8,28,.96)',
            border: '1px solid rgba(167,139,250,.35)',
            boxShadow: '0 8px 32px rgba(0,0,0,.6), 0 0 0 1px rgba(139,92,246,.15)',
            backdropFilter: 'blur(12px)',
          }}>
            <M.div animate={{ scale: [1, 1.12, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
              <ExpandIllustration />
            </M.div>
            <div>
              <div style={{ fontFamily: f, fontWeight: 700, fontSize: 14, color: '#FAFAF8', marginBottom: 3 }}>
                ↺ Нажми Разбор AI
              </div>
              <div style={{ fontFamily: mono, fontSize: 10, color: 'rgba(255,255,255,.42)', letterSpacing: '.08em' }}>
                Полный разбор матча
              </div>
            </div>
          </div>
          {/* Pointer arrow DOWN (hint is at top, points to content below) */}
          <div style={{
            position: 'absolute', bottom: -6, left: '50%', transform: 'translateX(-50%)',
            width: 12, height: 7,
          }}>
            <div style={{
              width: 10, height: 10, background: 'rgba(12,8,28,.96)',
              border: '1px solid rgba(167,139,250,.3)',
              transform: 'rotate(45deg) translate(-1px,-5px)',
            }}/>
          </div>
        </M.div>
      )}
    </AnimatePresence>
  )
}
