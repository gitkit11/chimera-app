/* eslint-disable @typescript-eslint/no-explicit-any */
import { motion } from 'framer-motion'
import { useFunnel } from '../store/funnel'

const M = motion as any
const f = "'Clash Display','Unbounded',sans-serif"

const SPORT_DATA: Record<string, { tag: string; league: string; home: string; away: string; time: string; rec: string; odds: string; ev: string }> = {
  football: { tag: '⚽', league: 'Premier League', home: 'Manchester City', away: 'Arsenal',          time: '21:00 MSK', rec: 'П1 · Man City',  odds: '1.82', ev: '+14.3%' },
  tennis:   { tag: '🎾', league: 'ATP Masters 1000', home: 'N. Djokovic',   away: 'C. Alcaraz',       time: '18:30 MSK', rec: 'П1 · Djokovic',  odds: '1.65', ev: '+11.8%' },
  basket:   { tag: '🏀', league: 'NBA',              home: 'Boston Celtics', away: 'Denver Nuggets',  time: '02:30 MSK', rec: 'П1 −4.5',        odds: '1.91', ev: '+16.2%' },
  cs2:      { tag: '💻', league: 'ESL Pro League',   home: 'Natus Vincere',  away: 'G2 Esports',      time: '17:00 MSK', rec: 'П1 · NaVi',      odds: '1.74', ev: '+13.1%' },
  hockey:   { tag: '🏒', league: 'NHL Playoffs',     home: 'Colorado Av.',   away: 'Edmonton Oilers', time: '04:00 MSK', rec: 'ТМ 5.5',         odds: '1.88', ev: '+15.4%' },
}

const AGENTS = [
  { name: 'Статистик', vote: true },
  { name: 'Скаут',     vote: true },
  { name: 'Арбитр',    vote: true },
  { name: 'Shadow',    vote: true },
]

