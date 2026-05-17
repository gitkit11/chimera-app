/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useFunnel } from '../store/funnel'
import OnboardHint from '../components/OnboardHint'
import footballIcon   from '../assets/icons/football.svg'
import basketballIcon from '../assets/icons/basketball.svg'
import tennisIcon     from '../assets/icons/tennis.svg'
import cs2Icon        from '../assets/icons/cs2.svg'
import hockeyIcon     from '../assets/icons/hockey.svg'
import tapIcon        from '../assets/icons/tap.svg'
import lockIcon       from '../assets/icons/lock.svg'
import logoIcon       from '../assets/icon_dark2.png'

const SPORT_ICONS: Record<string, string> = {
  football: footballIcon, basketball: basketballIcon,
  tennis: tennisIcon, cs2: cs2Icon, hockey: hockeyIcon,
}

const M = motion as any
const f = "'Clash Display','Unbounded',sans-serif"
const mono = "'JetBrains Mono',monospace"

const MONTHS_RU = ['янв','фев','мар','апр','май','июн','июл','авг','сен','окт','ноя','дек']
function yesterdayRu() {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return `${d.getDate()} ${MONTHS_RU[d.getMonth()]}`
}
const YESTERDAY = yesterdayRu()

// Rarity system — 4 tiers
const RARITY = {
  rare:    { label: 'RARE',    color: '#60A5FA', glow: 'rgba(96,165,250,.3)'  },
  epic:    { label: 'EPIC',    color: '#C084FC', glow: 'rgba(192,132,252,.3)' },
  legend:  { label: 'LEGEND',  color: '#F97316', glow: 'rgba(249,115,22,.4)'  },
  chimera: { label: 'CHIMERA', color: '#EAB308', glow: 'rgba(234,179,8,.5)'   },
} as const
type RarityKey = keyof typeof RARITY

