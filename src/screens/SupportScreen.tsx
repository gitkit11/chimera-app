/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useFunnel } from '../store/funnel'

const M  = motion as any
const MA = AnimatePresence as any
const f    = "'Clash Display','Unbounded',sans-serif"
const mono = "'JetBrains Mono',monospace"

const MANAGER_URL = 'https://t.me/chimera_manager'

const FAQS = [
  {
    q: 'Как получить бесплатный PRO на 30 дней?',
    a: 'Зарегистрируйся на StawkiBet через раздел "Ставки" и внеси депозит от 30€. Это твой личный банк — деньги остаются твоими. После подтверждения активируем PRO в течение 24 часов.',
  },
  {
    q: 'Как работают сигналы Chimera AI?',
    a: 'Три ИИ-агента (Скаут, Статистик, Арбитр) анализируют каждый матч параллельно. Сигнал выходит только когда минимум 4 из 6 критериев совпадают. Четвёртый агент «Тень» даёт независимое второе мнение.',
  },
  {
    q: 'Как часто появляются новые сигналы?',
    a: 'Система сканирует матчи каждый час. В среднем 3–7 сигналов в день по всем видам спорта — только те, что прошли все фильтры качества.',
  },
  {
    q: 'PRO не активировался после депозита?',
    a: 'Убедись что ввёл правильный ID аккаунта StawkiBet при подаче заявки. Активация до 24 часов. Если прошло больше — напиши в живой чат, разберёмся быстро.',
  },
  {
    q: 'Можно ли вывести депозит с StawkiBet?',
    a: 'Да, в любой момент без ограничений. Депозит — твои деньги на счёте букмекера. Chimera AI получает партнёрское вознаграждение за регистрацию — твои средства нас не касаются.',
  },
]