export default function Reconstruction() {
  const { stake, go } = useFunnel()
  const d = SPORT_DATA.football
  const kellyStake = Math.max(5, Math.round(stake * 0.09))

  return (
    <M.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      transition={{ duration: .4 }}
      className="h-full flex flex-col overflow-hidden"
      style={{ background: '#04020D' }}
    >
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-5 pb-3" style={{paddingTop:'var(--header-top)'}}>
        <div>
          <div className="font-mono text-[9px] font-semibold tracking-[.35em] uppercase mb-[3px]" style={{ color: '#A78BFA' }}>
            Chimera AI · Сегодня
          </div>
          <div style={{ fontFamily: f, fontWeight: 700, fontSize: 22, letterSpacing: '-.01em', lineHeight: 1 }}>
            Сигнал дня
          </div>
        </div>
        <div className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: '#18152A', border: '1px solid rgba(255,255,255,.08)' }}>
          <span style={{ fontSize: 15 }}>🔔</span>
        </div>
      </div>

      {/* Scroll area */}
      <div className="flex-1 overflow-y-auto px-5 pb-28" style={{ scrollbarWidth: 'none' }}>

        {/* Match card */}
        <M.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .12 }}
          className="rounded-[18px] p-5 mb-3"
          style={{ background: '#18152A', border: '1px solid rgba(255,255,255,.08)' }}>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-[6px] px-3 py-[5px] rounded-full"
              style={{ background: 'rgba(139,92,246,.15)', border: '1px solid rgba(139,92,246,.28)' }}>
              <span style={{ fontSize: 11 }}>{d.tag}</span>
              <span className="font-mono text-[9px] font-bold tracking-[.22em] uppercase" style={{ color: '#A78BFA' }}>
                {d.league}
              </span>
            </div>
            <span className="font-mono text-[10px]" style={{ color: 'rgba(255,255,255,.35)' }}>{d.time}</span>
          </div>

          {/* Teams */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1 text-right">
              <div style={{ fontFamily: f, fontWeight: 700, fontSize: 14, lineHeight: 1.25 }}>{d.home}</div>
            </div>
            <div className="font-mono font-bold text-[10px] px-2 flex-shrink-0"
              style={{ color: 'rgba(255,255,255,.25)', letterSpacing: '.1em' }}>VS</div>
            <div className="flex-1">
              <div style={{ fontFamily: f, fontWeight: 700, fontSize: 14, lineHeight: 1.25 }}>{d.away}</div>
            </div>
          </div>

          {/* Score + agents */}
          <div className="flex items-center justify-between pt-4"
            style={{ borderTop: '1px solid rgba(255,255,255,.07)' }}>
            <div>
              <div className="font-mono text-[8px] font-semibold tracking-[.28em] uppercase mb-[3px]"
                style={{ color: 'rgba(255,255,255,.38)' }}>Chimera Score</div>
              <div style={{
                fontFamily: f, fontWeight: 800, fontSize: 42, lineHeight: 1,
                background: 'linear-gradient(135deg,#EDE9FE,#A78BFA)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 0 14px rgba(167,139,250,.4))'
              }}>
                87<span style={{ fontSize: 16, fontWeight: 500, opacity: .6 }}>/100</span>
              </div>
            </div>

            <div className="flex flex-col gap-[5px]">
              {AGENTS.map((a, i) => (
                <div key={i} className="flex items-center gap-[7px]">
                  <div className="w-[15px] h-[15px] rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: a.vote ? 'rgba(126,200,142,.18)' : 'rgba(239,68,68,.18)',
                      border: `1px solid ${a.vote ? '#7EC88E' : '#EF4444'}`
                    }}>
                    <span style={{ fontSize: 7.5, color: a.vote ? '#7EC88E' : '#EF4444', fontWeight: 900, lineHeight: 1 }}>
                      {a.vote ? '✓' : '✗'}
                    </span>
                  </div>
                  <span className="font-mono text-[9px] font-medium tracking-[.1em]"
                    style={{ color: 'rgba(255,255,255,.48)' }}>{a.name}</span>
                </div>
              ))}
            </div>
          </div>
        </M.div>

        {/* Signal card — blurred/locked */}
        <M.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .24 }}
          className="rounded-[18px] overflow-hidden mb-3 relative"
          style={{ background: '#18152A', border: '1px solid rgba(255,255,255,.08)' }}>

          {/* Blurred content behind */}
          <div style={{ filter: 'blur(5px)', pointerEvents: 'none', userSelect: 'none' }} className="p-5">
            <div className="font-mono text-[8px] font-semibold tracking-[.3em] uppercase mb-3"
              style={{ color: '#A78BFA' }}>Рекомендация</div>
            <div style={{ fontFamily: f, fontWeight: 800, fontSize: 30, lineHeight: 1, marginBottom: 12 }}>
              {d.rec}
            </div>
            <div className="flex items-center gap-4 mb-4">
              {[['Коэффициент', d.odds, '#FAFAF8'], ['EV', d.ev, '#7EC88E'], ['Ставка', `€${kellyStake}`, '#FAFAF8']].map(([l, v, c], i) => (
                <div key={i} className="flex-1">
                  <div className="font-mono text-[8px] tracking-[.18em] uppercase mb-[3px]"
                    style={{ color: 'rgba(255,255,255,.38)' }}>{l}</div>
                  <div style={{ fontFamily: f, fontWeight: 700, fontSize: 20, color: c as string }}>{v}</div>
                </div>
              ))}
            </div>
            <div className="font-mono text-[10px]" style={{ color: 'rgba(255,255,255,.3)' }}>
              Kelly criterion · Bankroll protected
            </div>
          </div>

          {/* Lock overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center"
            style={{ background: 'linear-gradient(180deg,rgba(4,2,13,.2) 0%,rgba(4,2,13,.82) 35%,rgba(4,2,13,.96) 100%)' }}>
            <div className="w-11 h-11 rounded-full flex items-center justify-center mb-[10px]"
              style={{ background: 'rgba(139,92,246,.14)', border: '1px solid rgba(139,92,246,.32)' }}>
              <span style={{ fontSize: 20 }}>🔒</span>
            </div>
            <div style={{ fontFamily: f, fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
              Сигнал заблокирован
            </div>
            <div className="font-mono text-[10px] text-center px-6" style={{ color: 'rgba(255,255,255,.38)' }}>
              7 дней бесплатно — нет карты
            </div>
          </div>
        </M.div>

        {/* Stats row */}
        <M.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .34 }}
          className="rounded-[18px] p-4"
          style={{ background: '#18152A', border: '1px solid rgba(255,255,255,.08)' }}>
          <div className="font-mono text-[8px] font-semibold tracking-[.3em] uppercase mb-3"
            style={{ color: 'rgba(255,255,255,.32)' }}>Последние 30 дней</div>
          <div className="flex">
            {[['47', 'Сигналов'], ['68%', 'Точность'], ['+24%', 'ROI']].map(([v, l], i) => (
              <div key={i} className={`flex-1 ${i > 0 ? 'pl-3' : ''}`}
                style={i < 2 ? { borderRight: '1px solid rgba(255,255,255,.07)' } : {}}>
                <div style={{
                  fontFamily: f, fontWeight: 700, fontSize: 20, lineHeight: 1, marginBottom: 2,
                  color: l === 'ROI' ? '#7EC88E' : '#FAFAF8'
                }}>{v}</div>
                <div className="font-mono text-[8px] tracking-[.15em] uppercase"
                  style={{ color: 'rgba(255,255,255,.38)' }}>{l}</div>
              </div>
            ))}
          </div>
        </M.div>
      </div>

      {/* Sticky CTA */}
      <div className="absolute bottom-0 left-0 right-0 px-5 pt-5"
        style={{ background: 'linear-gradient(180deg,transparent 0%,rgba(4,2,13,.95) 28%,#04020D 100%)', paddingBottom:'max(28px, calc(env(safe-area-inset-bottom,0px) + 16px))' }}>
        <M.button
          whileTap={{ scale: .985 }}
          onClick={() => go('paywall')}
          className="w-full flex items-center justify-between rounded-[14px] overflow-hidden"
          style={{
            background: 'linear-gradient(135deg,#4C1D95 0%,#7C3AED 50%,#A78BFA 100%)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,.2),0 0 0 1px rgba(139,92,246,.35),0 14px 36px -8px rgba(109,40,217,.65)',
            border: 'none', cursor: 'pointer'
          }}>
          <span className="px-[22px] py-[19px]"
            style={{ fontFamily: f, fontWeight: 700, fontSize: 16, letterSpacing: '.02em', color: '#FAFAF8' }}>
            Открыть сигнал
          </span>
          <span className="w-[56px] flex items-center justify-center text-[18px] font-bold self-stretch"
            style={{ background: 'rgba(0,0,0,.18)', borderLeft: '1px solid rgba(255,255,255,.14)', color: '#FAFAF8' }}>
            →
          </span>
        </M.button>
      </div>
    </M.div>
  )
}
