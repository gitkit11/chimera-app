/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useFunnel } from '../store/funnel'
import { haptic } from '../haptic'
import { api } from '../api'
import logoIcon from '../assets/icon_dark2.png'

const M  = motion as any
const MA = AnimatePresence as any
const f    = "'Clash Display','Unbounded',sans-serif"
const mono = "'JetBrains Mono',monospace"

type Msg = { id: number; from: 'user' | 'ai'; text: string; ts: string }

const WELCOME: Msg = {
  id: 0, from: 'ai',
  text: 'Привет! Я AI-ассистент Chimera 🦁 Спрашивай что угодно: что это за сервис, как получить доступ, как работают прогнозы, как пользоваться. Отвечу сразу.',
  ts: now(),
}

function now() {
  return new Date().toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })
}

function TypingDots() {
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center', padding: '4px 2px' }}>
      {[0, 1, 2].map(i => (
        <M.div key={i}
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: .6, repeat: Infinity, delay: i * .15, ease: 'easeInOut' }}
          style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(167,139,250,.6)' }} />
      ))}
    </div>
  )
}

export default function SupportChat() {
  const go = useFunnel(s => s.go)
  const [msgs, setMsgs] = useState<Msg[]>([WELCOME])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs, typing])

  const send = async () => {
    const text = input.trim()
    if (!text || typing) return
    const userMsg: Msg = { id: Date.now(), from: 'user', text, ts: now() }
    setMsgs(p => [...p, userMsg])
    setInput('')
    setTyping(true)
    try {
      const { answer } = await api.askSupport(text)
      setMsgs(p => [...p, {
        id: Date.now() + 1, from: 'ai',
        text: answer || 'Не смог ответить — попробуй ещё раз 🙌', ts: now(),
      }])
    } catch {
      setMsgs(p => [...p, {
        id: Date.now() + 1, from: 'ai',
        text: 'Связь прервалась. Попробуй ещё раз или загляни позже 🙌', ts: now(),
      }])
    } finally {
      setTyping(false)
    }
  }

  return (
    <M.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
      transition={{ duration: .26 }}
      style={{ height: '100%', display: 'flex', flexDirection: 'column',
        background: '#04020D', overflow: 'hidden', position: 'relative' }}>

      {/* Ambient */}
      <div style={{ position: 'absolute', top: 0, left: '30%',
        width: 280, height: 280, borderRadius: '50%', pointerEvents: 'none',
        background: 'radial-gradient(circle,rgba(139,92,246,.08) 0%,transparent 65%)',
        filter: 'blur(16px)' }} />

      {/* Header */}
      <div style={{ flexShrink: 0, padding: 'var(--header-top) 20px 14px',
        display: 'flex', alignItems: 'center', gap: 12,
        borderBottom: '1px solid rgba(255,255,255,.06)' }}>
        <M.button whileTap={{ scale: .9 }} onClick={() => { haptic('light'); go('support') }}
          style={{ width: 34, height: 34, borderRadius: 9, border: '1px solid rgba(255,255,255,.1)',
            background: 'rgba(255,255,255,.05)', cursor: 'pointer', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'rgba(255,255,255,.5)', fontSize: 16 }}>
          ←
        </M.button>

        {/* Avatar — Chimera logo */}
        <div style={{ position: 'relative' }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, position: 'relative',
            background: 'linear-gradient(135deg,#1C1F3A,#0D0525)',
            border: '1px solid rgba(167,139,250,.4)',
            boxShadow: '0 0 16px rgba(139,92,246,.3)', overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 62 62" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%',
              filter: 'drop-shadow(0 0 5px rgba(167,139,250,.5))' }}>
              <polygon points="2,6 60,6 31,58" style={{ fill: '#1C1F3A', stroke: 'rgba(167,139,250,.5)', strokeWidth: 1.5 }} />
            </svg>
            <img src={logoIcon} alt="" style={{ position: 'relative', zIndex: 1,
              width: '60%', height: '60%', objectFit: 'contain' }} />
          </div>
          <div style={{ position: 'absolute', bottom: -2, right: -2,
            width: 11, height: 11, borderRadius: '50%',
            background: '#A78BFA', border: '2px solid #04020D',
            boxShadow: '0 0 6px rgba(167,139,250,.7)' }} />
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: f, fontWeight: 800, fontSize: 15, lineHeight: 1 }}>
            Chimera <span style={{ color: '#A78BFA' }}>AI</span>
          </div>
          <div style={{ fontFamily: mono, fontSize: 8, color: 'rgba(167,139,250,.6)',
            letterSpacing: '.1em', marginTop: 3 }}>AI АССИСТЕНТ · ОНЛАЙН</div>
        </div>

        <div style={{ fontFamily: mono, fontSize: 7, fontWeight: 700, letterSpacing: '.12em',
          color: '#A78BFA', background: 'rgba(139,92,246,.15)',
          border: '1px solid rgba(167,139,250,.25)', padding: '3px 8px', borderRadius: 20 }}>
          AI
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none' as const,
        padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10,
        backgroundImage: `radial-gradient(ellipse at 50% 40%,rgba(76,29,149,.18) 0%,transparent 60%),
          radial-gradient(ellipse at 10% 80%,rgba(232,184,75,.07) 0%,transparent 45%),
          radial-gradient(ellipse at 90% 10%,rgba(109,40,217,.1) 0%,transparent 40%),
          url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Cpath d='M0 16h32M16 0v32' stroke='rgba(167,139,250,.03)' stroke-width='1'/%3E%3C/svg%3E")` }}>

        <MA>
          {msgs.map(msg => (
            <M.div key={msg.id}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: .2 }}
              style={{ display: 'flex', flexDirection: msg.from === 'user' ? 'row-reverse' : 'row',
                alignItems: 'flex-end', gap: 8 }}>

              {msg.from === 'ai' && (
                <div style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, position: 'relative',
                  background: 'linear-gradient(135deg,#1C1F3A,#0D0525)',
                  border: '1px solid rgba(167,139,250,.35)', overflow: 'hidden',
                  display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg viewBox="0 0 62 62" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%',
                    filter: 'drop-shadow(0 0 3px rgba(167,139,250,.4))' }}>
                    <polygon points="2,6 60,6 31,58" style={{ fill: '#1C1F3A', stroke: 'rgba(167,139,250,.45)', strokeWidth: 1.5 }} />
                  </svg>
                  <img src={logoIcon} alt="" style={{ position: 'relative', zIndex: 1, width: '58%', height: '58%', objectFit: 'contain' }} />
                </div>
              )}

              <div style={{ maxWidth: '75%' }}>
                <div style={{
                  padding: '10px 13px', borderRadius: msg.from === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                  background: msg.from === 'user'
                    ? 'linear-gradient(135deg,#5B21B6,#7C3AED)'
                    : 'rgba(255,255,255,.05)',
                  border: msg.from === 'user' ? 'none' : '1px solid rgba(255,255,255,.08)',
                  boxShadow: msg.from === 'user' ? '0 0 20px rgba(124,58,237,.3)' : 'none',
                }}>
                  <div style={{ fontSize: 13, lineHeight: 1.55,
                    color: msg.from === 'user' ? '#F5F3FF' : 'rgba(255,255,255,.7)',
                    fontFamily: 'sans-serif' }}>
                    {msg.text}
                  </div>
                </div>
                <div style={{ fontFamily: mono, fontSize: 7.5, color: 'rgba(255,255,255,.2)',
                  marginTop: 4, textAlign: msg.from === 'user' ? 'right' : 'left',
                  letterSpacing: '.04em' }}>
                  {msg.ts}
                </div>
              </div>
            </M.div>
          ))}
        </MA>

        {/* Typing indicator */}
        <MA>
          {typing && (
            <M.div key="typing"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }} transition={{ duration: .2 }}
              style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                background: 'rgba(139,92,246,.2)', border: '1px solid rgba(167,139,250,.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2a10 10 0 110 20A10 10 0 0112 2z" stroke="#A78BFA" strokeWidth="1.6"/>
                  <circle cx="9" cy="10" r="1" fill="#A78BFA"/>
                  <circle cx="15" cy="10" r="1" fill="#A78BFA"/>
                  <path d="M9 14s1-1.5 3-1.5 3 1.5 3 1.5" stroke="#A78BFA" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
              </div>
              <div style={{ padding: '10px 14px', borderRadius: '14px 14px 14px 4px',
                background: 'rgba(139,92,246,.08)', border: '1px solid rgba(167,139,250,.15)' }}>
                <TypingDots />
              </div>
            </M.div>
          )}
        </MA>

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ flexShrink: 0, padding: `10px 18px max(28px, calc(env(safe-area-inset-bottom,0px) + 16px))`,
        borderTop: '1px solid rgba(255,255,255,.06)',
        background: 'rgba(4,2,13,.98)', display: 'flex', gap: 10, alignItems: 'flex-end' }}>
        <input
          value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Написать сообщение..."
          style={{ flex: 1, padding: '12px 16px', borderRadius: 14,
            background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)',
            fontFamily: 'sans-serif', fontSize: 14, color: '#fff', outline: 'none',
            resize: 'none' as const }}
        />
        <M.button whileTap={{ scale: .9 }} onClick={() => { haptic('light'); send() }}
          style={{ width: 44, height: 44, borderRadius: 13, border: 'none',
            cursor: 'pointer', flexShrink: 0,
            background: input.trim()
              ? 'linear-gradient(135deg,#6D28D9,#7C3AED)'
              : 'rgba(255,255,255,.05)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: input.trim() ? '0 0 16px rgba(124,58,237,.4)' : 'none',
            transition: 'all .2s' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M22 2L11 13" stroke={input.trim() ? '#fff' : 'rgba(255,255,255,.2)'}
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M22 2L15 22l-4-9-9-4 20-7z"
              stroke={input.trim() ? '#fff' : 'rgba(255,255,255,.2)'}
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </M.button>
      </div>

      <style>{`input::placeholder{color:rgba(255,255,255,.2)}`}</style>
    </M.div>
  )
}
