/* eslint-disable @typescript-eslint/no-explicit-any */
import { motion } from 'framer-motion'
import { useFunnel } from '../store/funnel'
import { haptic } from '../haptic'
import iconDark from '../assets/icon_dark2.png'

const M = motion as any
const f = "'Clash Display','Unbounded',sans-serif"

// ── Кастомные иконки (без эмодзи) ─────────────────────────────────────────────
function ChipIcon({ size = 14, c = '#C4B5FD' }: { size?: number; c?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'block' }}>
      <rect x="6" y="6" width="12" height="12" rx="2.5" stroke={c} strokeWidth="1.6" />
      <circle cx="12" cy="12" r="2.2" fill={c} />
      {[9, 12, 15].map((p, i) => (
        <g key={i}>
          <line x1={p} y1="3.5" x2={p} y2="6" stroke={c} strokeWidth="1.4" strokeLinecap="round" />
          <line x1={p} y1="18" x2={p} y2="20.5" stroke={c} strokeWidth="1.4" strokeLinecap="round" />
          <line x1="3.5" y1={p} x2="6" y2={p} stroke={c} strokeWidth="1.4" strokeLinecap="round" />
          <line x1="18" y1={p} x2="20.5" y2={p} stroke={c} strokeWidth="1.4" strokeLinecap="round" />
        </g>
      ))}
    </svg>
  )
}
function BoltIcon({ size = 14, c = '#A78BFA' }: { size?: number; c?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'block' }}>
      <path d="M13 2 4.5 13.5H11l-1.5 8.5L20 10h-6.5L13 2Z" fill={c} fillOpacity=".9" />
    </svg>
  )
}
function TargetIcon({ size = 14, c = '#A78BFA' }: { size?: number; c?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'block' }}>
      <circle cx="12" cy="12" r="8.5" stroke={c} strokeWidth="1.5" opacity=".55" />
      <circle cx="12" cy="12" r="4.5" stroke={c} strokeWidth="1.5" />
      <circle cx="12" cy="12" r="1.6" fill={c} />
    </svg>
  )
}
function GiftIcon({ size = 19, c = '#F5F3FF' }: { size?: number; c?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'block' }}>
      <rect x="4" y="9" width="16" height="11" rx="1.5" stroke={c} strokeWidth="1.7" />
      <path d="M3 9h18v3.5H3z" fill={c} fillOpacity=".22" />
      <line x1="12" y1="9" x2="12" y2="20" stroke={c} strokeWidth="1.7" />
      <path d="M12 9c-2.5 0-4-1-4-2.6C8 5 9 4.4 10 4.7 11.3 5.1 12 9 12 9Zm0 0c2.5 0 4-1 4-2.6C16 5 15 4.4 14 4.7 12.7 5.1 12 9 12 9Z"
        stroke={c} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

