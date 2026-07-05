/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { api, type FunnelSignal } from '../api'
import { useFunnel } from '../store/funnel'
import { haptic } from '../haptic'
import footballIcon   from '../assets/icons/football.svg'
import basketballIcon from '../assets/icons/basketball.svg'
import tennisIcon     from '../assets/icons/tennis.svg'
import cs2Icon        from '../assets/icons/cs2.svg'
import hockeyIcon     from '../assets/icons/hockey.svg'
import lockIcon       from '../assets/icons/lock.svg'
import tapIcon        from '../assets/icons/tap.svg'
import lionIcon       from '../assets/agents/lion.svg'
import goatIcon       from '../assets/agents/goat.svg'
import snakeIcon      from '../assets/agents/snake.svg'
import shadowIcon     from '../assets/agents/shadow.svg'
import OnboardHint, { ExpandHint } from '../components/OnboardHint'

const M = motion as any
const f    = "'Clash Display','Unbounded',sans-serif"
const mono = "'JetBrains Mono',monospace"

const SPORT_ICONS: Record<string, string> = {
  football: footballIcon, basketball: basketballIcon,
  tennis: tennisIcon, cs2: cs2Icon, hockey: hockeyIcon,
}

const RARITY = {
  rare:    { label: 'RARE',    color: '#60A5FA' },
  epic:    { label: 'EPIC',    color: '#C084FC' },
  legend:  { label: 'LEGEND',  color: '#F97316' },
  chimera: { label: 'CHIMERA', color: '#EAB308' },
} as const
type RarityKey = keyof typeof RARITY