const CARDS = [
  { sport: 'football',   tag: 'La Liga',      home: 'Real Madrid', away: 'Man City',  rec: 'П1',     odds: 1.85, ev: '+14%', win: true,  rarity: 'legend'  as RarityKey, date: `${YESTERDAY} · 21:00`, bg: 'https://images.unsplash.com/photo-1522778034537-20a2486be803?w=800&q=80' },
  { sport: 'basketball', tag: 'NBA',           home: 'Lakers',      away: 'Warriors',  rec: 'П1',     odds: 2.10, ev: '+8%',  win: true,  rarity: 'epic'    as RarityKey, date: `${YESTERDAY} · 04:30`, bg: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80' },
  { sport: 'tennis',     tag: 'ATP Finals',    home: 'Djokovic',    away: 'Alcaraz',   rec: 'П1',     odds: 1.55, ev: '+6%',  win: true,  rarity: 'rare'    as RarityKey, date: `${YESTERDAY} · 18:30`, bg: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800&q=80' },
  { sport: 'cs2',        tag: 'CS2 Major',     home: 'FaZe',        away: 'NAVI',      rec: 'П1',     odds: 1.92, ev: '+5%',  win: false, rarity: 'rare'    as RarityKey, date: `${YESTERDAY} · 17:00`, bg: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80' },
  { sport: 'hockey',     tag: 'NHL Playoffs',  home: 'Colorado',    away: 'Edmonton',  rec: 'ТМ 5.5', odds: 1.88, ev: '+15%', win: true,  rarity: 'chimera' as RarityKey, date: `${YESTERDAY} · 03:00`, bg: 'https://images.unsplash.com/photo-1515703407324-5f753afd8be8?w=800&q=80' },
]

function ProfitBanner({ profit, stake }: { profit: number, stake: number }) {
  const [count, setCount] = useState(0)
  const target = Math.round(Math.abs(profit))
  const roi = Math.round((profit / stake) * 100)
  const wins = CARDS.filter(c => c.win).length

  useEffect(() => {
    let cur = 0
    const step = Math.max(1, Math.ceil(target / 40))
    const t = setInterval(() => {
      cur = Math.min(cur + step, target)
      setCount(cur)
      if (cur >= target) clearInterval(t)
    }, 28)
    return () => clearInterval(t)
  }, [target])

  return (
    <M.div key="profit"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 180, damping: 20 }}
      style={{ marginBottom: 10, position: 'relative', borderRadius: 20, overflow: 'hidden' }}
    >
      {/* BG: dark purple with gold glow */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 70% 80% at 20% 40%, rgba(16,185,129,.12) 0%, rgba(124,58,237,.05) 45%, rgba(7,3,15,.99) 70%)',
        border: '1px solid rgba(16,185,129,.22)',
        borderRadius: 20,
      }} />
      {/* Top gold accent line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2, borderRadius: '20px 20px 0 0',
        background: 'linear-gradient(90deg, transparent 0%, #10B981 30%, #6EE7B7 50%, #10B981 70%, transparent 100%)',
        opacity: .9,
      }} />

      <div style={{ position: 'relative', zIndex: 1, padding: '18px 18px 16px' }}>

        {/* Header row: logo + label + badge */}
        <M.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .05 }}
          style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          {/* Chimera logo */}
          <div style={{ position: 'relative', width: 28, height: 28, flexShrink: 0 }}>
            <svg viewBox="0 0 62 62" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%',
              filter: 'drop-shadow(0 0 5px rgba(245,158,11,.5))' }}>
              <polygon points="2,6 60,6 31,58" style={{ fill: '#1C1F3A', stroke: 'rgba(245,158,11,.5)', strokeWidth: 1.5 }} />
            </svg>
            <img src={logoIcon} alt="" style={{ position: 'absolute', top: '42%', left: '50%',
              transform: 'translate(-50%,-50%)', width: '76%', height: '76%', objectFit: 'contain' }} />
          </div>
          <div style={{ fontFamily: mono, fontSize: 9, letterSpacing: '.22em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,.32)', flex: 1 }}>
            Chimera AI · {YESTERDAY} · {CARDS.length} сигналов
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 20, flexShrink: 0,
            background: 'rgba(16,185,129,.15)', border: '1px solid rgba(16,185,129,.35)',
          }}>
            <span style={{ fontFamily: mono, fontSize: 9, fontWeight: 800, color: '#10B981', letterSpacing: '.12em' }}>
              {wins}W
            </span>
            <span style={{ width: 1, height: 10, background: 'rgba(255,255,255,.15)' }} />
            <span style={{ fontFamily: mono, fontSize: 9, fontWeight: 700, color: 'rgba(239,68,68,.8)', letterSpacing: '.12em' }}>
              {CARDS.length - wins}L
            </span>
          </div>
        </M.div>

        {/* Caption */}
        <div style={{ fontFamily: mono, fontSize: 10, fontWeight: 600, letterSpacing: '.25em',
          textTransform: 'uppercase' as const, color: 'rgba(255,255,255,.32)', marginBottom: 6 }}>
          Если бы ты поставил вчера
        </div>

        {/* HERO number — gold gradient */}
        <M.div
          initial={{ opacity: 0, scale: .85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: .12, type: 'spring', stiffness: 150, damping: 14 }}
          style={{ marginBottom: 16 }}>
          <span style={{
            fontFamily: f, fontWeight: 900,
            fontSize: 'clamp(54px,16vw,70px)',
            lineHeight: .88, letterSpacing: '-.025em', display: 'block',
            background: 'linear-gradient(135deg, #FFFFFF 0%, #D1FAE5 25%, #6EE7B7 55%, #10B981 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 32px rgba(16,185,129,.55))',
          }}>
            +€{count}
          </span>
        </M.div>

        {/* Separator */}
        <div style={{ height: 1, marginBottom: 14,
          background: 'linear-gradient(90deg, rgba(16,185,129,.35), rgba(167,139,250,.1) 50%, transparent)' }} />

        {/* Stats */}
        <M.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .28 }}
          style={{ display: 'flex' }}>
          {[
            { v: `+${roi}%`, l: 'ROI', c: '#10B981' },
            { v: `${Math.round(wins/CARDS.length*100)}%`, l: 'Точность', c: '#FAFAF8' },
            { v: `€${stake}`, l: 'Банк', c: 'rgba(255,255,255,.5)' },
          ].map(({ v, l, c }, i) => (
            <div key={i} style={{
              flex: 1,
              paddingLeft: i > 0 ? 14 : 0, paddingRight: i < 2 ? 14 : 0,
              borderRight: i < 2 ? '1px solid rgba(255,255,255,.07)' : 'none',
            }}>
              <div style={{ fontFamily: f, fontWeight: 800, fontSize: 17, lineHeight: 1, color: c, marginBottom: 4 }}>{v}</div>
              <div style={{ fontFamily: mono, fontSize: 9, letterSpacing: '.15em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,.25)' }}>{l}</div>
            </div>
          ))}
        </M.div>

        {/* Signal result bars */}
        <M.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .42 }}
          style={{ display: 'flex', gap: 6, marginTop: 14 }}>
          {CARDS.map((c, i) => (
            <M.div key={i}
              initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
              transition={{ delay: .42 + i * .07, duration: .4, ease: 'easeOut' }}
              style={{ flex: 1, borderRadius: 3, overflow: 'hidden', transformOrigin: 'left' }}>
              <div style={{ height: 5,
                background: c.win
                  ? 'linear-gradient(90deg, #34D399, #10B981)'
                  : 'linear-gradient(90deg, #EF4444, #DC2626)',
                boxShadow: c.win ? '0 0 8px rgba(52,211,153,.6)' : '0 0 6px rgba(239,68,68,.5)',
              }} />
              <div style={{ textAlign: 'center', fontFamily: mono, fontSize: 7.5, marginTop: 4,
                color: c.win ? 'rgba(52,211,153,.7)' : 'rgba(239,68,68,.65)' }}>
                {c.win ? 'WIN' : 'LOSS'}
              </div>
            </M.div>
          ))}
        </M.div>

      </div>
    </M.div>
  )
}

