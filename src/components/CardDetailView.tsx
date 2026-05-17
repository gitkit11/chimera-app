/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useFunnel } from '../store/funnel'
import lionIcon   from '../assets/agents/lion.svg'
import goatIcon   from '../assets/agents/goat.svg'
import snakeIcon  from '../assets/agents/snake.svg'

const M = motion as any
const f    = "'Clash Display','Unbounded',sans-serif"
const mono = "'JetBrains Mono',monospace"

export type DetailCard = {
  id: string
  sport: string
  tag: string
  home: string
  away: string
  rec: string
  odds: string
  ev: string
  score: number
  rarity: 'rare' | 'epic' | 'legend' | 'chimera'
  time: string
  date?: string
  bg: string
}

const RARITY = {
  rare:    { label: 'RARE',    color: '#60A5FA' },
  epic:    { label: 'EPIC',    color: '#C084FC' },
  legend:  { label: 'LEGEND',  color: '#F97316' },
  chimera: { label: 'CHIMERA', color: '#EAB308' },
}

const AI_AGENTS = [
  { role: 'ST', name: 'Статистик', icon: lionIcon,  accent: '#F59E0B', text: 'Математический анализ показывает преимущество. Высокий EV относительно рыночной оценки.' },
  { role: 'SC', name: 'Скаут',     icon: goatIcon,  accent: '#94A3B8', text: 'Контекстные факторы подтверждают сигнал. Форма и мотивация на стороне выбранного исхода.' },
  { role: 'AR', name: 'Арбитр',    icon: snakeIcon, accent: '#10B981', text: 'Дивергенция рынка +15pp. Рекомендую ставку по Kelly.', verdict: true },
]

interface Props {
  card: DetailCard
  onClose: () => void
}

