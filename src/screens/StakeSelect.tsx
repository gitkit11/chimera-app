/* eslint-disable @typescript-eslint/no-explicit-any */
import { motion } from 'framer-motion'
import { useFunnel } from '../store/funnel'

const M = motion as any
const f    = "'Clash Display','Unbounded',sans-serif"
const mono = "'JetBrains Mono',monospace"

const OPTIONS = [
  {
    value: 30,
    label: '€30',
    tag: 'Старт',
    sub: 'Попробуй как работает',
    accent: '#8B5CF6',
    glow: 'rgba(109,40,217,.28)',
    border: 'rgba(139,92,246,.22)',
    fill: 'rgba(76,29,149,.12)',
    popular: false,
  },
  {
    value: 100,
    label: '€100',
    tag: 'Популярно',
    sub: 'Серьёзный подход',
    accent: '#A78BFA',
    glow: 'rgba(139,92,246,.52)',
    border: 'rgba(167,139,250,.55)',
    fill: 'rgba(109,40,217,.16)',
    popular: true,
  },
  {
    value: 500,
    label: '€500',
    tag: 'Про',
    sub: 'Максимальный результат',
    accent: '#EDE9FE',
    glow: 'rgba(237,233,254,.18)',
    border: 'rgba(237,233,254,.2)',
    fill: 'rgba(196,181,253,.06)',
    popular: false,
  },
]

export default function StakeSelect() {
  const { go, setStake } = useFunnel()

  const pick = (v: number) => {
    setStake(v)
    setTimeout(() => go('card-reveal'), 280)
  }

  return (
    <M.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: .28 }}
      style={{ height:'100%', display:'flex', flexDirection:'column',
        background:'#04020D', overflow:'hidden', position:'relative' }}
    >

      {/* Ambient background glow */}
      <div style={{ position:'absolute', top:'18%', left:'50%', transform:'translateX(-50%)',
        width:420, height:320, borderRadius:'50%', pointerEvents:'none',
        background:'radial-gradient(ellipse,rgba(109,40,217,.13) 0%,transparent 65%)',
        filter:'blur(14px)' }} />

      <div style={{ flex:1, display:'flex', flexDirection:'column',
        padding:'58px 20px 28px', gap:0, overflowY:'auto' }}>

        {/* Heading */}
        <M.h2
          initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }}
          transition={{ delay:.1, duration:.42 }}
          style={{ fontFamily:f, fontWeight:800, fontSize:'clamp(28px,8.5vw,36px)',
            lineHeight:.95, letterSpacing:'-.01em', marginBottom:8 }}>
          С какой суммы
        </M.h2>
        <M.h2
          initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }}
          transition={{ delay:.15, duration:.42 }}
          style={{ fontFamily:f, fontWeight:800, fontSize:'clamp(28px,8.5vw,36px)',
            lineHeight:.95, letterSpacing:'-.01em', marginBottom:14,
            background:'linear-gradient(90deg,#A78BFA,#7C3AED)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
          начнёшь?
        </M.h2>

        <M.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:.2 }}
          style={{ fontSize:12, color:'rgba(255,255,255,.36)', fontFamily:mono,
            letterSpacing:'.04em', marginBottom:28 }}>
          Покажем сколько ты заработал бы вчера
        </M.p>

        {/* Cards */}
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {OPTIONS.map((o, i) => (
            <Card key={o.value} o={o} i={i} onPick={() => pick(o.value)} />
          ))}
        </div>

      </div>
    </M.div>
  )
}

