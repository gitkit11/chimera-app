/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useFunnel } from '../store/funnel'
import logoIcon from '../assets/icon_dark2.png'

const M  = motion as any
const MA = AnimatePresence as any
const f    = "'Clash Display','Unbounded',sans-serif"
const mono = "'JetBrains Mono',monospace"

function getTgUser() {
  try { return (window as any).Telegram?.WebApp?.initDataUnsafe?.user ?? null }
  catch { return null }
}

const THEMES = [
  { key: 'void', label: 'VOID', bg: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80', accent: '#A78BFA', accent2: '#5B21B6' },
  { key: 'gold', label: 'GOLD', bg: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800&q=80', accent: '#FCD34D', accent2: '#B45309' },
  { key: 'city', label: 'CITY', bg: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80', accent: '#38BDF8', accent2: '#0369A1' },
  { key: 'noir', label: 'NOIR', bg: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80', accent: '#E2E8F0', accent2: '#64748B' },
]

const RANKS = [
  { min: 0,   label: 'NOVICE',  color: '#64748B' },
  { min: 200, label: 'HUNTER',  color: '#34D399' },
  { min: 500, label: 'EXPERT',  color: '#A78BFA' },
  { min: 800, label: 'CHIMERA', color: '#FBBF24' },
]

export default function ProfileScreen() {
  const go          = useFunnel(s => s.go)
  const isPro       = useFunnel(s => s.isPro)
  const proDaysLeft = useFunnel(s => s.proDaysLeft)
  const tgUser      = getTgUser()
  const [ti, setTi] = useState(0)
  const th = THEMES[ti]

  // Preload соседних тем при смене — не грузим все 4 сразу
  useEffect(() => {
    const next = THEMES[(ti + 1) % THEMES.length]
    const prev = THEMES[(ti - 1 + THEMES.length) % THEMES.length]
    ;[next, prev].forEach(t => { const i = new Image(); i.src = t.bg })
  }, [ti])

  const name     = tgUser
    ? ([tgUser.first_name ?? '', tgUser.last_name ?? ''].join(' ').trim() || 'Пользователь')
    : 'Пользователь'
  const uname    = tgUser?.username ? `@${tgUser.username}` : '@username'
  const rawId    = tgUser?.id ? String(tgUser.id) : null
  const score = isPro ? 420 : 85
  const rank  = [...RANKS].reverse().find(r => score >= r.min) ?? RANKS[0]
  const next  = RANKS.find(r => r.min > score)
  const pct   = next ? ((score - rank.min) / (next.min - rank.min)) * 100 : 100

  return (
    <div style={{ height: '100%', position: 'relative', background: '#04020D', overflow: 'hidden' }}>

      {/* Background photo — full screen */}
      <MA mode="wait">
        <M.img
          key={th.key} src={th.bg} alt=""
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1,  scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: .5, ease: 'easeOut' }}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: 'center',
            filter: 'brightness(.2) saturate(.35)' }}
        />
      </MA>

      {/* Gradients — same as signal card */}
      <div style={{ position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg,rgba(4,2,13,.65) 0%,rgba(4,2,13,.0) 20%,rgba(4,2,13,.0) 38%,rgba(4,2,13,.75) 60%,rgba(4,2,13,.99) 80%)' }} />
      <div style={{ position: 'absolute', inset: 0, transition: 'background .5s',
        background: `radial-gradient(ellipse 110% 45% at 50% 100%,${th.accent}1E 0%,transparent 65%)` }} />

      {/* TOP BAR */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
        padding: 'max(14px, calc(env(safe-area-inset-top, 0px) + 8px)) 16px 0',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <M.button whileTap={{ scale: .88 }} onClick={() => go('home')}
          style={{ width: 36, height: 36, borderRadius: 10, border: 'none', cursor: 'pointer',
            background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 17, color: 'rgba(255,255,255,.7)' }}>
          ←
        </M.button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5,
          padding: '4px 12px', borderRadius: 20,
          background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(10px)',
          border: `1px solid ${isPro ? th.accent + '50' : 'rgba(255,255,255,.13)'}` }}>
          {isPro && <svg width="8" height="8" viewBox="0 0 12 12" fill="none"><path d="M6 1l1.4 3.1L11 4.6 8.5 7l.6 3.5L6 9l-3.1 1.5L3.5 7 1 4.6l3.6-.5L6 1z" fill={th.accent}/></svg>}
          <span style={{ fontFamily: mono, fontSize: 8.5, fontWeight: 800, letterSpacing: '.14em',
            color: isPro ? th.accent : 'rgba(255,255,255,.35)' }}>
            {isPro ? `PRO · ${proDaysLeft} ДН` : 'FREE PLAN'}
          </span>
        </div>
      </div>

      {/* SCROLL CONTAINER — same pattern as signal card detail */}
      <div style={{ position: 'absolute', inset: 0, overflowY: 'auto', scrollbarWidth: 'none' as const }}>
        <div style={{ padding: '0 20px var(--scroll-bottom)', minHeight: '100%',
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>

          {/* ── Avatar + Name ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
            {/* Avatar with spin ring */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{ position: 'absolute', inset: -2, borderRadius: '50%',
                background: `conic-gradient(from 0deg,${th.accent2},${th.accent},rgba(255,255,255,.3),${th.accent},${th.accent2})`,
                animation: 'prof-spin 4s linear infinite',
                willChange: 'transform' }} />
              <div style={{ position: 'relative', width: 62, height: 62, borderRadius: '50%', zIndex: 1,
                background: `linear-gradient(135deg,${th.accent}28,${th.accent2}18)`,
                border: '2px solid rgba(4,2,13,.95)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {tgUser?.photo_url
                  ? <img src={tgUser.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : (
                    <div style={{ position: 'relative', width: '100%', height: '100%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {/* Glow blob behind logo */}
                      <div style={{ position: 'absolute', inset: 0, borderRadius: '50%',
                        background: `radial-gradient(circle,${th.accent}35 0%,transparent 70%)` }} />
                      {/* Triangle outline */}
                      <svg viewBox="0 0 62 62" style={{ position: 'absolute', inset: 0,
                        width: '100%', height: '100%',
                        filter: `drop-shadow(0 0 4px ${th.accent})`}}>
                        <polygon points="7,7 55,7 31,55"
                          style={{ fill: th.accent + '18', stroke: th.accent, strokeWidth: 1.8 }} />
                      </svg>
                      {/* Logo */}
                      <img src={logoIcon} alt="" style={{
                        position: 'relative', zIndex: 2,
                        width: '60%', height: '60%', objectFit: 'contain',
                        filter: `brightness(1.4) drop-shadow(0 0 10px ${th.accent}) drop-shadow(0 0 4px #fff8)`
                      }} />
                    </div>
                  )}
              </div>
            </div>
            {/* Text */}
            <div>
              <div style={{ fontFamily: f, fontWeight: 900,
                fontSize: 'clamp(20px,5.8vw,26px)', lineHeight: .92,
                color: '#fff', textShadow: '0 2px 10px rgba(0,0,0,.8)' }}>
                {name}
              </div>
              <div style={{ fontFamily: mono, fontSize: 10, color: `${th.accent}99`, marginTop: 5 }}>
                {uname}
              </div>
              {rawId && (
                <div style={{ fontFamily: mono, fontSize: 8, color: 'rgba(255,255,255,.2)',
                  marginTop: 2, letterSpacing: '.07em' }}>
                  ID · {rawId}
                </div>
              )}
            </div>
          </div>

          {/* ── Score + Rank (inline) ── */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 8 }}>
            <div>
              <div style={{ fontFamily: mono, fontSize: 7, letterSpacing: '.26em',
                color: 'rgba(255,255,255,.28)', marginBottom: 4 }}>CHIMERA SCORE</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontFamily: f, fontWeight: 900, fontSize: 44, lineHeight: .88,
                  background: `linear-gradient(135deg,#EDE9FE,${th.accent})`,
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {score}
                </span>
                <span style={{ fontFamily: mono, fontSize: 13, color: 'rgba(255,255,255,.22)' }}>/1000</span>
              </div>
            </div>
            <div style={{ padding: '4px 12px', borderRadius: 20, marginBottom: 4,
              background: `${rank.color}1E`, border: `1px solid ${rank.color}48`,
              fontFamily: mono, fontSize: 8.5, fontWeight: 900,
              color: rank.color, letterSpacing: '.16em',
              boxShadow: `0 0 14px ${rank.color}30` }}>
              {rank.label}
            </div>
          </div>

          {/* Rank progress */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <span style={{ fontFamily: mono, fontSize: 6.5, color: 'rgba(255,255,255,.18)', letterSpacing: '.12em' }}>
                {next ? `→ ${next.label}` : '★ MAX RANK'}
              </span>
              <span style={{ fontFamily: mono, fontSize: 6.5, color: `${rank.color}55` }}>
                {next ? `${score} / ${next.min}` : '⬥'}
              </span>
            </div>
            <div style={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,.08)', overflow: 'hidden' }}>
              <M.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                transition={{ duration: 1.4, ease: [.22, 1, .36, 1], delay: .3 }}
                style={{ height: '100%', borderRadius: 2,
                  background: `linear-gradient(90deg,${rank.color}66,${rank.color})`,
                  boxShadow: `0 0 8px ${rank.color}88` }} />
            </div>
          </div>

          {/* ── Stats 3-col ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 14 }}>
            {[
              { icon: '◎', label: 'Сигналы', val: '—' },
              { icon: '▲', label: 'Винрейт', val: '—' },
              { icon: isPro ? '★' : '○', label: isPro ? `PRO · ${proDaysLeft}д` : 'FREE план', val: isPro ? '✓' : '—', col: isPro ? th.accent : undefined },
            ].map((s, i) => (
              <div key={i} style={{ padding: '10px 10px 8px', borderRadius: 12,
                background: 'rgba(0,0,0,.62)',
                border: '1px solid rgba(255,255,255,.09)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,.05)' }}>
                <div style={{ fontFamily: mono, fontSize: 12, color: s.col ?? th.accent,
                  marginBottom: 4, lineHeight: 1 }}>{s.icon}</div>
                <div style={{ fontFamily: f, fontWeight: 900, fontSize: 18, lineHeight: 1,
                  color: '#fff', textShadow: '0 2px 6px rgba(0,0,0,.6)' }}>{s.val}</div>
                <div style={{ fontFamily: mono, fontSize: 6.5, color: 'rgba(255,255,255,.26)',
                  letterSpacing: '.06em', marginTop: 4, lineHeight: 1.3 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* ── Theme switcher ── */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontFamily: mono, fontSize: 7, letterSpacing: '.22em',
              color: 'rgba(255,255,255,.2)', marginBottom: 8 }}>ОБЛОЖКА</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {THEMES.map((th2, i) => (
                <M.button key={th2.key} whileTap={{ scale: .82 }} onClick={() => setTi(i)}
                  style={{ position: 'relative', width: 48, height: 48, borderRadius: 11,
                    overflow: 'hidden', cursor: 'pointer', border: 'none', padding: 0,
                    outline: i === ti ? `2px solid ${th2.accent}` : '2px solid transparent',
                    outlineOffset: 2,
                    boxShadow: i === ti ? `0 0 16px ${th2.accent}50` : 'none',
                    transition: 'all .28s ease' } as any}>
                  <img src={th2.bg} alt={th2.label}
                    style={{ width: '100%', height: '100%', objectFit: 'cover',
                      filter: `brightness(${i === ti ? .65 : .3}) saturate(.4)`,
                      transition: 'filter .28s ease' }} />
                  {i === ti && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex',
                      alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: 7, height: 7, borderRadius: '50%',
                        background: th2.accent, boxShadow: `0 0 8px ${th2.accent}` }} />
                    </div>
                  )}
                </M.button>
              ))}
            </div>
          </div>

          {/* ── Info rows — like signal stat lines ── */}
          <div style={{ borderRadius: 13, overflow: 'hidden',
            background: 'rgba(0,0,0,.60)',
            border: '1px solid rgba(255,255,255,.08)' }}>
            {[
              { label: 'Telegram',  value: uname },
              ...(rawId ? [{ label: 'ID', value: rawId }] : []),
              { label: 'Ранг',      value: rank.label, color: rank.color },
              { label: 'Статус',    value: isPro ? `PRO · ${proDaysLeft} дней` : 'FREE', color: isPro ? th.accent : undefined },
            ].map((r, i, arr) => (
              <div key={i} style={{ padding: '10px 14px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,.05)' : 'none' }}>
                <span style={{ fontFamily: mono, fontSize: 8, color: 'rgba(255,255,255,.26)',
                  letterSpacing: '.1em' }}>{r.label}</span>
                <span style={{ fontFamily: mono, fontSize: 9, fontWeight: 700,
                  color: (r as any).color ?? 'rgba(255,255,255,.55)',
                  letterSpacing: '.04em' }}>{r.value}</span>
              </div>
            ))}
          </div>

        </div>
      </div>

      <style>{`
        @keyframes prof-spin { to { transform: rotate(360deg); } }
        ::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  )
}