export default function CardDetailView({ card, onClose }: Props) {
  const go          = useFunnel(s => s.go)
  const favorites   = useFunnel(s => s.favorites)
  const addFav      = useFunnel(s => s.addFavorite)
  const removeFav   = useFunnel(s => s.removeFavorite)
  const [flipped, setFlipped] = useState(false)
  const isFav = favorites.includes(card.id)

  const flip = () => setFlipped(p => !p)

  return (
    <div style={{ height: '100%', background: '#04020D', overflow: 'hidden', position: 'relative' }}>
      {/* Photo bg */}
      <img src={card.bg} alt="" style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%',
        objectFit: 'cover', objectPosition: 'center top',
        filter: 'brightness(.6) saturate(.65)',
        display: flipped ? 'none' : 'block',
      }} />
      {!flipped && <div style={{ position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg,rgba(4,2,13,.35) 0%,rgba(4,2,13,.02) 22%,rgba(4,2,13,.02) 44%,rgba(4,2,13,.65) 65%,rgba(4,2,13,.97) 86%)' }} />}
      {flipped && <div style={{ position: 'absolute', inset: 0,
        background: 'linear-gradient(160deg,#0F0535 0%,#060D2E 45%,#020812 100%)' }} />}

      {/* Top bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, display: 'flex',
        alignItems: 'center', justifyContent: 'space-between', padding: '16px 16px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px',
          borderRadius: 20, background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(8px)' }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%',
            background: RARITY[card.rarity].color, boxShadow: `0 0 8px ${RARITY[card.rarity].color}` }} />
          <span style={{ fontFamily: mono, fontSize: 9.5, fontWeight: 800,
            letterSpacing: '.16em', color: RARITY[card.rarity].color }}>{RARITY[card.rarity].label}</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {/* Favorite */}
          <M.button whileTap={{ scale: .88 }} onClick={() => isFav ? removeFav(card.id) : addFav(card.id)}
            style={{ width: 36, height: 36, borderRadius: 10, border: 'none', cursor: 'pointer',
              background: isFav ? 'rgba(255,215,0,.25)' : 'rgba(0,0,0,.5)',
              backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, color: isFav ? '#FFD700' : 'rgba(255,255,255,.5)',
              boxShadow: isFav ? '0 0 12px rgba(255,215,0,.4)' : 'none',
              transition: 'all .2s' }}>
            {isFav ? '★' : '☆'}
          </M.button>
          {/* Close */}
          <M.button whileTap={{ scale: .88 }} onClick={onClose}
            style={{ width: 36, height: 36, borderRadius: 10, border: 'none', cursor: 'pointer',
              background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, color: 'rgba(255,255,255,.6)' }}>✕</M.button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* FRONT */}
        {!flipped && (
          <M.div key="front"
            initial={{ opacity: 0, scaleX: .9 }} animate={{ opacity: 1, scaleX: 1 }}
            exit={{ opacity: 0, scaleX: .9 }} transition={{ duration: .25 }}
            style={{ position: 'absolute', inset: 0, overflowY: 'auto',
              scrollbarWidth: 'none', paddingBottom: 90, display: 'flex',
              flexDirection: 'column', justifyContent: 'flex-end' }}>
            <div style={{ padding: '0 22px' }}>
              {/* Meta */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                <span style={{ fontFamily: mono, fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,.38)' }}>{card.tag}</span>
                {card.date && <><span style={{ color: 'rgba(255,255,255,.18)' }}>·</span>
                <span style={{ fontFamily: mono, fontSize: 9, color: 'rgba(255,255,255,.28)' }}>{card.date}</span></>}
                <span style={{ color: 'rgba(255,255,255,.18)' }}>·</span>
                <span style={{ fontFamily: mono, fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.65)' }}>{card.time}</span>
              </div>
              {/* Teams */}
              <div style={{ fontFamily: f, fontWeight: 900, fontSize: 'clamp(26px,7.5vw,34px)', lineHeight: .95, marginBottom: 6 }}>{card.home}</div>
              <div style={{ fontFamily: mono, fontSize: 11, fontWeight: 700, color: '#A78BFA', letterSpacing: '.15em', marginBottom: 6, paddingLeft: 4 }}>VS</div>
              <div style={{ fontFamily: f, fontWeight: 900, fontSize: 'clamp(26px,7.5vw,34px)', lineHeight: .95, color: 'rgba(255,255,255,.5)', marginBottom: 20 }}>{card.away}</div>
              {/* Metrics */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                {[
                  { l: 'Ставка', v: card.rec,  c: '#A78BFA', bg: 'rgba(139,92,246,.15)', bd: 'rgba(139,92,246,.3)', grow: true  },
                  { l: 'Коэф',   v: card.odds, c: '#FAFAF8', bg: 'rgba(255,255,255,.07)', bd: 'rgba(255,255,255,.1)', grow: false },
                  { l: 'EV',     v: card.ev,   c: '#34D399', bg: 'rgba(52,211,153,.1)',   bd: 'rgba(52,211,153,.25)', grow: false },
                ].map(({ l, v, c, bg, bd, grow }) => (
                  <div key={l} style={{ ...(grow ? { flex: 1 } : {}), padding: '9px 12px', borderRadius: 12, background: bg, border: `1px solid ${bd}` }}>
                    <div style={{ fontFamily: mono, fontSize: 7.5, letterSpacing: '.2em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,.35)', marginBottom: 3 }}>{l}</div>
                    <div style={{ fontFamily: f, fontWeight: 900, fontSize: 18, color: c }}>{v}</div>
                  </div>
                ))}
              </div>
              {/* Score */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '9px 12px', borderRadius: 12, background: 'rgba(255,255,255,.04)',
                border: '1px solid rgba(255,255,255,.07)' }}>
                <span style={{ fontFamily: mono, fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,.3)' }}>Chimera Score</span>
                <span style={{ fontFamily: f, fontWeight: 900, fontSize: 22,
                  background: 'linear-gradient(135deg,#EDE9FE,#A78BFA)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{card.score}/100</span>
              </div>
            </div>
          </M.div>
        )}

        {/* BACK — AI */}
        {flipped && (
          <M.div key="back"
            initial={{ opacity: 0, scaleX: .9 }} animate={{ opacity: 1, scaleX: 1 }}
            exit={{ opacity: 0, scaleX: .9 }} transition={{ duration: .25 }}
            style={{ position: 'absolute', inset: 0, overflowY: 'auto',
              scrollbarWidth: 'none', padding: '76px 16px 110px',
              display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontFamily: mono, fontSize: 10, fontWeight: 700, letterSpacing: '.28em',
              textTransform: 'uppercase' as const, color: '#A78BFA' }}>◆ AI Разбор · {card.home} vs {card.away}</div>
            {AI_AGENTS.map((a, ai) => (
              <div key={ai} style={{ padding: '12px 14px', borderRadius: 14,
                background: (a as any).verdict ? 'rgba(167,139,250,.1)' : 'rgba(255,255,255,.04)',
                border: `1px solid ${(a as any).verdict ? 'rgba(167,139,250,.38)' : 'rgba(255,255,255,.07)'}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 7 }}>
                  <img src={a.icon} width={34} height={34} alt="" style={{ borderRadius: 8, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontFamily: f, fontWeight: 700, fontSize: 13 }}>{a.name}</div>
                    <div style={{ fontFamily: mono, fontSize: 8, color: a.accent, letterSpacing: '.1em' }}>{a.role} Agent</div>
                  </div>
                </div>
                <div style={{ fontFamily: mono, fontSize: 11, color: 'rgba(255,255,255,.65)', lineHeight: 1.5 }}>{a.text}</div>
              </div>
            ))}
            <div style={{ padding: '10px 14px', borderRadius: 12, borderLeft: '2px solid #6B89AB',
              background: 'rgba(58,79,107,.12)' }}>
              <div style={{ fontFamily: mono, fontSize: 8, color: '#8FA8C2', letterSpacing: '.2em',
                textTransform: 'uppercase' as const, marginBottom: 4 }}>Shadow (Llama 70B)</div>
              <div style={{ fontFamily: mono, fontSize: 11, color: 'rgba(255,255,255,.6)', lineHeight: 1.5 }}>
                Согласна с основным вердиктом. Сигнал чистый.
              </div>
            </div>
          </M.div>
        )}
      </AnimatePresence>

      {/* Bottom buttons */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10,
        padding: '14px 16px 30px',
        background: 'linear-gradient(180deg,transparent,rgba(4,2,13,.97) 35%)' }}>
        <div style={{ display: 'flex', gap: 10 }}>
          {!flipped ? (
            <>
              <M.button whileTap={{ scale: .9 }} onClick={onClose}
                style={{ width: 52, height: 52, borderRadius: 15, border: '1px solid rgba(255,255,255,.1)',
                  cursor: 'pointer', background: 'rgba(255,255,255,.06)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, color: 'rgba(255,255,255,.5)' }}>←</M.button>
              <M.button whileTap={{ scale: .97 }} onClick={flip}
                style={{ flex: 1, height: 52, padding: '2px', borderRadius: 15,
                  overflow: 'hidden', background: 'none', border: 'none', cursor: 'pointer',
                  position: 'relative', display: 'block' }}>
                <span aria-hidden style={{ position: 'absolute', top: '50%', left: '50%', width: '220%', height: '220%',
                  transform: 'translate(-50%,-50%)', animation: 'cdv-spin 2.8s linear infinite',
                  background: 'conic-gradient(from 0deg,#04020D 0deg,#04020D 95deg,#5B21B6 140deg,#A78BFA 178deg,#DDD6FE 195deg,#A78BFA 212deg,#5B21B6 255deg,#04020D 300deg,#04020D 360deg)',
                  pointerEvents: 'none' }} />
                <span style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  height: '100%', borderRadius: 13, zIndex: 1,
                  background: 'linear-gradient(135deg,#160528 0%,#2D1065 45%,#3B1578 100%)',
                  fontFamily: f, fontWeight: 700, fontSize: 15, letterSpacing: '.04em', color: '#F5F3FF' }}>
                  <span aria-hidden style={{ position: 'absolute', inset: 0, borderRadius: 13, pointerEvents: 'none',
                    background: 'linear-gradient(105deg,transparent 25%,rgba(255,255,255,.1) 45%,rgba(255,255,255,.2) 50%,rgba(255,255,255,.1) 55%,transparent 75%)',
                    animation: 'cdv-shim 3.2s ease-in-out infinite' }} />
                  Разбор AI
                </span>
              </M.button>
            </>
          ) : (
            <>
              <M.button whileTap={{ scale: .97 }} onClick={flip}
                style={{ flex: 1, height: 52, borderRadius: 15, border: 'none', cursor: 'pointer',
                  background: 'linear-gradient(135deg,#2D1065,#5B21B6)',
                  boxShadow: '0 0 0 1px rgba(139,92,246,.4)',
                  fontFamily: f, fontWeight: 700, fontSize: 14, color: '#F5F3FF' }}>← К сигналу</M.button>
              <M.button whileTap={{ scale: .97 }} onClick={() => go('paywall')}
                style={{ flex: 1, height: 52, borderRadius: 15, cursor: 'pointer',
                  background: 'rgba(139,92,246,.15)', border: '1px solid rgba(139,92,246,.3)' as any,
                  fontFamily: f, fontWeight: 700, fontSize: 12, color: '#A78BFA' }}>PRO доступ →</M.button>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes cdv-spin { to { transform: translate(-50%,-50%) rotate(360deg) } }
        @keyframes cdv-shim { 0%,42%{transform:translateX(-100%)} 62%,100%{transform:translateX(220%)} }
      `}</style>
    </div>
  )
}