function Card({ o, i, onPick }: { o: typeof OPTIONS[0]; i: number; onPick: () => void }) {
  return (
    <M.div
      initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
      transition={{ delay: .26 + i * .09, type:'spring', stiffness:160, damping:20 }}
      whileTap={{ scale:.975 }}
      onClick={onPick}
      style={{ position:'relative', borderRadius:18, cursor:'pointer', overflow:'hidden' }}
    >
      {/* Animated glow border for popular */}
      {o.popular && (
        <M.div
          animate={{ opacity:[0.6,1,0.6] }}
          transition={{ duration:2.4, repeat:Infinity, ease:'easeInOut' }}
          style={{ position:'absolute', inset:-1, borderRadius:19, pointerEvents:'none', zIndex:0,
            background:`linear-gradient(135deg,${o.border},rgba(109,40,217,.7),${o.border})`,
            padding:1 }}>
          <div style={{ borderRadius:18, height:'100%', background:'#04020D' }} />
        </M.div>
      )}

      {/* Card surface */}
      <div style={{ position:'relative', zIndex:1,
        background: o.popular
          ? 'linear-gradient(135deg,rgba(76,29,149,.32) 0%,rgba(15,8,32,.96) 60%,rgba(55,20,100,.18) 100%)'
          : `linear-gradient(135deg,${o.fill} 0%,rgba(12,8,24,.95) 100%)`,
        border: o.popular ? `1.5px solid ${o.border}` : `1px solid rgba(255,255,255,.07)`,
        borderRadius:18,
        padding:'18px 20px',
        boxShadow: o.popular ? `0 0 36px ${o.glow}, 0 0 80px rgba(109,40,217,.12)` : 'none',
      }}>

        {/* Top row: amount + badge */}
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:10 }}>
          <div style={{ fontFamily:"'Clash Display','Unbounded',sans-serif",
            fontWeight:900, fontSize:38, lineHeight:1,
            background: `linear-gradient(135deg,#FFFFFF 0%,${o.accent} 100%)`,
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
            filter: o.popular ? `drop-shadow(0 0 14px ${o.accent}66)` : 'none',
          }}>{o.label}</div>

          <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:6 }}>
            {o.popular && (
              <M.div
                animate={{ opacity:[0.85,1,0.85] }}
                transition={{ duration:1.8, repeat:Infinity, ease:'easeInOut' }}
                style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:8,
                  fontWeight:700, letterSpacing:'.18em', textTransform:'uppercase',
                  color:'#04020D', background:`linear-gradient(90deg,${o.accent},#7C3AED)`,
                  padding:'3px 9px', borderRadius:20 }}>
                ★ {o.tag}
              </M.div>
            )}
            {!o.popular && (
              <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:8,
                fontWeight:600, letterSpacing:'.14em', textTransform:'uppercase',
                color:o.accent, background:`${o.glow}`,
                border:`1px solid ${o.border}`,
                padding:'3px 9px', borderRadius:20 }}>
                {o.tag}
              </div>
            )}
          </div>
        </div>

        {/* Divider */}
        <div style={{ height:1, background: o.popular
          ? `linear-gradient(90deg,transparent,${o.border},transparent)`
          : 'rgba(255,255,255,.06)', marginBottom:12 }} />

        {/* Bottom row: sub + CTA */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ fontSize:12, color:'rgba(255,255,255,.42)',
            fontFamily:"'JetBrains Mono',monospace", letterSpacing:'.02em' }}>
            {o.sub}
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:6,
            background: o.popular
              ? `linear-gradient(135deg,${o.accent}28,${o.accent}18)`
              : `rgba(255,255,255,.06)`,
            border:`1px solid ${o.popular ? o.border : 'rgba(255,255,255,.12)'}`,
            borderRadius:20, padding:'5px 12px',
            boxShadow: o.popular ? `0 0 10px ${o.glow}` : 'none' }}>
            <div style={{ fontFamily:"'Clash Display','Unbounded',sans-serif", fontSize:10,
              fontWeight:800, color: o.popular ? o.accent : 'rgba(255,255,255,.55)',
              letterSpacing:'.02em' }}>
              Выбрать
            </div>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M4.5 2.5L8 6l-3.5 3.5" stroke={o.popular ? o.accent : 'rgba(255,255,255,.4)'}
                strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

      </div>
    </M.div>
  )
}