export default function SupportScreen() {
  const go = useFunnel(s => s.go)
  const [openIdx, setOpenIdx] = useState<number | null>(null)

  return (
    <M.div
      initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
      transition={{ duration: .28 }}
      style={{ height: '100%', display: 'flex', flexDirection: 'column',
        background: '#04020D', overflow: 'visible', position: 'relative' }}>

      {/* Ambient glows */}
      <div style={{ position: 'absolute', top: '-8%', right: '-8%',
        width: 320, height: 320, borderRadius: '50%', pointerEvents: 'none',
        background: 'radial-gradient(circle,rgba(16,185,129,.13) 0%,transparent 65%)',
        filter: 'blur(48px)' }} />
      <div style={{ position: 'absolute', top: '35%', left: '-20%',
        width: 280, height: 280, borderRadius: '50%', pointerEvents: 'none',
        background: 'radial-gradient(circle,rgba(52,211,153,.09) 0%,transparent 65%)',
        filter: 'blur(40px)' }} />
      <div style={{ position: 'absolute', bottom: '10%', right: '10%',
        width: 200, height: 200, borderRadius: '50%', pointerEvents: 'none',
        background: 'radial-gradient(circle,rgba(6,95,70,.18) 0%,transparent 65%)',
        filter: 'blur(36px)' }} />

      {/* Header */}
      <div style={{ flexShrink: 0, padding: '52px 22px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
          <div style={{ width: 42, height: 42, borderRadius: 13,
            background: 'linear-gradient(135deg,rgba(52,211,153,.18),rgba(16,185,129,.08))',
            border: '1px solid rgba(52,211,153,.38)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 22px rgba(52,211,153,.2), inset 0 1px 0 rgba(52,211,153,.15)' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
              style={{ filter: 'drop-shadow(0 0 6px rgba(52,211,153,.6))' }}>
              <defs>
                <linearGradient id="suppHdrGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#6EE7B7"/>
                  <stop offset="100%" stopColor="#059669" stopOpacity=".7"/>
                </linearGradient>
              </defs>
              <path d="M20 3H4a2 2 0 00-2 2v10a2 2 0 002 2h4l4 4 4-4h4a2 2 0 002-2V5a2 2 0 00-2-2z"
                stroke="url(#suppHdrGrad)" strokeWidth="1.3" fill="rgba(5,150,105,.12)"
                strokeLinejoin="round"/>
              <path d="M13 6l-3 5h4l-3 5" stroke="#34D399" strokeWidth="1.6"
                strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <div style={{ fontFamily: f, fontWeight: 900, fontSize: 22, lineHeight: 1 }}>
              Поддержка
            </div>
            <div style={{ fontFamily: mono, fontSize: 8, color: 'rgba(255,255,255,.25)',
              letterSpacing: '.16em', marginTop: 3 }}>CHIMERA AI · ПОМОЩЬ</div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'linear-gradient(90deg,rgba(52,211,153,.35),rgba(16,185,129,.15),transparent)', marginTop: 14 }} />
      </div>

      {/* FAQ — scrollable */}
      <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none' as const,
        padding: '4px 22px 8px', display: 'flex', flexDirection: 'column', gap: 6 }}>

        <div style={{ fontFamily: mono, fontSize: 7.5, fontWeight: 700, letterSpacing: '.2em',
          textTransform: 'uppercase' as const, color: 'rgba(255,255,255,.22)', marginBottom: 4 }}>
          Частые вопросы
        </div>

        {FAQS.map((item, i) => (
          <M.div key={i} layout transition={{ duration: .2 }}
            style={{ borderRadius: 14, overflow: 'hidden',
              background: openIdx === i
                ? 'linear-gradient(135deg,rgba(139,92,246,.1),rgba(76,29,149,.06))'
                : 'rgba(255,255,255,.03)',
              border: `1px solid ${openIdx === i ? 'rgba(167,139,250,.28)' : 'rgba(255,255,255,.06)'}`,
              transition: 'background .2s, border-color .2s',
              boxShadow: openIdx === i ? '0 0 20px rgba(139,92,246,.08)' : 'none' }}>

            <div onClick={() => setOpenIdx(p => p === i ? null : i)}
              style={{ display: 'flex', alignItems: 'center', gap: 12,
                padding: '13px 14px', cursor: 'pointer' }}>
              <div style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                background: openIdx === i ? 'rgba(167,139,250,.2)' : 'rgba(255,255,255,.05)',
                border: `1px solid ${openIdx === i ? 'rgba(167,139,250,.4)' : 'rgba(255,255,255,.1)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: mono, fontSize: 8, fontWeight: 900,
                color: openIdx === i ? '#A78BFA' : 'rgba(255,255,255,.28)',
                transition: 'all .2s' }}>
                {i + 1}
              </div>
              <div style={{ flex: 1, fontFamily: f, fontWeight: 700, fontSize: 13,
                lineHeight: 1.25, color: openIdx === i ? '#fff' : 'rgba(255,255,255,.65)',
                transition: 'color .2s' }}>
                {item.q}
              </div>
              <M.div animate={{ rotate: openIdx === i ? 180 : 0 }} transition={{ duration: .2 }}
                style={{ flexShrink: 0, fontSize: 13,
                  color: openIdx === i ? '#A78BFA' : 'rgba(255,255,255,.2)' }}>
                ↓
              </M.div>
            </div>

            <MA>
              {openIdx === i && (
                <M.div key="ans"
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }} transition={{ duration: .2 }}>
                  <div style={{ padding: '0 14px 14px 48px', fontSize: 12,
                    color: 'rgba(255,255,255,.42)', lineHeight: 1.65, fontFamily: 'sans-serif',
                    borderTop: '1px solid rgba(167,139,250,.1)', paddingTop: 10 }}>
                    {item.a}
                  </div>
                </M.div>
              )}
            </MA>
          </M.div>
        ))}
      </div>

      {/* Bottom — fixed buttons */}
      <div style={{ flexShrink: 0, padding: '10px 22px 96px',
        background: 'transparent',
        display: 'flex', flexDirection: 'column', gap: 8 }}>

        <div style={{ fontFamily: mono, fontSize: 7.5, fontWeight: 700, letterSpacing: '.2em',
          textTransform: 'uppercase' as const, color: 'rgba(255,255,255,.2)', marginBottom: 2 }}>
          Связаться
        </div>

        <div style={{ display: 'flex', gap: 10 }}>

          {/* AI Chat — Robot card */}
          <M.div whileTap={{ scale: .95 }} onClick={() => go('support-chat')}
            style={{ flex: 1, borderRadius: 20, cursor: 'pointer', padding: 2,
              background: 'linear-gradient(135deg,#5B21B6,#7C3AED,#4C1D95)',
              boxShadow: '0 0 20px rgba(109,40,217,.3)' }}>
            <M.div
              animate={{ boxShadow: ['0 0 0px rgba(167,139,250,0)','0 0 18px rgba(167,139,250,.4)','0 0 0px rgba(167,139,250,0)'] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
              style={{ borderRadius: 18, padding: '18px 12px 14px',
                background: 'linear-gradient(160deg,#0e0520 0%,#150833 100%)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>

              {/* Robot illustration */}
              <div style={{ position: 'relative' }}>
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none"
                  style={{ filter: 'drop-shadow(0 0 8px rgba(167,139,250,.4))' }}>
                  {/* Antenna */}
                  <line x1="32" y1="5" x2="32" y2="13" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="32" cy="4" r="3" fill="#7C3AED"/>
                  <circle cx="32" cy="4" r="1.5" fill="#C4B5FD"/>
                  {/* Head */}
                  <rect x="11" y="13" width="42" height="28" rx="9" fill="rgba(109,40,217,.2)" stroke="#A78BFA" strokeWidth="1.4"/>
                  {/* Ear bolts */}
                  <rect x="6" y="23" width="5" height="10" rx="2.5" fill="rgba(109,40,217,.3)" stroke="rgba(167,139,250,.5)" strokeWidth="1"/>
                  <rect x="53" y="23" width="5" height="10" rx="2.5" fill="rgba(109,40,217,.3)" stroke="rgba(167,139,250,.5)" strokeWidth="1"/>
                  {/* Eye sockets */}
                  <circle cx="23" cy="26" r="6" fill="rgba(76,29,149,.6)" stroke="rgba(167,139,250,.4)" strokeWidth="1"/>
                  <circle cx="41" cy="26" r="6" fill="rgba(76,29,149,.6)" stroke="rgba(167,139,250,.4)" strokeWidth="1"/>
                  {/* Eye glow */}
                  <circle cx="23" cy="26" r="3.5" fill="#7C3AED"/>
                  <circle cx="41" cy="26" r="3.5" fill="#7C3AED"/>
                  <circle cx="23" cy="26" r="1.8" fill="#EDE9FE"/>
                  <circle cx="41" cy="26" r="1.8" fill="#EDE9FE"/>
                  {/* Mouth grid */}
                  <rect x="18" y="34" width="28" height="5" rx="2.5" fill="rgba(109,40,217,.4)" stroke="rgba(167,139,250,.35)" strokeWidth="1"/>
                  <circle cx="25" cy="36.5" r="1.2" fill="#A78BFA"/>
                  <circle cx="32" cy="36.5" r="1.2" fill="#A78BFA"/>
                  <circle cx="39" cy="36.5" r="1.2" fill="#A78BFA"/>
                  {/* Neck */}
                  <rect x="26" y="41" width="12" height="6" rx="3" fill="rgba(109,40,217,.25)" stroke="rgba(167,139,250,.3)" strokeWidth="1"/>
                  {/* Shoulders */}
                  <rect x="16" y="47" width="32" height="10" rx="5" fill="rgba(109,40,217,.15)" stroke="rgba(167,139,250,.2)" strokeWidth="1"/>
                  {/* Chest panel */}
                  <rect x="24" y="50" width="16" height="4" rx="2" fill="rgba(167,139,250,.15)"/>
                  <circle cx="28" cy="52" r="1" fill="rgba(167,139,250,.6)"/>
                  <circle cx="32" cy="52" r="1" fill="rgba(167,139,250,.6)"/>
                  <circle cx="36" cy="52" r="1" fill="rgba(167,139,250,.6)"/>
                </svg>
                {/* Animated eye pulse overlay */}
                <M.div
                  animate={{ opacity: [0, .6, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: .8 }}
                  style={{ position: 'absolute', top: 18, left: 12, width: 12, height: 12,
                    borderRadius: '50%', background: 'rgba(167,139,250,.4)',
                    filter: 'blur(4px)', pointerEvents: 'none' }} />
                <M.div
                  animate={{ opacity: [0, .6, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: .8 }}
                  style={{ position: 'absolute', top: 18, right: 12, width: 12, height: 12,
                    borderRadius: '50%', background: 'rgba(167,139,250,.4)',
                    filter: 'blur(4px)', pointerEvents: 'none' }} />
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: f, fontWeight: 900, fontSize: 13, color: '#EDE9FE', lineHeight: 1, marginBottom: 3 }}>AI Чат</div>
                <div style={{ fontSize: 10, color: 'rgba(196,181,253,.45)', fontFamily: 'sans-serif' }}>Chimera AI</div>
              </div>
            </M.div>
          </M.div>

          {/* Live support — Human + Heart card */}
          <M.a href={MANAGER_URL} target="_blank" rel="noreferrer" whileTap={{ scale: .95 }}
            style={{ flex: 1, borderRadius: 20, textDecoration: 'none', cursor: 'pointer',
              padding: 2,
              background: 'linear-gradient(135deg,#34D399,#10B981,#059669)',
              boxShadow: '0 0 16px rgba(52,211,153,.18)' }}>
            <div style={{ borderRadius: 18, padding: '18px 12px 14px',
              background: 'linear-gradient(160deg,#030f0b 0%,#071812 100%)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>

              {/* Human + Heart illustration */}
              <div style={{ position: 'relative', width: 64, height: 64 }}>
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none"
                  style={{ filter: 'drop-shadow(0 0 8px rgba(52,211,153,.35))' }}>
                  {/* Head */}
                  <circle cx="32" cy="16" r="10" fill="rgba(16,185,129,.15)" stroke="#34D399" strokeWidth="1.4"/>
                  {/* Hair hint */}
                  <path d="M22 13 Q32 6 42 13" stroke="#34D399" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
                  {/* Eyes */}
                  <circle cx="27.5" cy="14" r="1.8" fill="#34D399"/>
                  <circle cx="36.5" cy="14" r="1.8" fill="#34D399"/>
                  <circle cx="28" cy="13.5" r=".8" fill="rgba(4,2,13,.8)"/>
                  <circle cx="37" cy="13.5" r=".8" fill="rgba(4,2,13,.8)"/>
                  {/* Smile */}
                  <path d="M27 19 Q32 23 37 19" stroke="#34D399" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
                  {/* Neck */}
                  <rect x="28" y="26" width="8" height="5" rx="2" fill="rgba(16,185,129,.2)" stroke="rgba(52,211,153,.3)" strokeWidth="1"/>
                  {/* Body / torso */}
                  <path d="M14 58 Q14 42 32 40 Q50 42 50 58" fill="rgba(16,185,129,.1)" stroke="#34D399" strokeWidth="1.4"/>
                  {/* Arms */}
                  <path d="M14 44 Q8 50 10 56" stroke="#34D399" strokeWidth="1.4" strokeLinecap="round"/>
                  <path d="M50 44 Q56 50 54 56" stroke="#34D399" strokeWidth="1.4" strokeLinecap="round"/>
                  {/* Heart placeholder (will be animated) */}
                  <path d="M32 53 C32 53 26 47.5 26 44 C26 41.5 28 40 30 40 C31 40 32 41.5 32 41.5 C32 41.5 33 40 34 40 C36 40 38 41.5 38 44 C38 47.5 32 53 32 53Z"
                    fill="rgba(52,211,153,.12)" stroke="rgba(52,211,153,.3)" strokeWidth="1"/>
                </svg>
                {/* Animated beating heart overlay */}
                <M.div
                  animate={{ scale: [1, 1.22, 1, 1.12, 1] }}
                  transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut', times: [0, .2, .4, .6, 1] }}
                  style={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)',
                    pointerEvents: 'none' }}>
                  <svg width="22" height="20" viewBox="0 0 22 20" fill="none">
                    <path d="M11 18 C11 18 2 11.5 2 6 C2 3.2 4.2 1 7 1 C8.8 1 10.2 2 11 3.2 C11.8 2 13.2 1 15 1 C17.8 1 20 3.2 20 6 C20 11.5 11 18 11 18Z"
                      fill="#34D399" stroke="#6EE7B7" strokeWidth=".8"/>
                    <path d="M7 7 L9.5 9.5 L15 5" stroke="rgba(4,2,13,.5)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </M.div>
                {/* Heart glow pulse */}
                <M.div
                  animate={{ opacity: [0, .5, 0], scale: [.8, 1.4, .8] }}
                  transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ position: 'absolute', bottom: 8, left: '50%',
                    width: 22, height: 20, marginLeft: -11,
                    borderRadius: '50%', background: 'rgba(52,211,153,.3)',
                    filter: 'blur(6px)', pointerEvents: 'none' }} />
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: f, fontWeight: 900, fontSize: 13, color: '#6EE7B7', lineHeight: 1, marginBottom: 3 }}>Живой суппорт</div>
                <div style={{ fontSize: 10, color: 'rgba(110,231,183,.4)', fontFamily: 'sans-serif' }}>Ответим за час</div>
              </div>
            </div>
          </M.a>

        </div>

      </div>

      <style>{`
        ::-webkit-scrollbar { display: none; }
      `}</style>
    </M.div>
  )
}
