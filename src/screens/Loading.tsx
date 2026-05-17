import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useFunnel } from '../store/funnel'
import logo from '../assets/logo.png'

const LINES = [
  { text: 'Connecting to Chimera core', cls: 'wait' },
  { text: 'Statistician · Scout · Arbiter — online', cls: 'ok' },
  { text: 'Shadow (Llama 70B) — sync ok', cls: 'ok' },
  { text: 'Extracting last edition', cls: 'wait' },
  { text: '5 signals · 1 divergence detected', cls: 'ok' },
]

export default function Loading() {
  const go = useFunnel(s => s.go)

  useEffect(() => {
    const t = setTimeout(() => go('home'), 5200)
    return () => clearTimeout(t)
  }, [go])

  return (
    <div className="h-full flex flex-col items-center justify-center px-8 gap-10"
      style={{ background: '#04020D' }}>

      {/* Animated rings + logo */}
      <div className="relative w-[180px] h-[180px] flex items-center justify-center">
        {/* Outer ring */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ border: '1px solid rgba(167,139,250,.3)' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
        />
        {/* Inner ring dashed */}
        <motion.div
          className="absolute rounded-full"
          style={{ inset: 28, border: '1px dashed rgba(139,92,246,.4)' }}
          animate={{ rotate: -360 }}
          transition={{ duration: 9, repeat: Infinity, ease: 'linear' }}
        />
        {/* Aura pulse */}
        <motion.div
          className="absolute inset-[-20px] rounded-full"
          style={{ background: 'radial-gradient(circle,rgba(139,92,246,.18) 0%,transparent 65%)' }}
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Logo */}
        <div className="relative z-10 w-[64px] h-[64px] rounded-[16px] overflow-hidden p-[7px]"
          style={{ background: '#1C1F3A', border: '1.5px solid rgba(167,139,250,.45)', boxShadow: '0 0 20px rgba(139,92,246,.5)' }}>
          <img src={logo} alt="" className="w-full h-full object-contain" />
        </div>
      </div>

      {/* Log lines */}
      <div className="w-full max-w-[300px]">
        {LINES.map((line, i) => (
          <motion.div
            key={i}
            className="flex gap-3 items-center leading-[2.2] font-mono text-[10.5px] font-medium tracking-[.14em] uppercase"
            style={{ color: 'rgba(250,250,248,.5)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 + i * 0.85, duration: 0.4 }}
          >
            <span style={{ color: line.cls === 'ok' ? '#7EC88E' : '#A78BFA', fontWeight: 700 }}>
              {line.cls === 'ok' ? '[ ok ]' : '[ >> ]'}
            </span>
            <span>{line.text}</span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