export default function CardReveal() {
  const { go, stake } = useFunnel()
  const [revealed, setRevealed] = useState<boolean[]>([false, false, false, false, false])
  const [showBanner, setShowBanner] = useState(false)

  const revealedCount = revealed.filter(Boolean).length
  const allOpen = revealedCount === 5
  const betSize = Math.round(stake / 5)

  const profit = CARDS.reduce((sum, c, i) =>
    revealed[i] ? sum + (c.win ? betSize * (c.odds - 1) : -betSize) : sum, 0)

  const openCard = (i: number) => {
    if (revealed[i]) return
    setRevealed(p => { const n = [...p]; n[i] = true; return n })
  }

  useEffect(() => {
    if (!allOpen) return
    const t = setTimeout(() => setShowBanner(true), 1400)
    return () => clearTimeout(t)
  }, [allOpen])

  return (
    <M.div
      initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
      transition={{ duration: .32 }}
      className="h-full flex flex-col overflow-hidden"
      style={{ background: '#04020D', position: 'relative' }}
    >
      {/* Onboarding */}
      <OnboardHint
        id="card-reveal"
        illustration="tap"
        title="Тапни каждую карточку"
        sub="Открой все 5 матчей — увидишь сколько заработал бы вчера на своём банке"
        action="Начать →"
      />
      {/* Header */}
      <div className="flex-shrink-0 px-5 pt-[52px] pb-4">
        <div style={{ fontFamily: mono, fontSize: 9, fontWeight: 600, letterSpacing: '.35em', textTransform: 'uppercase' as const, color: '#A78BFA', marginBottom: 4 }}>
          Вчерашние сигналы · {YESTERDAY}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: f, fontWeight: 800, fontSize: 22, lineHeight: 1 }}>
            Нажми — <span style={{ color: '#A78BFA' }}>узнай результат</span>
          </div>
          <div style={{ fontFamily: mono, fontSize: 10, color: 'rgba(255,255,255,.35)' }}>
            €{betSize} / сигнал
          </div>
        </div>
      </div>


      {/* Cards list — dims when banner appears */}
      <div className="flex-1 overflow-y-auto px-5 pb-2" style={{
        scrollbarWidth: 'none',
        opacity: showBanner ? 0.45 : 1,
        transition: 'opacity .8s ease',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {CARDS.map((c, i) => {
            const isRevealed = revealed[i]
            return (
              <M.div key={i}
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: .04 * i }}
                whileTap={!isRevealed ? { scale: .97 } : {}}
                onClick={() => openCard(i)}
                style={{
                  position: 'relative', borderRadius: 16, overflow: 'hidden', height: 118,
                  cursor: isRevealed ? 'default' : 'pointer',
                }}
              >
                {/* Sport photo bg */}
                <img src={c.bg} alt="" style={{
                  position: 'absolute', inset: 0, width: '100%', height: '100%',
                  objectFit: 'cover', objectPosition: 'center',
                  filter: `brightness(${isRevealed ? .42 : .18}) saturate(${isRevealed ? .6 : .15}) contrast(1.1)`,
                  transition: 'filter .5s ease',
                }} />
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(90deg,rgba(4,2,13,.92) 0%,rgba(4,2,13,.6) 55%,rgba(4,2,13,.3) 100%)',
                }} />

                {/* Win/loss border */}
                {isRevealed && (
                  <M.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .4 }}
                    style={{
                      position: 'absolute', inset: 0, borderRadius: 16, pointerEvents: 'none',
                      boxShadow: `inset 0 0 0 1.5px ${c.win ? '#7EC88E' : '#E05C5C'}`,
                    }} />
                )}

                {/* Rarity badge — only on revealed cards */}
                {isRevealed && (
                <M.div
                  initial={{ opacity: 0, scale: .6 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: .2, type: 'spring', stiffness: 300 }}
                  style={{
                    position: 'absolute', top: 8, right: 10, zIndex: 3,
                    display: 'flex', alignItems: 'center', gap: 5,
                  }}>
                  <div style={{
                    width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                    background: RARITY[c.rarity].color,
                    boxShadow: `0 0 8px ${RARITY[c.rarity].color}, 0 0 14px ${RARITY[c.rarity].glow}`,
                  }} />
                  <span style={{
                    fontFamily: mono, fontSize: 9, fontWeight: 800,
                    letterSpacing: '.16em', color: RARITY[c.rarity].color,
                    textShadow: `0 0 10px ${RARITY[c.rarity].color}88`,
                  }}>{RARITY[c.rarity].label}</span>
                </M.div>
                )}

                {/* Tap hint pulse (only on locked cards) */}
                {!isRevealed && (
                  <M.div
                    animate={{ opacity: [.4, .8, .4] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{
                      position: 'absolute', inset: 0, borderRadius: 16, pointerEvents: 'none',
                      boxShadow: 'inset 0 0 0 1px rgba(167,139,250,.3)',
                    }} />
                )}

                {/* Content */}
                <div style={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', alignItems: 'center', padding: '0 14px', gap: 12 }}>

                  {/* Icon */}
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <img src={SPORT_ICONS[c.sport]} alt={c.sport} style={{
                      width: 52, height: 52, borderRadius: 12,
                      opacity: isRevealed ? 1 : 0.3,
                      transition: 'opacity .5s',
                    }} />
                    {!isRevealed && (
                      <div style={{
                        position: 'absolute', inset: 0, borderRadius: 12,
                        background: 'rgba(4,2,13,.55)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <img src={lockIcon} width={28} height={28} alt="locked" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {isRevealed ? (
                      <M.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .3 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                          <span style={{ fontFamily: mono, fontSize: 8, fontWeight: 600, letterSpacing: '.18em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,.38)' }}>{c.tag}</span>
                          <span style={{ fontFamily: mono, fontSize: 8, color: 'rgba(255,255,255,.2)' }}>·</span>
                          <span style={{ fontFamily: mono, fontSize: 8, color: 'rgba(255,255,255,.28)' }}>{c.date}</span>
                        </div>
                        <div style={{ fontFamily: f, fontWeight: 700, fontSize: 14, lineHeight: 1.15, marginBottom: 5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {c.home} <span style={{ color: 'rgba(255,255,255,.28)', fontWeight: 400 }}>vs</span> {c.away}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                          <span style={{ padding: '3px 8px', borderRadius: 5, background: 'rgba(167,139,250,.15)', border: '1px solid rgba(167,139,250,.25)', fontFamily: mono, fontSize: 10, fontWeight: 700, color: '#A78BFA' }}>{c.rec}</span>
                          <span style={{ fontFamily: f, fontWeight: 800, fontSize: 15 }}>{c.odds}</span>
                          <span style={{ fontFamily: mono, fontSize: 9, color: '#7EC88E' }}>{c.ev}</span>
                        </div>
                      </M.div>
                    ) : (
                      <div>
                        <div style={{ height: 7, width: '45%', borderRadius: 4, background: 'rgba(255,255,255,.07)', marginBottom: 8 }} />
                        <div style={{ height: 12, width: '75%', borderRadius: 4, background: 'rgba(255,255,255,.05)', marginBottom: 8 }} />
                        <div style={{ height: 7, width: '55%', borderRadius: 4, background: 'rgba(255,255,255,.04)' }} />
                      </div>
                    )}
                  </div>

                  {/* Result */}
                  {isRevealed ? (
                    <M.div
                      initial={{ scale: 0, rotate: -15 }} animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 18, delay: .1 }}
                      style={{
                        flexShrink: 0, width: 50, height: 50, borderRadius: 12,
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
                        background: c.win ? 'rgba(126,200,142,.18)' : 'rgba(224,92,92,.16)',
                        border: `1.5px solid ${c.win ? '#7EC88E' : '#E05C5C'}`,
                      }}>
                      <span style={{ fontSize: 18 }}>{c.win ? '✅' : '❌'}</span>
                      <span style={{ fontFamily: mono, fontSize: 8, fontWeight: 700, color: c.win ? '#7EC88E' : '#E05C5C' }}>
                        {c.win ? `+€${(betSize*(c.odds-1)).toFixed(0)}` : `-€${betSize}`}
                      </span>
                    </M.div>
                  ) : (
                    <M.button
                      onClick={() => openCard(i)}
                      whileTap={{ scale: .92 }}
                      className="glow-violet"
                      style={{
                        flexShrink: 0, width: 58, height: 50, borderRadius: 12,
                        background: 'linear-gradient(135deg, #2D1065, #4C1D95)',
                        border: '1px solid rgba(167,139,250,.4)',
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        justifyContent: 'center', gap: 3, cursor: 'pointer',
                      }}>
                      <img src={tapIcon} width={30} height={30} alt="" style={{ display: 'block' }} />
                      <span style={{ fontFamily: f, fontWeight: 700, fontSize: 8.5, color: '#C4B5FD', letterSpacing: '.06em', textTransform: 'uppercase' as const }}>Открыть</span>
                    </M.button>
                  )}
                </div>
              </M.div>
            )
          })}
        </div>
      </div>

      {/* Bottom */}
      <div className="flex-shrink-0 px-5 pb-6 pt-3">
        <AnimatePresence mode="wait">
          {showBanner && <ProfitBanner profit={profit} stake={stake} />}
        </AnimatePresence>

        {showBanner ? (
          <M.div key="cta-active"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: .2, type: 'spring', stiffness: 200 }}>
            <M.button
              whileTap={{ scale: .96 }}
              transition={{ type: 'spring', stiffness: 380, damping: 15 }}
              onClick={() => go('signal-cards')}
              style={{ position: 'relative', width: '100%', padding: '2px', borderRadius: 16,
                overflow: 'hidden', background: 'none', border: 'none', cursor: 'pointer', display: 'block' }}>
              {/* rotating plasma arc */}
              <span aria-hidden style={{
                position: 'absolute', top: '50%', left: '50%',
                width: '220%', height: '220%',
                transform: 'translate(-50%,-50%)',
                animation: 'card-cta-spin 2.8s linear infinite',
                background: 'conic-gradient(from 0deg,#04020D 0deg,#04020D 95deg,#5B21B6 140deg,#A78BFA 178deg,#DDD6FE 195deg,#A78BFA 212deg,#5B21B6 255deg,#04020D 300deg,#04020D 360deg)',
                pointerEvents: 'none',
              }} />
              {/* inner */}
              <span style={{ position: 'relative', display: 'flex', alignItems: 'stretch',
                borderRadius: 14, overflow: 'hidden', zIndex: 1,
                background: 'linear-gradient(115deg,#160528 0%,#2D1065 40%,#3B1578 70%,#1a0533 100%)' }}>
                <span aria-hidden style={{
                  position: 'absolute', inset: 0, pointerEvents: 'none',
                  background: 'linear-gradient(105deg,transparent 25%,rgba(255,255,255,.11) 45%,rgba(255,255,255,.22) 50%,rgba(255,255,255,.11) 55%,transparent 75%)',
                  animation: 'card-cta-shim 3.4s ease-in-out infinite',
                }} />
                <span aria-hidden style={{
                  position: 'absolute', top: 0, left: '6%', right: '6%', height: 1, pointerEvents: 'none',
                  background: 'linear-gradient(90deg,transparent,rgba(255,255,255,.5),transparent)',
                }} />
                <span style={{ flex: 1, padding: '20px 22px', position: 'relative', zIndex: 1,
                  fontFamily: f, fontWeight: 700, fontSize: 17, letterSpacing: '.025em', color: '#F5F3FF',
                  textShadow: '0 0 18px rgba(167,139,250,.45)' }}>
                  Смотреть сигналы сегодня
                </span>
                <span style={{ width: 58, flexShrink: 0, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 20, fontWeight: 700, color: 'rgba(245,243,255,.9)',
                  background: 'rgba(0,0,0,.22)', borderLeft: '1px solid rgba(167,139,250,.22)',
                  position: 'relative', zIndex: 1 }}>→</span>
              </span>
            </M.button>
            <style>{`
              @keyframes card-cta-spin { to { transform: translate(-50%,-50%) rotate(360deg) } }
              @keyframes card-cta-shim { 0%,42%{transform:translateX(-100%)} 62%,100%{transform:translateX(220%)} }
            `}</style>
          </M.div>
        ) : (
          <M.div
            key={allOpen ? 'counting' : 'hint'}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .3 }}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 8, padding: '17px', borderRadius: 14,
              background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)',
              fontFamily: mono, fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase' as const,
              color: 'rgba(255,255,255,.22)',
            }}>
            {allOpen ? (
              <>
                <M.span
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 0.7, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
                    background: '#A78BFA', boxShadow: '0 0 8px rgba(167,139,250,.8)' }}
                />
                Считаем результат…
              </>
            ) : (
              `Открой ещё ${5 - revealedCount} ${5 - revealedCount === 1 ? 'карточку' : 'карточки'} ↑`
            )}
          </M.div>
        )}
      </div>
    </M.div>
  )
}
