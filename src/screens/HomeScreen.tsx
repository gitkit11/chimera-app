/* eslint-disable @typescript-eslint/no-explicit-any */
import { motion } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'
import { useFunnel } from '../store/funnel'
import { haptic } from '../haptic'
import logoIcon    from '../assets/icon_dark2.png'
const sniperBg      = `${import.meta.env.BASE_URL}bg/sniper_photo.png`
const goldenCupBg   = `${import.meta.env.BASE_URL}bg/ak47_gold.png`
const expressCarBg  = `${import.meta.env.BASE_URL}bg/express_car2.jpg`
const totalsChess = `${import.meta.env.BASE_URL}bg/totals_chess.jpg`
import signalsIcon  from '../assets/menu/signals.svg'
import expressIcon  from '../assets/menu/express.svg'
import totalsIcon   from '../assets/menu/totals.svg'
import weekIcon     from '../assets/menu/week.svg'
import { api } from '../api'

const M = motion as any
const f    = "'Clash Display','Unbounded',sans-serif"
const mono = "'JetBrains Mono',monospace"

const CATS = [
  {
    id: 'home-signals' as const, label: 'Сигналы',        sub: '5 сигналов · Сегодня',
    icon: signalsIcon, count: '5',
    photo: sniperBg,
    line: 'linear-gradient(180deg,#6D28D9,#A78BFA,#C4B5FD)',
    overlay: 'linear-gradient(90deg,rgba(10,3,28,.95) 0%,rgba(10,3,28,.7) 55%,rgba(109,40,217,.15) 100%)',
    glow: 'rgba(139,92,246,.25)', accent: '#A78BFA',
  },
  {
    id: 'home-express' as const, label: 'Экспресс',        sub: '2 экспресса · Мульти',
    icon: expressIcon, count: '2',
    photo: expressCarBg,
    line: 'linear-gradient(180deg,#C2410C,#F97316,#FCD34D)',
    overlay: 'linear-gradient(90deg,rgba(28,10,0,.95) 0%,rgba(28,10,0,.7) 55%,rgba(194,65,12,.18) 100%)',
    glow: 'rgba(249,115,22,.25)', accent: '#F97316',
  },
  {
    id: 'home-totals' as const,  label: 'Тоталы',          sub: '3 ставки на тотал',
    icon: totalsIcon,  count: '3',
    photo: totalsChess,
    line: 'linear-gradient(180deg,#047857,#10B981,#6EE7B7)',
    overlay: 'linear-gradient(90deg,rgba(0,20,10,.95) 0%,rgba(0,20,10,.7) 55%,rgba(4,120,87,.18) 100%)',
    glow: 'rgba(16,185,129,.25)', accent: '#34D399',
  },
  {
    id: 'home-week' as const,    label: 'Карточка недели',  sub: 'Лучший сигнал · Пн—Вс',
    icon: weekIcon,    count: '1',
    photo: goldenCupBg,
    line: 'linear-gradient(180deg,#B45309,#EAB308,#FDE68A)',
    overlay: 'linear-gradient(90deg,rgba(28,18,0,.95) 0%,rgba(28,18,0,.55) 45%,rgba(180,83,9,.1) 100%)',
    glow: 'rgba(234,179,8,.3)', accent: '#EAB308',
  },
]