export default function Cover() {
  const go = useFunnel(s => s.go)

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: '#04020D' }}>
      {/* Фон — премиум aurora-mesh, собран кодом (чёткий, без артефактов) */}
      <div className="absolute inset-0 z-0" style={{ background: 'radial-gradient(130% 90% at 50% 0%, #150A2E 0%, #0A0518 46%, #04020D 100%)' }}>
        {/* Живые свечения */}
        <M.div aria-hidden
          animate={{ x: [-24, 20, -24], y: [-14, 12, -14] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute', top: '-8%', left: '18%', width: '78%', height: '52%',
            background: 'radial-gradient(circle at 50% 50%, rgba(124,58,237,.62), rgba(124,58,237,0) 62%)',
            filter: 'blur(46px)', pointerEvents: 'none',
          }} />
        <M.div aria-hidden
          animate={{ x: [18, -16, 18], y: [8, -10, 8] }}
          transition={{ duration: 19, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute', top: '2%', right: '-14%', width: '62%', height: '46%',
            background: 'radial-gradient(circle at 50% 50%, rgba(217,70,239,.42), rgba(217,70,239,0) 64%)',
            filter: 'blur(52px)', pointerEvents: 'none',
          }} />
        <M.div aria-hidden
          animate={{ opacity: [.5, .85, .5] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute', top: '20%', left: '-16%', width: '54%', height: '40%',
            background: 'radial-gradient(circle at 50% 50%, rgba(56,189,248,.24), rgba(56,189,248,0) 66%)',
            filter: 'blur(56px)', pointerEvents: 'none',
          }} />
        {/* Тонкая сетка-перспектива */}
        <div aria-hidden style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', opacity: .5,
          background: 'linear-gradient(rgba(167,139,250,.09) 1px, transparent 1px), linear-gradient(90deg, rgba(167,139,250,.09) 1px, transparent 1px)',
          backgroundSize: '46px 46px',
          maskImage: 'radial-gradient(120% 80% at 50% 8%, #000 0%, #000 40%, transparent 74%)',
          WebkitMaskImage: 'radial-gradient(120% 80% at 50% 8%, #000 0%, #000 40%, transparent 74%)',
        }} />
        {/* Зерно */}
        <div aria-hidden style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', opacity: .05, mixBlendMode: 'overlay',
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }} />
        {/* Затемнение к низу под текст */}
        <div aria-hidden style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(180deg, rgba(4,2,13,0) 34%, rgba(4,2,13,.55) 62%, rgba(4,2,13,.9) 84%, #04020D 100%)'
        }} />
      </div>

      {/* Верхний отступ: клирим вырез iPhone, но БЕЗ двойного счёта (max, не сумма)
          → логотип/LIVE стоят выше, а не проваливаются вниз. */}
      <div className="relative z-10 h-full flex flex-col px-[20px]"
        style={{ paddingTop: 'calc(max(env(safe-area-inset-top,0px), var(--tg-safe-top,0px)) + 10px)' }}>

        {/* Top bar */}
        <M.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .08, duration: .6 }}
          className="flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-[10px]">
            <div className="flex-shrink-0" style={{ width: 44, height: 44, position: 'relative' }}>
              <svg viewBox="0 0 62 62" style={{
                position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible',
                filter: 'drop-shadow(0 0 8px rgba(139,92,246,.5)) drop-shadow(0 3px 10px rgba(0,0,0,.6))'
              }}>
                <polygon points="2,6 60,6 31,58"
                  style={{ fill: '#1C1F3A', stroke: 'rgba(139,92,246,.5)', strokeWidth: 1.5 }} />
              </svg>
              <img src={iconDark} alt="Chimera AI" style={{
                position: 'absolute', top: '42%', left: '50%',
                transform: 'translate(-50%,-50%)', width: '76%', height: '76%', objectFit: 'contain'
              }} />
            </div>
            <span className="font-bold text-[15px] tracking-wide" style={{ fontFamily: f }}>
              Chimera <span style={{ color: '#A78BFA' }}>AI</span>
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-[6px] rounded-full text-[9px] font-mono font-medium tracking-[.2em] uppercase"
            style={{ border: '1px solid rgba(255,255,255,.2)', background: 'rgba(4,2,13,.55)', color: 'rgba(255,255,255,.45)' }}>
            <span className="w-[5px] h-[5px] rounded-full"
              style={{ background: '#A78BFA', boxShadow: '0 0 8px #A78BFA', animation: 'blink 2s infinite' }} />
            Live
          </div>
        </M.div>

        <div className="flex-1 flex flex-col justify-end min-h-0"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom,0px) + var(--tg-safe-bottom,0px) + 96px)' }}>

          {/* Плашка: первый AI-беттинг */}
          <M.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .18, duration: .6 }}
            className="inline-flex items-center gap-2 self-start px-3 py-[6px] rounded-full mb-[14px]"
            style={{ background: 'rgba(124,58,237,.18)', border: '1px solid rgba(167,139,250,.4)', boxShadow: '0 0 22px rgba(124,58,237,.25) inset' }}>
            <ChipIcon size={12} />
            <span className="font-mono text-[9px] font-bold tracking-[.16em] uppercase" style={{ color: '#C4B5FD' }}>
              Первый AI‑беттинг
            </span>
          </M.div>

          {/* Заголовок */}
          <M.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .26, duration: .7 }}
            style={{
              fontSize: 'clamp(30px,9vw,43px)', fontFamily: f, fontWeight: 800,
              lineHeight: .96, letterSpacing: '-.015em', marginBottom: 14,
              background: 'linear-gradient(135deg,#FFFFFF 0%,#EDE9FE 24%,#C4B5FD 52%,#A78BFA 78%,#7C3AED 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 2px 30px rgba(167,139,250,.45))'
            }}>
            4 передовых ИИ<br />ставят вместе с тобой
          </M.h1>

          {/* Движок — 4 ИИ (фирменные акценты) */}
          <M.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .36, duration: .6 }}
            className="mb-[15px]">
            <div className="font-mono text-[8px] font-semibold tracking-[.22em] uppercase mb-[7px]"
              style={{ color: 'rgba(196,181,253,.55)' }}>В основе — движок из моделей</div>
            <div className="flex flex-wrap gap-[7px]">
              {[['Anthropic', '#D97757'], ['OpenAI', '#10A37F'], ['Grok', '#E6E6EA'], ['+ агенты', '#A78BFA']].map(([n, c], i) => (
                <span key={i} className="inline-flex items-center gap-[6px] pl-[8px] pr-[11px] py-[5px] rounded-full"
                  style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.12)', backdropFilter: 'blur(6px)' }}>
                  <span style={{ width: 6, height: 6, borderRadius: 99, background: c as string, boxShadow: `0 0 7px ${c}` }} />
                  <span className="text-[11.5px] font-medium" style={{ fontFamily: f, color: '#F5F3FF', letterSpacing: '.01em' }}>{n}</span>
                </span>
              ))}
            </div>
          </M.div>

          {/* Буллеты-доказательства (кастомные иконки) */}
          <M.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .44, duration: .6 }}
            className="flex flex-col gap-[9px] mb-5">
            {[
              [<ChipIcon size={14} c="#A78BFA" />, <>Обучен на <b style={{ color: '#F5F3FF' }}>179 000</b> матчах, 5 видов спорта</>],
              [<BoltIcon size={14} />, <><b style={{ color: '#F5F3FF' }}>10 000+</b> матчей уже проанализировано</>],
              [<TargetIcon size={14} />, <>В сигналы попадают <b style={{ color: '#F5F3FF' }}>единицы</b> — сильнейшие</>],
            ].map(([ic, tx], i) => (
              <div key={i} className="flex items-center gap-[10px]">
                <span style={{ width: 18, display: 'flex', justifyContent: 'center' }}>{ic as any}</span>
                <span className="text-[12.5px] font-light" style={{ color: 'rgba(250,250,248,.7)' }}>{tx as any}</span>
              </div>
            ))}
          </M.div>

          {/* Stats */}
          <M.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .54, duration: .6 }}
            className="flex py-3"
            style={{ borderTop: '1px solid rgba(255,255,255,.09)', borderBottom: '1px solid rgba(255,255,255,.09)' }}>
            {[['+64%', 'Средний ROI', '#34D399'], ['179K', 'Матчей в базе', '#FAFAF8'], ['4', 'ИИ‑модели', '#A78BFA']].map(([v, l, col], i) => (
              <div key={i} className={`flex-1 ${i > 0 ? 'pl-[13px]' : ''}`}
                style={i < 2 ? { borderRight: '1px solid rgba(255,255,255,.09)' } : {}}>
                <div style={{ fontFamily: f, fontWeight: 800, fontSize: 18, lineHeight: 1, marginBottom: 3, color: col as string }}>{v}</div>
                <div className="font-mono text-[8px] font-medium tracking-[.16em] uppercase" style={{ color: 'rgba(250,250,248,.42)' }}>{l}</div>
              </div>
            ))}
          </M.div>

        </div>
      </div>

      {/* CTA */}
      <M.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .64, duration: .6 }}
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 20,
          padding: `0 20px max(20px, calc(env(safe-area-inset-bottom,0px) + var(--tg-safe-bottom,0px) + 16px))`
        }}>
        <M.button
          whileTap={{ scale: .96 }}
          transition={{ type: 'spring', stiffness: 380, damping: 15 }}
          onClick={() => { haptic('heavy'); go('stake-select') }}
          style={{
            position: 'relative', width: '100%', padding: '2px', borderRadius: 16,
            overflow: 'hidden', background: 'none', border: 'none', cursor: 'pointer', display: 'block'
          }}>
          <span aria-hidden style={{
            position: 'absolute', top: '50%', left: '50%', width: '220%', height: '220%',
            transform: 'translate(-50%,-50%)', animation: 'cta-spin 2.8s linear infinite',
            background: 'conic-gradient(from 0deg,#04020D 0deg,#04020D 95deg,#5B21B6 140deg,#A78BFA 178deg,#DDD6FE 195deg,#A78BFA 212deg,#5B21B6 255deg,#04020D 300deg,#04020D 360deg)',
            pointerEvents: 'none',
          }} />
          <span style={{
            position: 'relative', display: 'flex', alignItems: 'stretch',
            borderRadius: 14, overflow: 'hidden', zIndex: 1,
            background: 'linear-gradient(115deg,#160528 0%,#2D1065 40%,#3B1578 70%,#1a0533 100%)'
          }}>
            <span aria-hidden style={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              background: 'linear-gradient(105deg,transparent 25%,rgba(255,255,255,.11) 45%,rgba(255,255,255,.22) 50%,rgba(255,255,255,.11) 55%,transparent 75%)',
              animation: 'cta-shim 3.4s ease-in-out infinite',
            }} />
            <span aria-hidden style={{
              position: 'absolute', top: 0, left: '6%', right: '6%', height: 1, pointerEvents: 'none',
              background: 'linear-gradient(90deg,transparent,rgba(255,255,255,.5),transparent)',
            }} />
            <span style={{
              flex: 1, padding: '20px 22px', position: 'relative', zIndex: 1,
              display: 'flex', alignItems: 'center', gap: 10,
              fontFamily: f, fontWeight: 700, fontSize: 16.5, letterSpacing: '.02em', color: '#F5F3FF',
              textShadow: '0 0 18px rgba(167,139,250,.45)'
            }}>
              <GiftIcon size={19} />Забрать бесплатную ставку
            </span>
            <span style={{
              width: 58, flexShrink: 0, display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 20, fontWeight: 700, color: 'rgba(245,243,255,.9)',
              background: 'rgba(0,0,0,.22)', borderLeft: '1px solid rgba(167,139,250,.22)',
              position: 'relative', zIndex: 1
            }}>→</span>
          </span>
        </M.button>
      </M.div>

      <style>{`
        @keyframes cta-spin { to { transform: translate(-50%,-50%) rotate(360deg) } }
        @keyframes cta-shim { 0%,42% { transform: translateX(-100%) } 62%,100% { transform: translateX(220%) } }
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}
      `}</style>
    </div>
  )
}