const SIGNALS = [
  { sport: 'football',   tag: 'La Liga',      home: 'Real Madrid', homeLogo: null as string|null, away: 'Barcelona',  awayLogo: null as string|null,
    rec: 'П1', odds: '2.10', ev: '+18%', score: 91, rarity: 'chimera' as RarityKey, date: '14 мая', time: '21:00',
    probs: [{ label: 'П1', pct: 64, color: '#A78BFA' }, { label: 'X', pct: 19, color: '#64748B' }, { label: 'П2', pct: 17, color: '#475569' }],
    stats: [{ l: 'xG', v: '2.3 — 1.1', hi: true }, { l: 'ELO', v: '+112' }, { l: 'Форма', v: 'WWDWW vs LWWDL' }],
    lineMove: { open: '2.25', curr: '2.10', delta: '-0.15', dir: 'down' as const, note: 'Шарп-деньги на П1' },
    bg: 'https://images.unsplash.com/photo-1522778034537-20a2486be803?w=800&q=80' },

  { sport: 'tennis',     tag: 'WTA Finals',   home: 'Swiatek',     homeLogo: null, away: 'Sabalenka',  awayLogo: null,
    rec: 'П1', odds: '1.72', ev: '+12%', score: 84, rarity: 'epic' as RarityKey, date: '14 мая', time: '18:30',
    probs: [{ label: 'П1', pct: 61, color: '#C084FC' }, { label: 'П2', pct: 39, color: '#475569' }],
    stats: [{ l: 'ELO', v: '+89', hi: true }, { l: 'H2H', v: '7-3' }, { l: 'Форма', v: 'WWWLW vs WLWWL' }],
    lineMove: { open: '1.80', curr: '1.72', delta: '-0.08', dir: 'down' as const, note: 'Стабильный приток' },
    bg: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800&q=80' },

  { sport: 'cs2',        tag: 'IEM Katowice', home: 'Vitality',    homeLogo: null, away: 'FaZe',       awayLogo: null,
    rec: 'П2', odds: '1.85', ev: '+15%', score: 78, rarity: 'legend' as RarityKey, date: '14 мая', time: '17:00',
    probs: [{ label: 'П1', pct: 44, color: '#475569' }, { label: 'П2', pct: 56, color: '#F97316' }],
    stats: [{ l: 'ELO FaZe', v: '+67', hi: true }, { l: 'Рейтинг', v: '#4 vs #7' }, { l: 'Форма', v: 'LWWWL vs WWLWW' }],
    lineMove: { open: '1.78', curr: '1.85', delta: '+0.07', dir: 'up' as const, note: 'Публика на Vitality' },
    bg: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80' },

  { sport: 'basketball', tag: 'NBA',          home: 'LA Lakers',   homeLogo: null, away: 'Miami Heat', awayLogo: null,
    rec: 'П1 +5.5', odds: '1.91', ev: '+17%', score: 82, rarity: 'rare' as RarityKey, date: '15 мая', time: '04:30',
    probs: [{ label: 'П1', pct: 58, color: '#60A5FA' }, { label: 'П2', pct: 42, color: '#475569' }],
    stats: [{ l: 'Темп LAL', v: '+3.8', hi: true }, { l: 'ATS', v: '6-2 Lakers' }, { l: 'Форма', v: 'WWLWW vs LWLWL' }],
    lineMove: { open: '2.00', curr: '1.91', delta: '-0.09', dir: 'down' as const, note: 'Деньги на фаворита' },
    bg: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80' },

  { sport: 'hockey',     tag: 'NHL Playoffs', home: 'Colorado',    homeLogo: null, away: 'Edmonton',   awayLogo: null,
    rec: 'ТМ 5.5', odds: '1.88', ev: '+15%', score: 79, rarity: 'epic' as RarityKey, date: '15 мая', time: '03:00',
    probs: [{ label: 'П1', pct: 52, color: '#C084FC' }, { label: 'П2', pct: 48, color: '#475569' }],
    stats: [{ l: 'Тотал ср.', v: '5.2 гола', hi: true }, { l: 'ELO', v: '+28' }, { l: 'Форма', v: 'WDWLW vs WWWLW' }],
    lineMove: { open: '1.92', curr: '1.88', delta: '-0.04', dir: 'down' as const, note: 'Небольшой интерес' },
    bg: 'https://images.unsplash.com/photo-1515703407324-5f753afd8be8?w=800&q=80' },
]

const AI_DATA = {
  agents: [
    { role: 'ST', name: 'Статистик', icon: lionIcon,  accent: '#F59E0B', text: 'xG 2.3 vs 1.1. ELO +112. Серия 8 побед дома.', verdict: false },
    { role: 'SC', name: 'Скаут',     icon: goatIcon,  accent: '#94A3B8', text: 'Барса без Педри. Мотивация Реала максимальная.', verdict: false },
    { role: 'AR', name: 'Арбитр',    icon: snakeIcon, accent: '#10B981', text: 'Рынок 54% / Chimera 72%. Дивергенция +18pp.', verdict: true },
  ],
  total:  { rec: 'ТБ 2.5', odds: '1.68', ev: '+9%', note: 'Обе забивали в 8 из 10 матчей' },
  shadow: 'Согласна по основному исходу. Тотал тоже интересен — высокий темп.',
}

// ── Team logo ─────────────────────────────────────────────────────────
function TeamLogo({ name, url, size = 44 }: { name: string, url: string|null, size?: number }) {
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  const colors   = ['#A78BFA','#06B6D4','#F97316','#10B981','#EAB308','#F472B6']
  const bg       = colors[name.charCodeAt(0) % colors.length]
  return (
    <div style={{ width: size, height: size, borderRadius: size * .28, flexShrink: 0, overflow: 'hidden',
      background: url ? 'transparent' : `${bg}22`, border: `1.5px solid ${bg}44`,
      display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {url ? <img src={url} alt={name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
           : <span style={{ fontFamily: f, fontWeight: 900, fontSize: size * .38, color: bg }}>{initials}</span>}
    </div>
  )
}

// ── Form pills ────────────────────────────────────────────────────────
function FormPills({ val }: { val: string }) {
  const parts = val.split(' vs ')
  const pills = (str: string, key: string) => (
    <div key={key} style={{ display: 'flex', gap: 3 }}>
      {str.split('').map((ch, i) => {
        const col = ch === 'W' ? '#10B981' : ch === 'L' ? '#EF4444' : '#64748B'
        return <div key={i} style={{ width: 16, height: 16, borderRadius: 4, background: `${col}22`, border: `1px solid ${col}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: mono, fontSize: 7.5, fontWeight: 800, color: col }}>{ch}</div>
      })}
    </div>
  )
  if (parts.length === 2) return <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>{pills(parts[0],'h')}{pills(parts[1],'a')}</div>
  return pills(val, 'v')
}

// ── Probability bars ──────────────────────────────────────────────────
function ProbBars({ probs }: { probs: { label: string, pct: number, color: string }[] }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
      {probs.map((p, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{ fontFamily: f, fontWeight: 900, fontSize: 13, color: p.color, lineHeight: 1, textShadow: `0 0 12px ${p.color}88` }}>{p.pct}%</div>
          <div style={{ width: 30, height: 52, borderRadius: 8, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.07)', display: 'flex', alignItems: 'flex-end', overflow: 'hidden', position: 'relative' }}>
            {[25,50,75].map(t => <div key={t} style={{ position: 'absolute', left: 0, right: 0, bottom: `${t}%`, height: 1, background: 'rgba(255,255,255,.06)' }} />)}
            <M.div initial={{ height: '0%' }} animate={{ height: `${p.pct}%` }}
              transition={{ duration: .7, delay: .2 + i * .1, ease: [.16,1,.3,1] }}
              style={{ width: '100%', borderRadius: 8, background: `linear-gradient(180deg,${p.color} 0%,${p.color}55 100%)`, boxShadow: `0 0 14px ${p.color}55`, position: 'relative' }}>
              <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: 2, borderRadius: 1, background: 'rgba(255,255,255,.35)' }} />
            </M.div>
          </div>
          <div style={{ fontFamily: mono, fontSize: 8.5, fontWeight: 800, color: 'rgba(255,255,255,.38)', letterSpacing: '.08em' }}>{p.label}</div>
        </div>
      ))}
    </div>
  )
}

// ── Line movement ─────────────────────────────────────────────────────
function LineMoveWidget({ lm }: { lm: { open: string, curr: string, delta: string, dir: 'up'|'down', note: string } }) {
  const good = lm.dir === 'down'
  const col  = good ? '#10B981' : '#F97316'
  const label = good ? 'Линия падает — шарпы на нашей стороне' : 'Линия растёт — публика против'
  return (
    <div style={{ borderRadius: 12, overflow: 'hidden', background: 'rgba(255,255,255,.04)', border: `1px solid ${col}33` }}>
      {/* Header strip */}
      <div style={{ padding: '8px 14px', background: `${col}15`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: col }} />
          <span style={{ fontFamily: mono, fontSize: 8.5, fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase' as const, color: col }}>Движение линии</span>
        </div>
        <span style={{ fontFamily: mono, fontSize: 8, color: 'rgba(255,255,255,.35)' }}>{lm.note}</span>
      </div>
      {/* Main row */}
      <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 0 }}>
        {/* Was */}
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: mono, fontSize: 8, color: 'rgba(255,255,255,.3)', marginBottom: 3, letterSpacing: '.1em' }}>БЫЛО</div>
          <div style={{ fontFamily: f, fontWeight: 700, fontSize: 18, color: 'rgba(255,255,255,.4)', textDecoration: 'line-through' }}>{lm.open}</div>
        </div>
        {/* Arrow */}
        <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '0 8px' }}>
          <span style={{ fontSize: 20, color: col }}>{good ? '↘' : '↗'}</span>
          <span style={{ fontFamily: f, fontWeight: 900, fontSize: 13, color: col }}>{lm.delta}</span>
        </div>
        {/* Now */}
        <div style={{ flex: 1, textAlign: 'right' }}>
          <div style={{ fontFamily: mono, fontSize: 8, color: col, marginBottom: 3, letterSpacing: '.1em', fontWeight: 700 }}>СЕЙЧАС</div>
          <div style={{ fontFamily: f, fontWeight: 900, fontSize: 24, color: col, lineHeight: 1 }}>{lm.curr}</div>
        </div>
      </div>
      {/* Signal meaning */}
      <div style={{ padding: '6px 14px 10px', fontFamily: mono, fontSize: 9, color: col, opacity: .7 }}>{label}</div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────
export default function SignalCards() {
  const go                 = useFunnel(s => s.go)
  const setFunnelSignalIdx = useFunnel(s => s.setFunnelSignalIdx)
  const [chosen,      setChosen]      = useState<number | null>(null)
  const [expanded,    setExpanded]    = useState(false)
  const [flipped,     setFlipped]     = useState(false)
  const [showExpHint, setShowExpHint] = useState(false)
  // Реальный бесплатный сигнал (банкер дня) — юзер должен открыть ставку,
  // которая реально зайдёт, а не декорацию
  const [realSig, setRealSig] = useState<FunnelSignal | null>(null)
  useEffect(() => {
    api.funnelSignal().then(s => { if (s && s.team1) setRealSig(s) }).catch(() => {})
  }, [])

  const pick = (i: number) => {
    if (chosen !== null && chosen !== i) return
    setChosen(i)
    setExpanded(true)
    setFlipped(false)
    setFunnelSignalIdx(i)
    // Сервер запоминает выбор: бот пришлёт пуш с исходом бесплатной ставки
    if (realSig)
      api.funnelPick(realSig.sport, realSig.team1, realSig.team2).catch(() => {})
    setTimeout(() => setShowExpHint(true), 1400)
  }
  const close = () => { setExpanded(false); setFlipped(false); setShowExpHint(false) }
  const flip  = () => { setShowExpHint(false); setFlipped(p => !p) }
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const base = chosen !== null ? SIGNALS[chosen] : null!
  // Открытая ячейка показывает РЕАЛЬНЫЙ сигнал (замер: пики prob>=75%
  // заходят в ~84% случаев) — визуальный каркас остаётся от макета
  const c = (chosen !== null && realSig) ? {
    ...base,
    sport: realSig.sport,
    tag:   realSig.league || base.tag,
    home:  realSig.team1,
    away:  realSig.team2,
    rec:   realSig.prediction,
    odds:  realSig.odds ? realSig.odds.toFixed(2) : base.odds,
    score: realSig.confidence || base.score,
    probs: [
      { label: realSig.prediction, pct: realSig.confidence || 60, color: '#A78BFA' },
      { label: 'Против', pct: 100 - (realSig.confidence || 60), color: '#475569' },
    ],
  } : base

  // ── DETAIL SCREEN ──────────────────────────────────────────────────────
  if (expanded && c) {
    return (
      <div style={{ height: '100%', position: 'relative', background: '#04020D', overflow: 'hidden' }}>
        {/* Background — always visible */}
        <img src={c.bg} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', filter: `brightness(${flipped ? .3 : .6}) saturate(.65)`, transition: 'filter .4s ease' }} />
        {!flipped && <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(4,2,13,.35) 0%,rgba(4,2,13,.02) 22%,rgba(4,2,13,.02) 44%,rgba(4,2,13,.65) 65%,rgba(4,2,13,.97) 86%)' }} />}
        {flipped && <div style={{ position: 'absolute', inset: 0, background: 'rgba(7,3,20,.88)' }} />}

<AnimatePresence mode="sync">
        {!flipped ? (
        <M.div key="front"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1  }}
          exit={{    opacity: 0  }}
          transition={{ duration: .12 }}
          style={{ position: 'absolute', inset: 0 }}>

        {/* FRONT content */}
        <div style={{ position: 'absolute', inset: 0 }}>

        {/* Top bar — рарність + кнопка */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 16px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(8px)' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: RARITY[c.rarity].color, boxShadow: `0 0 8px ${RARITY[c.rarity].color}` }} />
            <span style={{ fontFamily: mono, fontSize: 9.5, fontWeight: 800, letterSpacing: '.16em', color: RARITY[c.rarity].color }}>{RARITY[c.rarity].label}</span>
          </div>
          <M.button whileTap={{ scale: .88 }} onClick={() => { haptic('light'); close() }} style={{ width: 36, height: 36, borderRadius: 10, border: 'none', cursor: 'pointer', background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: 'rgba(255,255,255,.7)' }}>✕</M.button>
        </div>

        <ExpandHint visible={showExpHint} onDismiss={() => setShowExpHint(false)} />

        {/* FRONT scroll */}
        <div style={{ position: 'absolute', inset: 0, overflowY: 'auto', scrollbarWidth: 'none' as const, paddingBottom: 88 }}>
          <div style={{ padding: '52px 18px 0', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', minHeight: '100%' }}>

            {/* League + time — compact top */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <span style={{ fontFamily: mono, fontSize: 9, letterSpacing: '.18em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,.35)' }}>{c.tag}</span>
              <span style={{ fontFamily: mono, fontSize: 9, color: 'rgba(255,255,255,.2)' }}>·</span>
              <span style={{ fontFamily: mono, fontSize: 9, color: 'rgba(255,255,255,.28)' }}>{c.date}</span>
              <span style={{ fontFamily: mono, fontSize: 9, color: 'rgba(255,255,255,.2)' }}>·</span>
              <span style={{ fontFamily: mono, fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.65)', letterSpacing: '.04em' }}>{c.time}</span>
            </div>

            {/* Teams */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <TeamLogo name={c.home} url={c.homeLogo} size={42} />
              <div style={{ fontFamily: f, fontWeight: 900, fontSize: 'clamp(24px,7vw,32px)', lineHeight: .95 }}>{c.home}</div>
            </div>
            <div style={{ fontFamily: mono, fontSize: 10, fontWeight: 700, color: '#A78BFA', letterSpacing: '.12em', marginBottom: 6, paddingLeft: 52 }}>VS</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <TeamLogo name={c.away} url={c.awayLogo} size={42} />
              <div style={{ fontFamily: f, fontWeight: 900, fontSize: 'clamp(24px,7vw,32px)', lineHeight: .95, color: 'rgba(255,255,255,.5)' }}>{c.away}</div>
            </div>

            {/* ═══ СТАВКА — головне ═══ */}
            <div style={{ marginBottom: 10, padding: '12px 16px', borderRadius: 14,
              background: 'rgba(139,92,246,.2)', border: '1.5px solid rgba(167,139,250,.45)',
              boxShadow: '0 0 24px rgba(139,92,246,.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontFamily: mono, fontSize: 9.5, letterSpacing: '.22em', textTransform: 'uppercase' as const, color: '#A78BFA', marginBottom: 5, fontWeight: 700 }}>⬆ Ставить</div>
                <div style={{ fontFamily: f, fontWeight: 900, fontSize: 28, color: '#FFFFFF', lineHeight: 1,
                  textShadow: '0 0 20px rgba(167,139,250,.6), 0 0 40px rgba(139,92,246,.3)' }}>{c.rec}</div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: mono, fontSize: 9, letterSpacing: '.16em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,.55)', marginBottom: 3 }}>Коэф</div>
                  <div style={{ fontFamily: f, fontWeight: 900, fontSize: 20, color: '#FAFAF8' }}>{c.odds}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: mono, fontSize: 9, letterSpacing: '.16em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,.55)', marginBottom: 3 }}>EV</div>
                  <div style={{ fontFamily: f, fontWeight: 900, fontSize: 20, color: '#34D399' }}>{c.ev}</div>
                </div>
              </div>
            </div>

            {/* Лінія — компактна */}
            <div style={{ marginBottom: 10 }}><LineMoveWidget lm={c.lineMove} /></div>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 12 }}>
              <ProbBars probs={c.probs} />
              <div style={{ textAlign: 'right', paddingBottom: 4 }}>
                <div style={{ fontFamily: mono, fontSize: 8, letterSpacing: '.2em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,.28)', marginBottom: 3 }}>Chimera Score</div>
                <div style={{ fontFamily: f, fontWeight: 900, fontSize: 26, background: 'linear-gradient(135deg,#EDE9FE,#A78BFA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{c.score}<span style={{ fontSize: 12, opacity: .6 }}>/100</span></div>
              </div>
            </div>
            <div style={{ borderRadius: 12, overflow: 'hidden', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)' }}>
              {c.stats.map((s, si) => {
                const isForm = s.l === 'Форма'
                return (
                  <div key={si} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 14px', background: s.hi ? 'rgba(167,139,250,.06)' : 'transparent', borderBottom: si < c.stats.length - 1 ? '1px solid rgba(255,255,255,.05)' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {s.hi && <div style={{ width: 3, height: 12, borderRadius: 2, background: '#A78BFA', boxShadow: '0 0 6px rgba(167,139,250,.7)' }} />}
                      <span style={{ fontFamily: mono, fontSize: 9, letterSpacing: '.14em', textTransform: 'uppercase' as const, color: s.hi ? 'rgba(167,139,250,.8)' : 'rgba(255,255,255,.3)' }}>{s.l}</span>
                    </div>
                    {isForm
                      ? <div style={{ maxWidth: 180, overflow: 'hidden' }}><FormPills val={s.v} /></div>
                      : <span style={{ fontFamily: mono, fontSize: 11, fontWeight: 700, color: s.hi ? '#C4B5FD' : 'rgba(255,255,255,.75)' }}>{s.v}</span>}
                  </div>
                )
              })}
            </div>
          </div>{/* minHeight wrapper */}
        </div>{/* padding wrapper */}
        </div>{/* scroll container */}
        </M.div>
        ) : (
        <M.div key="back"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1  }}
          exit={{    opacity: 0  }}
          transition={{ duration: .12 }}
          style={{ position: 'absolute', inset: 0, overflow: 'hidden',
            background: 'linear-gradient(160deg,#0D0525 0%,#060D2A 45%,#030810 100%)' }}>
          {/* Top violet line */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,transparent,#A78BFA 40%,#C084FC,#A78BFA 60%,transparent)' }} />
          {/* Central glow */}
          <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle,rgba(167,139,250,.12) 0%,transparent 70%)', pointerEvents: 'none' }} />
          {/* Animal heads background — ONE set, subtle */}
          <div style={{ position: 'absolute', top: '4%', left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: .09, pointerEvents: 'none' }}>
            <img src={lionIcon} width={120} height={120} alt="" style={{ marginRight: -14 }} />
            <img src={goatIcon} width={120} height={120} alt="" style={{ marginTop: -10 }} />
            <img src={snakeIcon} width={120} height={120} alt="" style={{ marginLeft: -14 }} />
          </div>
          {/* Top bar */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 16px 0' }}>
            <div style={{ fontFamily: mono, fontSize: 9, fontWeight: 700, letterSpacing: '.22em', textTransform: 'uppercase' as const, color: '#A78BFA', padding: '4px 10px', borderRadius: 20, background: 'rgba(0,0,0,.4)', backdropFilter: 'blur(8px)' }}>◆ AI Разбор</div>
            <M.button whileTap={{ scale: .88 }} onClick={close} style={{ width: 36, height: 36, borderRadius: 10, border: 'none', cursor: 'pointer', background: 'rgba(0,0,0,.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: 'rgba(255,255,255,.7)' }}>✕</M.button>
          </div>
          {/* Match title */}
          <div style={{ position: 'absolute', top: 52, left: 16, right: 16, zIndex: 5 }}>
            <div style={{ fontFamily: mono, fontSize: 9, color: 'rgba(255,255,255,.35)', letterSpacing: '.12em' }}>{c.home} · vs · {c.away}</div>
          </div>
          {/* ═══ ORACLE SCREEN ═══ */}
          <div style={{ position: 'absolute', inset: 0, overflowY: 'auto', scrollbarWidth: 'none' as const, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 22px 108px', gap: 0 }}>

            {/* Score ring */}
            {/* Score ring — compact */}
            <M.div initial={{ scale: .7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: .1, type: 'spring', stiffness: 140 }}>
              <svg width="130" height="130" viewBox="0 0 130 130" style={{ overflow: 'visible' }}>
                <defs>
                  <linearGradient id="sArc" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#7C3AED"/><stop offset="100%" stopColor="#C084FC"/>
                  </linearGradient>
                  <filter id="sGlow"><feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#A78BFA" floodOpacity="0.7"/></filter>
                </defs>
                <circle cx="65" cy="65" r="52" fill="none" stroke="rgba(255,255,255,.07)" strokeWidth="6"/>
                <circle cx="65" cy="65" r="52" fill="none" stroke="url(#sArc)" strokeWidth="6"
                  strokeDasharray={`${(c.score/100)*327} 327`} strokeLinecap="round" transform="rotate(-90 65 65)" filter="url(#sGlow)"/>
                <circle cx="65" cy="65" r="40" fill="rgba(139,92,246,.06)"/>
                <text x="65" y="60" textAnchor="middle" fontFamily="'Clash Display','Unbounded',sans-serif" fontSize="34" fontWeight="900" fill="white">{c.score}</text>
                <text x="65" y="76" textAnchor="middle" fontFamily="monospace" fontSize="9" fill="rgba(255,255,255,.3)" letterSpacing="1">/100</text>
                <text x="65" y="90" textAnchor="middle" fontFamily="monospace" fontSize="7" fontWeight="700" fill="rgba(167,139,250,.55)" letterSpacing="2">CHIMERA SCORE</text>
              </svg>
            </M.div>

            {/* Agent icons — bigger with names */}
            <M.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .3 }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginTop: 10, marginBottom: 20 }}>
              {[...AI_DATA.agents, { icon: shadowIcon, accent: '#60A5FA', name: 'Shadow' }].map((a, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                  <div style={{ position: 'relative' }}>
                    <img src={a.icon} width={40} height={40} alt="" style={{ borderRadius: 10, boxShadow: `0 0 12px ${a.accent}66` }} />
                    <div style={{ position: 'absolute', bottom: -3, right: -3, width: 13, height: 13, borderRadius: '50%',
                      background: '#10B981', border: '2px solid #04020D', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 7, color: 'white', fontWeight: 900 }}>✓</div>
                  </div>
                  <span style={{ fontFamily: mono, fontSize: 7.5, color: `${a.accent}99`, letterSpacing: '.05em' }}>
                    {(a as any).name || (a as any).role}
                  </span>
                </div>
              ))}
            </M.div>

            <div style={{ width: '100%', height: 1, background: 'linear-gradient(90deg,transparent,rgba(167,139,250,.3),transparent)', marginBottom: 18 }} />

            {/* Verdict */}
            <M.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .45 }}
              style={{ width: '100%', textAlign: 'center', marginBottom: 16 }}>
              <div style={{ fontFamily: mono, fontSize: 8, fontWeight: 700, letterSpacing: '.3em', textTransform: 'uppercase' as const, color: 'rgba(167,139,250,.55)', marginBottom: 8 }}>Вердикт арбитра</div>
              <div style={{ fontFamily: f, fontWeight: 700, fontSize: 15, lineHeight: 1.45, color: '#FAFAF8' }}>
                {AI_DATA.agents.find(a => a.verdict)?.text}
              </div>
            </M.div>

            {/* Shadow */}
            <M.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .58 }}
              style={{ width: '100%', padding: '9px 13px', borderRadius: 11, borderLeft: '2px solid rgba(96,165,250,.45)',
                background: 'rgba(59,130,246,.06)', marginBottom: 12 }}>
              <div style={{ fontFamily: mono, fontSize: 7.5, color: 'rgba(96,165,250,.65)', letterSpacing: '.18em', textTransform: 'uppercase' as const, marginBottom: 4 }}>Shadow · Llama 70B</div>
              <div style={{ fontFamily: mono, fontSize: 10, color: 'rgba(255,255,255,.58)', lineHeight: 1.5 }}>{AI_DATA.shadow}</div>
            </M.div>

            {/* Alt bet */}
            <M.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .68 }}
              style={{ width: '100%', padding: '9px 14px', borderRadius: 11,
                background: 'rgba(16,185,129,.09)', border: '1px solid rgba(52,211,153,.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontFamily: mono, fontSize: 7, letterSpacing: '.2em', textTransform: 'uppercase' as const, color: 'rgba(52,211,153,.55)', marginBottom: 3 }}>Альт. ставка</div>
                <div style={{ fontFamily: f, fontWeight: 900, fontSize: 16, color: '#34D399' }}>{AI_DATA.total.rec}</div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                {[['КОЭФ', AI_DATA.total.odds, '#FAFAF8'], ['EV', AI_DATA.total.ev, '#34D399']].map(([l,v,col]) => (
                  <div key={l as string} style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: mono, fontSize: 7, color: 'rgba(255,255,255,.28)', marginBottom: 2 }}>{l}</div>
                    <div style={{ fontFamily: f, fontWeight: 800, fontSize: 15, color: col as string }}>{v}</div>
                  </div>
                ))}
              </div>
            </M.div>

          </div>
          {/* Back buttons */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10, padding: '14px 20px calc(34px + env(safe-area-inset-bottom, 0px))', background: 'linear-gradient(180deg,transparent,rgba(7,3,26,.98) 35%)' }}>
            <div style={{ display: 'flex', gap: 10 }}>
              <M.button whileTap={{ scale: .97 }} onClick={() => { haptic('light'); flip() }} style={{ flex: 1, height: 54, borderRadius: 16, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#2D1065,#5B21B6)', boxShadow: '0 0 0 1px rgba(139,92,246,.4)', fontFamily: f, fontWeight: 700, fontSize: 15, color: '#F5F3FF' }}>← К сигналу</M.button>
              <M.button whileTap={{ scale: .9 }} onClick={() => { haptic('light'); close() }} style={{ width: 54, height: 54, borderRadius: 16, border: '1px solid rgba(255,255,255,.1)', cursor: 'pointer', background: 'rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: 'rgba(255,255,255,.5)' }}>✕</M.button>
            </div>
          </div>
        </M.div>
        )}
        </AnimatePresence>

        {/* Front buttons */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10, padding: '14px 20px calc(34px + env(safe-area-inset-bottom, 0px))', background: 'linear-gradient(180deg,transparent,rgba(4,2,13,.96) 35%)', display: flipped ? 'none' : 'flex', gap: 10 }}>
          <M.button whileTap={{ scale: .9 }} onClick={() => { haptic('light'); close() }} style={{ width: 54, height: 54, borderRadius: 16, border: '1px solid rgba(255,255,255,.1)', cursor: 'pointer', background: 'rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: 'rgba(255,255,255,.5)' }}>←</M.button>
          <M.button whileTap={{ scale: .97 }} onClick={() => { haptic('medium'); flip() }} style={{ flex: 1, height: 54, padding: '2px', borderRadius: 16, overflow: 'hidden', background: 'none', border: 'none', cursor: 'pointer', position: 'relative', display: 'block' }}>
            <span aria-hidden style={{ position: 'absolute', top: '50%', left: '50%', width: '220%', height: '220%', transform: 'translate(-50%,-50%)', animation: 'sc-spin 2.8s linear infinite', background: 'conic-gradient(from 0deg,#04020D 0deg,#04020D 95deg,#5B21B6 140deg,#A78BFA 178deg,#DDD6FE 195deg,#A78BFA 212deg,#5B21B6 255deg,#04020D 300deg,#04020D 360deg)', pointerEvents: 'none' }} />
            <span style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', borderRadius: 14, zIndex: 1, background: 'linear-gradient(135deg,#160528 0%,#2D1065 45%,#3B1578 100%)', fontFamily: f, fontWeight: 700, fontSize: 15, letterSpacing: '.04em', color: '#F5F3FF' }}>
              <span aria-hidden style={{ position: 'absolute', inset: 0, borderRadius: 14, pointerEvents: 'none', background: 'linear-gradient(105deg,transparent 25%,rgba(255,255,255,.1) 45%,rgba(255,255,255,.2) 50%,rgba(255,255,255,.1) 55%,transparent 75%)', animation: 'sc-shim 3.2s ease-in-out infinite' }} />
              Разбор AI
            </span>
          </M.button>
        </div>

        <style>{`
          @keyframes sc-spin { to { transform: translate(-50%,-50%) rotate(360deg) } }
          @keyframes sc-shim { 0%,42%{transform:translateX(-100%)} 62%,100%{transform:translateX(220%)} }
        `}</style>
      </div>
    )
  }

  return (
    <div
      style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#04020D', position: 'relative' }}
    >
      <OnboardHint id="signal-cards" illustration="choose"
        title={"Вам доступен\n1 бесплатный сигнал"}
        sub="Выбери любую карточку и открой прогноз. Остальные разблокируются в Pro."
        action="Выбрать →" />

      {/* Header */}
      <div style={{ flexShrink: 0, padding: 'var(--header-top) 20px 14px' }}>
        <div style={{ fontFamily: mono, fontSize: 9, fontWeight: 600, letterSpacing: '.35em', textTransform: 'uppercase' as const, color: '#A78BFA', marginBottom: 6 }}>Chimera AI · Сегодня</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <div style={{ fontFamily: f, fontWeight: 800, fontSize: 22, lineHeight: 1 }}>
            {chosen === null ? <>Твой <span style={{ color: '#A78BFA' }}>прогноз</span></> : <>Прогноз <span style={{ color: '#A78BFA' }}>открыт</span></>}
          </div>
          {chosen === null ? (
            <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5,
              padding: '5px 10px', borderRadius: 20,
              background: 'rgba(167,139,250,.1)', border: '1px solid rgba(167,139,250,.25)' }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#A78BFA', boxShadow: '0 0 6px rgba(167,139,250,.9)' }} />
              <span style={{ fontFamily: mono, fontSize: 9, fontWeight: 600, color: 'rgba(167,139,250,.8)', letterSpacing: '.08em' }}>1 бесплатно</span>
            </div>
          ) : (
            <div style={{ flexShrink: 0, fontFamily: mono, fontSize: 10, color: 'rgba(255,255,255,.3)', padding: '5px 10px',
              borderRadius: 20, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)' }}>
              4 в Pro →
            </div>
          )}
        </div>
      </div>

      {/* Card list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 12px', scrollbarWidth: 'none' as const }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {SIGNALS.map((s, i) => {
            const isChosen = chosen === i
            return (
              <M.div key={i}
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: .05 * i }}
                whileTap={{ scale: .97 }}
                onClick={() => { haptic('medium'); isChosen ? setExpanded(true) : pick(i) }}
                style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', height: 118, cursor: (chosen !== null && !isChosen) ? 'default' : 'pointer' }}
              >
                <img src={s.bg} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: `brightness(${isChosen ? .42 : .18}) saturate(${isChosen ? .6 : .12})`, transition: 'filter .4s' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,rgba(4,2,13,.92) 0%,rgba(4,2,13,.6) 55%,rgba(4,2,13,.3) 100%)' }} />
                {isChosen && (
                  <>
                    <div style={{ position: 'absolute', inset: 0, borderRadius: 16, pointerEvents: 'none', boxShadow: `inset 0 0 0 1.5px ${RARITY[s.rarity].color}88` }} />
                    <M.div initial={{ opacity: 0, scale: .6 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 300 }}
                      style={{ position: 'absolute', top: 8, right: 10, zIndex: 3, display: 'flex', alignItems: 'center', gap: 5 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: RARITY[s.rarity].color, boxShadow: `0 0 8px ${RARITY[s.rarity].color}` }} />
                      <span style={{ fontFamily: mono, fontSize: 9, fontWeight: 800, letterSpacing: '.16em', color: RARITY[s.rarity].color }}>{RARITY[s.rarity].label}</span>
                    </M.div>
                  </>
                )}
                <div style={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', alignItems: 'center', padding: '0 14px', gap: 12 }}>
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <img src={SPORT_ICONS[s.sport]} alt="" style={{ width: 52, height: 52, borderRadius: 12, opacity: isChosen ? .85 : .3 }} />
                    {!isChosen && <div style={{ position: 'absolute', inset: 0, borderRadius: 12, background: 'rgba(4,2,13,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><img src={lockIcon} width={24} height={24} alt="" /></div>}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {isChosen ? (
                      <>
                        <div style={{ fontFamily: mono, fontSize: 8, color: 'rgba(255,255,255,.38)', letterSpacing: '.15em', marginBottom: 4 }}>{s.tag} · {s.date} · {s.time}</div>
                        <div style={{ fontFamily: f, fontWeight: 700, fontSize: 14, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {s.home} <span style={{ color: 'rgba(255,255,255,.3)', fontWeight: 400 }}>vs</span> {s.away}
                        </div>
                        <div style={{ fontFamily: mono, fontSize: 9, color: '#A78BFA', marginTop: 4 }}>{s.rec} · {s.odds} · {s.ev}</div>
                      </>
                    ) : (
                      <>
                        <div style={{ height: 7, width: '45%', borderRadius: 4, background: 'rgba(255,255,255,.07)', marginBottom: 8 }} />
                        <div style={{ height: 12, width: '78%', borderRadius: 4, background: 'rgba(255,255,255,.05)', marginBottom: 8 }} />
                        <div style={{ height: 7, width: '52%', borderRadius: 4, background: 'rgba(255,255,255,.04)' }} />
                      </>
                    )}
                  </div>
                  {chosen === null ? (
                    <div className="glow-violet"
                      style={{ flexShrink: 0, width: 56, height: 50, borderRadius: 12, background: 'linear-gradient(135deg,#2D1065,#4C1D95)', border: '1px solid rgba(167,139,250,.4)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
                      <img src={tapIcon} width={26} height={26} alt="" />
                      <span style={{ fontFamily: f, fontWeight: 700, fontSize: 8, color: '#C4B5FD', letterSpacing: '.06em', textTransform: 'uppercase' as const }}>Открыть</span>
                    </div>
                  ) : isChosen ? (
                    <div style={{ flexShrink: 0, width: 56, height: 50, borderRadius: 12, background: 'rgba(167,139,250,.12)', border: '1px solid rgba(167,139,250,.3)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
                      <span style={{ fontSize: 18 }}>↗</span>
                      <span style={{ fontFamily: mono, fontSize: 7.5, fontWeight: 700, color: '#A78BFA', letterSpacing: '.06em', textTransform: 'uppercase' as const }}>Смотреть</span>
                    </div>
                  ) : (
                    <div style={{ flexShrink: 0, width: 56, height: 50, borderRadius: 12, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
                      <img src={lockIcon} width={18} height={18} alt="" style={{ opacity: .4 }} />
                      <span style={{ fontFamily: mono, fontSize: 7.5, fontWeight: 700, color: 'rgba(255,255,255,.28)', letterSpacing: '.08em', textTransform: 'uppercase' as const }}>PRO</span>
                    </div>
                  )}
                </div>
              </M.div>
            )
          })}
        </div>
      </div>

      {/* CTA */}
      <div style={{ flexShrink: 0, padding: '10px 20px', paddingBottom: 'max(28px, calc(env(safe-area-inset-bottom, 0px) + 16px))', background: 'linear-gradient(180deg,transparent,rgba(4,2,13,.98) 28%)' }}>
        <M.button whileTap={{ scale: .96 }} onClick={() => { haptic('heavy'); go('paywall') }}
          style={{ position: 'relative', width: '100%', padding: '2px', borderRadius: 16, overflow: 'hidden', background: 'none', border: 'none', cursor: 'pointer', display: 'block' }}>
          <span aria-hidden style={{ position: 'absolute', top: '50%', left: '50%', width: '220%', height: '220%', transform: 'translate(-50%,-50%)', animation: 'sc-spin 2.8s linear infinite', background: 'conic-gradient(from 0deg,#04020D 0deg,#04020D 95deg,#5B21B6 140deg,#A78BFA 178deg,#DDD6FE 195deg,#A78BFA 212deg,#5B21B6 255deg,#04020D 300deg,#04020D 360deg)', pointerEvents: 'none' }} />
          <span style={{ position: 'relative', display: 'flex', alignItems: 'stretch', borderRadius: 14, overflow: 'hidden', zIndex: 1, background: 'linear-gradient(115deg,#160528 0%,#2D1065 40%,#3B1578 70%,#1a0533 100%)' }}>
            <span aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'linear-gradient(105deg,transparent 25%,rgba(255,255,255,.11) 45%,rgba(255,255,255,.22) 50%,rgba(255,255,255,.11) 55%,transparent 75%)', animation: 'sc-shim 3.4s ease-in-out infinite' }} />
            <span style={{ flex: 1, padding: '19px 22px', position: 'relative', zIndex: 1, fontFamily: f, fontWeight: 700, fontSize: 16, letterSpacing: '.025em', color: '#F5F3FF' }}>Открыть все сигналы</span>
            <span style={{ width: 56, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19, fontWeight: 700, color: 'rgba(245,243,255,.9)', background: 'rgba(0,0,0,.22)', borderLeft: '1px solid rgba(167,139,250,.22)', position: 'relative', zIndex: 1 }}>→</span>
          </span>
        </M.button>
      </div>

      {/* dead code removed */}
      {false && (
          <div>
            {/* Photo */}
            {/* Always show a purple tint so screen is never pure black */}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,#120228 0%,#0a1428 100%)' }} />
            <img src={c.bg} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', filter: 'brightness(.7) saturate(.7)', display: flipped ? 'none' : 'block' }} />
            {!flipped && <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(4,2,13,.3) 0%,rgba(4,2,13,.0) 22%,rgba(4,2,13,.0) 44%,rgba(4,2,13,.65) 66%,rgba(4,2,13,.97) 86%)' }} />}

            {/* Top bar */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '52px 20px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: RARITY[c.rarity].color, boxShadow: `0 0 10px ${RARITY[c.rarity].color}` }} />
                <span style={{ fontFamily: mono, fontSize: 10, fontWeight: 800, letterSpacing: '.16em', color: RARITY[c.rarity].color }}>{RARITY[c.rarity].label}</span>
              </div>
              <M.button whileTap={{ scale: .88 }} onClick={close} style={{ width: 38, height: 38, borderRadius: 10, border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: 'rgba(255,255,255,.6)' }}>✕</M.button>
            </div>

            <ExpandHint visible={showExpHint} onDismiss={() => setShowExpHint(false)} />

            {/* FRONT */}
            {!flipped && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '80px 22px 120px', overflowY: 'auto', scrollbarWidth: 'none' as const }}>
                {/* Date/time */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <span style={{ fontFamily: mono, fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,.38)' }}>{c.tag}</span>
                  <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,.2)' }} />
                  <span style={{ fontFamily: mono, fontSize: 9, color: 'rgba(255,255,255,.28)' }}>{c.date}</span>
                  <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,.2)' }} />
                  <span style={{ fontFamily: mono, fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.6)' }}>{c.time}</span>
                </div>
                {/* Teams */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <TeamLogo name={c.home} url={c.homeLogo} size={48} />
                  <div style={{ fontFamily: f, fontWeight: 900, fontSize: 'clamp(26px,7.5vw,34px)', lineHeight: .95 }}>{c.home}</div>
                </div>
                <div style={{ fontFamily: mono, fontSize: 11, fontWeight: 700, color: '#A78BFA', letterSpacing: '.15em', marginBottom: 8, paddingLeft: 60 }}>VS</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                  <TeamLogo name={c.away} url={c.awayLogo} size={48} />
                  <div style={{ fontFamily: f, fontWeight: 900, fontSize: 'clamp(26px,7.5vw,34px)', lineHeight: .95, color: 'rgba(255,255,255,.5)' }}>{c.away}</div>
                </div>
                {/* Metrics */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  {[
                    { l: 'Ставка', v: c.rec,  col: '#A78BFA', bg: 'rgba(139,92,246,.15)', bd: 'rgba(139,92,246,.3)', grow: true  },
                    { l: 'Коэф',   v: c.odds, col: '#FAFAF8', bg: 'rgba(255,255,255,.07)', bd: 'rgba(255,255,255,.1)', grow: false },
                    { l: 'EV',     v: c.ev,   col: '#34D399', bg: 'rgba(52,211,153,.1)',   bd: 'rgba(52,211,153,.25)', grow: false },
                  ].map(({ l, v, col, bg, bd, grow }) => (
                    <div key={l} style={{ ...(grow ? { flex: 1 } : {}), padding: '9px 12px', borderRadius: 12, background: bg, border: `1px solid ${bd}` }}>
                      <div style={{ fontFamily: mono, fontSize: 7.5, letterSpacing: '.2em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,.35)', marginBottom: 3 }}>{l}</div>
                      <div style={{ fontFamily: f, fontWeight: 900, fontSize: 18, color: col }}>{v}</div>
                    </div>
                  ))}
                </div>
                {/* Line movement */}
                <div style={{ marginBottom: 12 }}><LineMoveWidget lm={c.lineMove} /></div>
                {/* Probs + Score */}
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 12 }}>
                  <ProbBars probs={c.probs} />
                  <div style={{ textAlign: 'right', paddingBottom: 4 }}>
                    <div style={{ fontFamily: mono, fontSize: 8, letterSpacing: '.2em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,.28)', marginBottom: 3 }}>Chimera Score</div>
                    <div style={{ fontFamily: f, fontWeight: 900, fontSize: 26, background: 'linear-gradient(135deg,#EDE9FE,#A78BFA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{c.score}<span style={{ fontSize: 12, opacity: .6 }}>/100</span></div>
                  </div>
                </div>
                {/* Stat lines */}
                <div style={{ borderRadius: 12, overflow: 'hidden', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)' }}>
                  {c.stats.map((s, si) => {
                    const isForm = s.l === 'Форма'
                    return (
                      <div key={si} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 14px', background: s.hi ? 'rgba(167,139,250,.06)' : 'transparent', borderBottom: si < c.stats.length - 1 ? '1px solid rgba(255,255,255,.05)' : 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {s.hi && <div style={{ width: 3, height: 12, borderRadius: 2, background: '#A78BFA', boxShadow: '0 0 6px rgba(167,139,250,.7)' }} />}
                          <span style={{ fontFamily: mono, fontSize: 9, letterSpacing: '.14em', textTransform: 'uppercase' as const, color: s.hi ? 'rgba(167,139,250,.8)' : 'rgba(255,255,255,.3)' }}>{s.l}</span>
                        </div>
                        {isForm ? <FormPills val={s.v} /> : <span style={{ fontFamily: mono, fontSize: 11, fontWeight: 700, color: s.hi ? '#C4B5FD' : 'rgba(255,255,255,.75)', textShadow: s.hi ? '0 0 10px rgba(167,139,250,.5)' : 'none' }}>{s.v}</span>}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* BACK — AI */}
            {flipped && (
              <div style={{ position: 'absolute', inset: 0, overflowY: 'auto', scrollbarWidth: 'none' as const, padding: '84px 20px 120px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ position: 'absolute', top: '8%', left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: .07, pointerEvents: 'none' }}>
                  <img src={lionIcon} width={140} height={140} alt="" style={{ marginRight: -20 }} />
                  <img src={goatIcon} width={140} height={140} alt="" style={{ marginTop: -14 }} />
                  <img src={snakeIcon} width={140} height={140} alt="" style={{ marginLeft: -20 }} />
                </div>
                <div style={{ fontFamily: mono, fontSize: 10, fontWeight: 700, letterSpacing: '.28em', textTransform: 'uppercase' as const, color: '#A78BFA', position: 'relative' }}>◆ AI Разбор · {c.home} vs {c.away}</div>
                {AI_DATA.agents.map((a, ai) => (
                  <div key={ai} style={{ padding: '12px 14px', borderRadius: 14, background: a.verdict ? 'rgba(167,139,250,.1)' : 'rgba(255,255,255,.04)', border: `1px solid ${a.verdict ? 'rgba(167,139,250,.38)' : 'rgba(255,255,255,.07)'}`, position: 'relative' }}>
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
                <div style={{ padding: '12px 14px', borderRadius: 14, background: 'rgba(52,211,153,.08)', border: '1px solid rgba(52,211,153,.22)', position: 'relative' }}>
                  <div style={{ fontFamily: mono, fontSize: 8, letterSpacing: '.2em', textTransform: 'uppercase' as const, color: 'rgba(52,211,153,.65)', marginBottom: 6 }}>Альт. ставка · Тотал</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <span style={{ fontFamily: f, fontWeight: 900, fontSize: 17, color: '#34D399' }}>{AI_DATA.total.rec}</span>
                    <span style={{ fontFamily: f, fontWeight: 700, fontSize: 16 }}>@ {AI_DATA.total.odds}</span>
                    <span style={{ fontFamily: mono, fontSize: 10, color: '#34D399' }}>{AI_DATA.total.ev}</span>
                  </div>
                  <div style={{ fontFamily: mono, fontSize: 10, color: 'rgba(255,255,255,.38)' }}>{AI_DATA.total.note}</div>
                </div>
                <div style={{ padding: '10px 14px', borderRadius: 12, borderLeft: '2px solid #6B89AB', background: 'rgba(58,79,107,.12)', position: 'relative' }}>
                  <div style={{ fontFamily: mono, fontSize: 8, color: '#8FA8C2', letterSpacing: '.2em', textTransform: 'uppercase' as const, marginBottom: 4 }}>Shadow (Llama 70B)</div>
                  <div style={{ fontFamily: mono, fontSize: 11, color: 'rgba(255,255,255,.6)', lineHeight: 1.5 }}>{AI_DATA.shadow}</div>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10, padding: '14px 20px calc(34px + env(safe-area-inset-bottom, 0px))', background: 'linear-gradient(180deg,transparent,rgba(4,2,13,.96) 35%)' }}>
              <div style={{ display: 'flex', gap: 10 }}>
                {!flipped ? (
                  <>
                    <M.button whileTap={{ scale: .9 }} onClick={() => { haptic('light'); close() }} style={{ width: 54, height: 54, borderRadius: 16, border: '1px solid rgba(255,255,255,.1)', cursor: 'pointer', background: 'rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: 'rgba(255,255,255,.5)' }}>←</M.button>
                    <M.button whileTap={{ scale: .97 }} onClick={() => { haptic('medium'); flip() }} style={{ flex: 1, height: 54, padding: '2px', borderRadius: 16, overflow: 'hidden', background: 'none', border: 'none', cursor: 'pointer', position: 'relative', display: 'block' }}>
                      <span aria-hidden style={{ position: 'absolute', top: '50%', left: '50%', width: '220%', height: '220%', transform: 'translate(-50%,-50%)', animation: 'sc-spin 2.8s linear infinite', background: 'conic-gradient(from 0deg,#04020D 0deg,#04020D 95deg,#5B21B6 140deg,#A78BFA 178deg,#DDD6FE 195deg,#A78BFA 212deg,#5B21B6 255deg,#04020D 300deg,#04020D 360deg)', pointerEvents: 'none' }} />
                      <span style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', borderRadius: 14, zIndex: 1, background: 'linear-gradient(135deg,#160528 0%,#2D1065 45%,#3B1578 100%)', fontFamily: f, fontWeight: 700, fontSize: 15, letterSpacing: '.04em', color: '#F5F3FF' }}>
                        <span aria-hidden style={{ position: 'absolute', inset: 0, borderRadius: 14, pointerEvents: 'none', background: 'linear-gradient(105deg,transparent 25%,rgba(255,255,255,.1) 45%,rgba(255,255,255,.2) 50%,rgba(255,255,255,.1) 55%,transparent 75%)', animation: 'sc-shim 3.2s ease-in-out infinite' }} />
                        Разбор AI
                      </span>
                    </M.button>
                  </>
                ) : (
                  <>
                    <M.button whileTap={{ scale: .97 }} onClick={() => { haptic('light'); flip() }} style={{ flex: 1, height: 54, borderRadius: 16, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#2D1065,#5B21B6)', boxShadow: '0 0 0 1px rgba(139,92,246,.4)', fontFamily: f, fontWeight: 700, fontSize: 15, letterSpacing: '.03em', color: '#F5F3FF' }}>← К сигналу</M.button>
                    <M.button whileTap={{ scale: .9 }} onClick={() => { haptic('light'); close() }} style={{ width: 54, height: 54, borderRadius: 16, border: '1px solid rgba(255,255,255,.1)', cursor: 'pointer', background: 'rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: 'rgba(255,255,255,.5)' }}>✕</M.button>
                  </>
                )}
              </div>
            </div>
          </div>
      )}

      <style>{`
        @keyframes sc-spin { to { transform: translate(-50%,-50%) rotate(360deg) } }
        @keyframes sc-shim { 0%,42%{transform:translateX(-100%)} 62%,100%{transform:translateX(220%)} }
      `}</style>
    </div>
  )
}