export default function HomeScreen() {
  const go     = useFunnel(s => s.go)
  const isPro  = useFunnel(s => s.isPro)
  const setPro = useFunnel(s => s.setPro)
  const [toast, setToast] = useState<string | null>(null)
  const holdRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [counts, setCounts] = useState<Record<string,number>>({})

  useEffect(() => {
    Promise.allSettled([
      api.botSignals(),
      api.botExpress(),
      api.botTotals(),
      api.botWeek(),
    ]).then(([s, e, t, w]) => {
      setCounts({
        'home-signals': s.status==='fulfilled' ? s.value.length : 0,
        'home-express': e.status==='fulfilled' ? e.value.length : 0,
        'home-totals':  t.status==='fulfilled' ? t.value.length : 0,
        'home-week':    w.status==='fulfilled' && w.value ? 1 : 0,
      })
    })
  }, [])

  function startHold(e: React.TouchEvent | React.MouseEvent) {
    e.preventDefault()
    // Дев-тумблер PRO по зажатию логотипа — ТОЛЬКО в dev-сборке.
    // В проде это была дыра: любой юзер мог включить себе Pro бесплатно.
    if (!import.meta.env.DEV) return
    if (holdRef.current) clearTimeout(holdRef.current)
    holdRef.current = setTimeout(() => {
      const next = !isPro
      setPro(next)
      haptic('heavy')
      setToast(next ? '💎 PRO включён' : '🔒 PRO выключен')
      setTimeout(() => setToast(null), 2500)
    }, 1000)
  }
  function cancelHold() {
    if (holdRef.current) { clearTimeout(holdRef.current); holdRef.current = null }
  }

  return (
    <M.div
      initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, transition: { duration: .1 } }}
      transition={{ duration: .3 }}
      style={{ height: '100%', display: 'flex', flexDirection: 'column',
        background: '#04020D', overflow: 'hidden' }}
    >
      {/* Chimera atmospheric background */}
      {/* Deep violet nebula glow */}
      <div style={{ position: 'absolute', top: '-10%', left: '-20%', width: '70%', height: '60%',
        borderRadius: '50%', pointerEvents: 'none',
        background: 'radial-gradient(circle,rgba(109,40,217,.12) 0%,transparent 65%)' }} />
      <div style={{ position: 'absolute', bottom: '-5%', right: '-15%', width: '60%', height: '50%',
        borderRadius: '50%', pointerEvents: 'none',
        background: 'radial-gradient(circle,rgba(124,58,237,.08) 0%,transparent 65%)' }} />
      {/* Central chimera sigil — large faded triangle */}
      <div style={{ position: 'absolute', top: '18%', left: '50%', transform: 'translateX(-50%)',
        opacity: .04, pointerEvents: 'none', zIndex: 0 }}>
        <svg viewBox="0 0 62 62" width="260" height="260">
          <polygon points="2,6 60,6 31,58" fill="none" stroke="#A78BFA" strokeWidth="1.5"/>
          <polygon points="8,12 54,12 31,50" fill="none" stroke="#7C3AED" strokeWidth="0.8"/>
        </svg>
      </div>
      {/* Noise texture */}
      <div style={{ position: 'absolute', inset: 0, opacity: .025, pointerEvents: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        mixBlendMode: 'overlay' }} />

      {/* Header */}
      <div style={{ flexShrink: 0, padding: 'var(--header-top) 20px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            onTouchStart={startHold}
            onTouchEnd={cancelHold}
            onTouchCancel={cancelHold}
            onMouseDown={startHold}
            onMouseUp={cancelHold}
            onMouseLeave={cancelHold}
            onContextMenu={e => e.preventDefault()}
            style={{ position: 'relative', width: 34, height: 34, flexShrink: 0, cursor: 'pointer', userSelect: 'none', WebkitUserSelect: 'none' } as any}>
            <svg viewBox="0 0 62 62" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%',
              filter: 'drop-shadow(0 0 7px rgba(167,139,250,.55))' }}>
              <polygon points="2,6 60,6 31,58" style={{ fill: '#1C1F3A', stroke: 'rgba(167,139,250,.55)', strokeWidth: 1.5 }} />
            </svg>
            <img src={logoIcon} alt="" style={{ position: 'absolute', top: '42%', left: '50%',
              transform: 'translate(-50%,-50%)', width: '76%', height: '76%', objectFit: 'contain' }} />
          </div>
          <div>
            <div style={{ fontFamily: f, fontWeight: 800, fontSize: 17, lineHeight: 1 }}>
              Chimera <span style={{ color: '#A78BFA' }}>AI</span>
            </div>
            <div style={{ fontFamily: mono, fontSize: 7.5, color: 'rgba(255,255,255,.28)', letterSpacing: '.18em', marginTop: 2 }}>
              ГЛАВНОЕ МЕНЮ
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 20,
          background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)' }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#A78BFA',
            boxShadow: '0 0 6px #A78BFA', animation: 'blink 2s infinite' }} />
          <span style={{ fontFamily: mono, fontSize: 8.5, fontWeight: 600, letterSpacing: '.2em', color: 'rgba(255,255,255,.4)' }}>LIVE</span>
        </div>
      </div>

      {/* Stats strip */}
      <M.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .08 }}
        style={{ flexShrink: 0, margin: '0 20px 14px', borderRadius: 14,
          background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)',
          display: 'flex' }}>
        {[['5','СИГНАЛОВ'],['74%','ТОЧНОСТЬ'],['+24%','ROI']].map(([v,l],i) => (
          <div key={i} style={{ flex: 1, padding: '10px 0', textAlign: 'center',
            borderRight: i < 2 ? '1px solid rgba(255,255,255,.06)' : 'none' }}>
            <div style={{ fontFamily: f, fontWeight: 900, fontSize: 16, lineHeight: 1,
              color: i===2?'#34D399':i===0?'#A78BFA':'#FAFAF8' }}>{v}</div>
            <div style={{ fontFamily: mono, fontSize: 7.5, color: 'rgba(255,255,255,.28)', marginTop: 3, letterSpacing: '.1em' }}>{l}</div>
          </div>
        ))}
      </M.div>

      {/* Category cards */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px var(--scroll-bottom)',
        scrollbarWidth: 'none' as const, display: 'flex', flexDirection: 'column', gap: 8 }}>

        {CATS.map((cat, i) => (
          <M.div key={cat.id}
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: .1 + i * .07, type: 'spring', stiffness: 220 }}
            whileTap={{ scale: .97 }}
            onClick={() => { haptic('medium'); go(cat.id) }}
            style={{ position: 'relative', borderRadius: 18, overflow: 'hidden',
              height: 92, cursor: 'pointer',
              background: '#04020D',
              boxShadow: `0 6px 28px ${cat.glow}, inset 0 1px 0 rgba(255,255,255,.07)` }}>

            {/* Photo bg via CSS — no broken-image placeholder */}
            <div style={{ position: 'absolute', inset: 0,
              backgroundImage: `url("${cat.photo}")`,
              backgroundSize: cat.photo === sniperBg || cat.photo === goldenCupBg ? 'contain' : 'cover',
              backgroundPosition: cat.photo === sniperBg || cat.photo === goldenCupBg ? 'right center' : 'center',
              backgroundRepeat: 'no-repeat',
              filter: cat.photo === sniperBg || cat.photo === goldenCupBg
                ? 'none'
                : 'brightness(.5) saturate(.6) contrast(1.05)',
              opacity: cat.photo === sniperBg || cat.photo === goldenCupBg ? 0.7 : 1 }} />
            {/* Overlay */}
            <div style={{ position: 'absolute', inset: 0, background: cat.overlay }} />
            {/* Left accent strip */}
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
              background: cat.line, boxShadow: `2px 0 12px ${cat.accent}77` }} />

            {/* Large icon right — over photo */}
            <div style={{ position: 'absolute', right: -8, top: '50%', transform: 'translateY(-50%)',
              opacity: .22, pointerEvents: 'none' }}>
              <img src={cat.icon} width={88} height={88} alt="" style={{ filter: `drop-shadow(0 0 18px ${cat.accent})` }} />
            </div>

            {/* Content */}
            <div style={{ position: 'relative', zIndex: 2, height: '100%',
              display: 'flex', alignItems: 'center', padding: '0 18px 0 16px', gap: 14 }}>

              {/* Small icon */}
              <div style={{ width: 48, height: 48, borderRadius: 13, flexShrink: 0, overflow: 'hidden',
                background: `${cat.accent}18`, border: `1px solid ${cat.accent}35`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 0 16px ${cat.glow}` }}>
                {<img src={cat.icon} width={30} height={30} alt="" />}
              </div>

              {/* Text */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: f, fontWeight: 900, fontSize: 16, lineHeight: 1, marginBottom: 5 }}>{cat.label}</div>
                <div style={{ fontFamily: mono, fontSize: 9, color: 'rgba(255,255,255,.42)' }}>
                  {counts[cat.id] !== undefined ? `${counts[cat.id]} · Сегодня` : cat.sub}
                </div>
              </div>

              {/* Count */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, flexShrink: 0 }}>
                <div style={{ width: 40, height: 40, borderRadius: 11,
                  background: `${cat.accent}15`, border: `1px solid ${cat.accent}35`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontFamily: f, fontWeight: 900, fontSize: 20, color: cat.accent, lineHeight: 1 }}>
                    {counts[cat.id] ?? cat.count}
                  </span>
                </div>
                <span style={{ fontFamily: mono, fontSize: 7, color: 'rgba(255,255,255,.2)', letterSpacing: '.08em' }}>сегодня</span>
              </div>
            </div>
          </M.div>
        ))}

        {/* Favorites */}
        <M.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: .44, type: 'spring', stiffness: 220 }}
          whileTap={{ scale: .97 }}
          onClick={() => go('home-favorites')}
          style={{ borderRadius: 18, height: 72, cursor: 'pointer', position: 'relative', overflow: 'hidden',
            display: 'flex', alignItems: 'center', padding: '0 18px 0 16px', gap: 14,
            background: 'linear-gradient(135deg,#0A0800 0%,#120D02 60%,#1A1005 100%)' }}>
          <div style={{ position: 'absolute', inset: 0,
            background: 'linear-gradient(90deg,rgba(4,2,13,.97) 0%,rgba(4,2,13,.78) 55%,rgba(255,215,0,.1) 100%)' }} />
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 2.5,
            background: 'linear-gradient(180deg,#B8860B,#FFD700,#C0A040)', boxShadow: '2px 0 10px rgba(255,215,0,.45)' }} />
          {/* Olympic rings */}
          <div style={{ width: 48, height: 48, borderRadius: 13, flexShrink: 0, position: 'relative', zIndex: 2,
            background: 'rgba(255,215,0,.1)', border: '1px solid rgba(255,215,0,.28)',
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="34" height="22" viewBox="0 0 34 22" fill="none">
              <circle cx="7"  cy="10" r="5" fill="none" stroke="#60A5FA" strokeWidth="2"/>
              <circle cx="17" cy="10" r="5" fill="none" stroke="#F1F5F9" strokeWidth="2" strokeOpacity=".7"/>
              <circle cx="27" cy="10" r="5" fill="none" stroke="#EF4444" strokeWidth="2"/>
              <circle cx="12" cy="15" r="5" fill="none" stroke="#FBBF24" strokeWidth="2"/>
              <circle cx="22" cy="15" r="5" fill="none" stroke="#10B981" strokeWidth="2"/>
            </svg>
          </div>
          <div style={{ flex: 1, position: 'relative', zIndex: 2 }}>
            <div style={{ fontFamily: f, fontWeight: 900, fontSize: 15, color: '#FAFAF8', marginBottom: 3 }}>Избранные</div>
            <div style={{ fontFamily: mono, fontSize: 9, color: 'rgba(255,255,255,.35)' }}>Сохранённые сигналы</div>
          </div>
          <span style={{ fontSize: 18, color: 'rgba(255,215,0,.5)', position: 'relative', zIndex: 2 }}>›</span>
        </M.div>

      </div>

      {/* Dev PRO toast */}
      {toast && (
        <div style={{ position: 'absolute', top: 'calc(var(--header-top) + 56px)', left: '50%',
          transform: 'translateX(-50%)', zIndex: 999,
          background: 'rgba(20,10,40,.96)', border: '1px solid rgba(167,139,250,.4)',
          borderRadius: 20, padding: '8px 18px', whiteSpace: 'nowrap',
          fontFamily: "'JetBrains Mono',monospace", fontSize: 12, fontWeight: 700, color: '#DDD6FE',
          boxShadow: '0 0 24px rgba(139,92,246,.4)' }}>
          {toast}
        </div>
      )}

      <style>{`
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}
      `}</style>
    </M.div>
  )
}
