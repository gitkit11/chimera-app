/* eslint-disable @typescript-eslint/no-explicit-any */
import { motion } from 'framer-motion'
import { useFunnel } from '../store/funnel'
import { haptic } from '../haptic'
import bg from '../assets/cover_ai_bg.png'
import iconDark from '../assets/icon_dark2.png'

const M = motion as any
const f = "'Clash Display','Unbounded',sans-serif"

export default function Cover() {
  const go = useFunnel(s => s.go)

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: '#04020D' }}>
      {/* Фон — сгенерированная нейросеть (premium AI) */}
      <div className="absolute inset-0 z-0">
        <img src={bg} alt="" className="w-full h-full object-cover object-top"
          style={{ filter: 'brightness(.92) contrast(1.08) saturate(1.12)' }} />
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(180deg,rgba(4,2,13,.35) 0%,rgba(4,2,13,.05) 28%,rgba(4,2,13,.25) 48%,rgba(4,2,13,.9) 72%,rgba(4,2,13,.99) 100%)'
        }} />
      </div>

      {/* Контент. Верхний отступ учитывает вырез/статус-бар iPhone (fullscreen):
          env(safe-area) + инсет Telegram — раньше на айфоне логотип лип к краю. */}
      <div className="relative z-10 h-full flex flex-col px-[20px]"
        style={{ paddingTop: 'calc(env(safe-area-inset-top,0px) + var(--tg-safe-top,0px) + 16px)' }}>

        {/* Top bar */}
        <M.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .08, duration: .6 }}
          className="flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-[10px]">
            <div className="flex-shrink-0" style={{ width: 42, height: 42, position: 'relative' }}>
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
            className="inline-flex items-center gap-2 self-start px-3 py-[6px] rounded-full mb-4"
            style={{ background: 'rgba(124,58,237,.18)', border: '1px solid rgba(167,139,250,.4)' }}>
            <span style={{ fontSize: 12 }}>🤖</span>
            <span className="font-mono text-[9px] font-bold tracking-[.16em] uppercase" style={{ color: '#C4B5FD' }}>
              Первый AI‑беттинг
            </span>
          </M.div>

          {/* Заголовок */}
          <M.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .26, duration: .7 }}
            style={{
              fontSize: 'clamp(30px,9vw,42px)', fontFamily: f, fontWeight: 800,
              lineHeight: .98, letterSpacing: '-.01em', marginBottom: 12,
              background: 'linear-gradient(135deg,#EDE9FE 0%,#C4B5FD 30%,#A78BFA 62%,#7C3AED 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 26px rgba(167,139,250,.4))'
            }}>
            4 передовых ИИ<br />ставят вместе с тобой
          </M.h1>

          {/* Подзаголовок — компании */}
          <M.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .36, duration: .6 }}
            className="text-[13.5px] font-light leading-[1.5] mb-4 max-w-[300px]"
            style={{ color: 'rgba(250,250,248,.72)' }}>
            В основе — модели <b style={{ color: '#E9D5FF', fontWeight: 600 }}>Anthropic</b>,{' '}
            <b style={{ color: '#E9D5FF', fontWeight: 600 }}>OpenAI</b> и других лидеров + собственные
            агенты. Математика, а не догадки.
          </M.p>

          {/* Буллеты-доказательства */}
          <M.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .44, duration: .6 }}
            className="flex flex-col gap-[7px] mb-5">
            {[
              ['🧠', <>Обучен на <b style={{ color: '#F5F3FF' }}>80 000</b> матчах, 5 видов спорта</>],
              ['⚡', <><b style={{ color: '#F5F3FF' }}>10 000+</b> матчей уже проанализировано</>],
              ['🎯', <>В сигналы попадают <b style={{ color: '#F5F3FF' }}>единицы</b> — только сильнейшие</>],
            ].map(([ic, tx], i) => (
              <div key={i} className="flex items-center gap-[10px]">
                <span style={{ fontSize: 13, width: 18, textAlign: 'center' }}>{ic as any}</span>
                <span className="text-[12.5px] font-light" style={{ color: 'rgba(250,250,248,.7)' }}>{tx as any}</span>
              </div>
            ))}
          </M.div>

          {/* Stats */}
          <M.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .54, duration: .6 }}
            className="flex py-3"
            style={{ borderTop: '1px solid rgba(255,255,255,.09)', borderBottom: '1px solid rgba(255,255,255,.09)' }}>
            {[['+64%', 'Средний ROI', '#34D399'], ['80K', 'Матчей в базе', '#FAFAF8'], ['4', 'ИИ‑модели', '#A78BFA']].map(([v, l, col], i) => (
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
              fontFamily: f, fontWeight: 700, fontSize: 17, letterSpacing: '.025em', color: '#F5F3FF',
              textShadow: '0 0 18px rgba(167,139,250,.45)'
            }}>
              🎁 Забрать бесплатную ставку
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
