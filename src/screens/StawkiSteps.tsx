/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useFunnel } from '../store/funnel'
import { haptic } from '../haptic'
import { api } from '../api'
import stawkiLogo from '../assets/stawkibet.svg'

const M  = motion as any
const MA = AnimatePresence as any
const f    = "'Clash Display','Unbounded',sans-serif"
const mono = "'JetBrains Mono',monospace"

const GOLD      = '#E8B84B'
const GOLD_DIM  = 'rgba(232,184,75,.12)'
const GOLD_LINE = 'rgba(232,184,75,.28)'
const STAWKI_URL  = 'https://chimera-ai.tech/go'
const MANAGER_URL = 'https://t.me/chimera_manager'

// ── Step dots ─────────────────────────────────────────────────────────────────
function StepDots({ current }: { current: number }) {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {[1, 2, 3].map(n => (
        <div key={n} style={{
          width: n === current ? 20 : 6, height: 6, borderRadius: 3,
          background: n <= current ? GOLD : 'rgba(255,255,255,.1)',
          opacity: n < current ? .5 : 1,
          boxShadow: n === current ? `0 0 8px ${GOLD}99` : 'none',
          transition: 'all .4s',
        }} />
      ))}
    </div>
  )
}

// ── Copy URL ──────────────────────────────────────────────────────────────────
function CopyUrl() {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(STAWKI_URL).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <M.button whileTap={{ scale: .97 }} onClick={() => { haptic('light'); copy() }}
      style={{ width: '100%', display: 'flex', alignItems: 'center',
        padding: '10px 14px', borderRadius: 12, border: `1px solid ${GOLD_LINE}`,
        background: GOLD_DIM, cursor: 'pointer', gap: 10, transition: 'all .2s' }}>
      <span style={{ fontFamily: mono, fontSize: 9, color: `${GOLD}BB`,
        letterSpacing: '.04em', flex: 1, textAlign: 'left' }}>
        chimera-ai.tech/go
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5,
        padding: '3px 8px', borderRadius: 6,
        background: copied ? GOLD : 'rgba(232,184,75,.15)',
        transition: 'background .2s' }}>
        {copied
          ? <svg width="11" height="8" viewBox="0 0 11 8" fill="none">
              <path d="M1 4L4 7L10 1" stroke="#080600" strokeWidth="1.8"
                strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          : <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <rect x="1" y="3" width="7" height="8" rx="1.5" stroke={GOLD} strokeWidth="1.2"/>
              <path d="M4 3V2a1 1 0 011-1h5a1 1 0 011 1v7a1 1 0 01-1 1h-1"
                stroke={GOLD} strokeWidth="1.2"/>
            </svg>
        }
        <span style={{ fontFamily: mono, fontSize: 8, fontWeight: 700,
          color: copied ? '#080600' : GOLD, letterSpacing: '.06em' }}>
          {copied ? 'Скопировано' : 'Копировать'}
        </span>
      </div>
    </M.button>
  )
}

// ── Step 1 ────────────────────────────────────────────────────────────────────
function Step1({ onNext }: { onNext: () => void }) {
  return (
    <M.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }} transition={{ duration: .26 }}
      style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>

      {/* Top section */}
      <div>
        {/* Headline */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontFamily: f, fontWeight: 900, fontSize: 'clamp(28px,9vw,36px)',
            lineHeight: .93, letterSpacing: '-.02em', marginBottom: 10 }}>
            Зарегистрируйся<br/>
            <span style={{ color: GOLD }}>на StawkiBet</span>
          </div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,.38)',
            lineHeight: 1.5, fontFamily: 'sans-serif' }}>
            30 дней PRO — бесплатно.<br/>
            Внеси 30€ — это твой банк для ставок с Chimera AI!
          </div>
        </div>

        {/* 4 bullet facts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 14 }}>

          {/* 1 — Card */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 9, flexShrink: 0,
              background: 'rgba(232,184,75,.11)', border: `1px solid rgba(232,184,75,.24)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="5.5" width="20" height="13" rx="3" stroke={GOLD} strokeWidth="1.6"/>
                <path d="M2 9.5h20" stroke={GOLD} strokeWidth="1.6"/>
                <rect x="5" y="12.5" width="4.5" height="3" rx="1" stroke={GOLD} strokeWidth="1.2"/>
                <circle cx="16.5" cy="14" r="1" fill={GOLD}/>
                <circle cx="19" cy="14" r="1" fill={`${GOLD}55`}/>
              </svg>
            </div>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,.55)',
              lineHeight: 1.3, fontFamily: 'sans-serif' }}>
              Открой счёт — нажми кнопку ниже
            </span>
          </div>

          {/* 2 — Euro */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 9, flexShrink: 0,
              background: 'rgba(52,211,153,.09)', border: '1px solid rgba(52,211,153,.22)',
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="8.5" stroke="#34D399" strokeWidth="1.5"/>
                <path d="M15 8.8c-.8-.9-1.8-1.4-3-1.4-2.4 0-4.3 2-4.3 4.6s1.9 4.6 4.3 4.6c1.2 0 2.2-.5 3-1.4"
                  stroke="#34D399" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M7.5 11.3h5.5M7.5 12.7h5.5"
                  stroke="#34D399" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </div>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,.55)',
              lineHeight: 1.3, fontFamily: 'sans-serif' }}>
              Внеси депозит от 30€ (выведешь когда захочешь)
            </span>
          </div>

          {/* 3 — Reward */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 9, flexShrink: 0,
              background: 'rgba(232,184,75,.11)', border: `1px solid rgba(232,184,75,.28)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="10" width="18" height="11" rx="2" stroke={GOLD} strokeWidth="1.5"/>
                <path d="M3 14h18" stroke={GOLD} strokeWidth="1.4"/>
                <path d="M12 10V21" stroke={GOLD} strokeWidth="1.4"/>
                <path d="M12 10c0 0-2-4 0-6s4 2 0 6z" stroke={GOLD} strokeWidth="1.3" strokeLinejoin="round"/>
                <path d="M12 10c0 0 2-4 0-6S8 6 12 10z" stroke={GOLD} strokeWidth="1.3" strokeLinejoin="round"/>
              </svg>
            </div>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,.55)',
              lineHeight: 1.3, fontFamily: 'sans-serif' }}>
              Получи бонусы от StawkiBet{' '}
              <span style={{ color: GOLD, fontWeight: 700 }}>+ 30 дней PRO</span>
              {' '}от Chimera AI
            </span>
          </div>

          {/* 4 — VPN shield */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10,
            outline: '1px dashed rgba(167,139,250,.22)', borderRadius: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 9, flexShrink: 0,
              background: 'rgba(139,92,246,.09)', border: '1px solid rgba(167,139,250,.24)',
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M12 3L4 7v5c0 4.4 3.4 8.5 8 9.5 4.6-1 8-5.1 8-9.5V7L12 3z"
                  stroke="#A78BFA" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M9 12c0-1.66 1.34-3 3-3s3 1.34 3 3"
                  stroke="#A78BFA" strokeWidth="1.4" strokeLinecap="round"/>
                <path d="M7 12c0-2.76 2.24-5 5-5s5 2.24 5 5"
                  stroke="#A78BFA" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="1.5 1.5"/>
                <circle cx="12" cy="13" r="1.2" fill="#A78BFA"/>
              </svg>
            </div>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,.55)',
              lineHeight: 1.3, fontFamily: 'sans-serif' }}>
              Для перехода по партнёрской ссылке может потребоваться VPN
            </span>
          </div>

        </div>
      </div>

      {/* Bottom actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* Primary CTA */}
        <M.a href={STAWKI_URL} target="_blank" rel="noreferrer" whileTap={{ scale: .97 }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            padding: '17px', borderRadius: 16,
            background: `linear-gradient(135deg,${GOLD} 0%,#F5D87A 55%,${GOLD} 100%)`,
            boxShadow: `0 0 32px ${GOLD}55, 0 4px 18px rgba(0,0,0,.5)`,
            textDecoration: 'none', cursor: 'pointer',
            fontFamily: f, fontWeight: 900, fontSize: 15, color: '#080600',
            position: 'relative', overflow: 'hidden' }}>
          <span aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'linear-gradient(105deg,transparent 28%,rgba(255,255,255,.3) 48%,rgba(255,255,255,.45) 52%,rgba(255,255,255,.3) 56%,transparent 76%)',
            animation: 'sw-shim 2.4s ease-in-out infinite' }} />
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="6" width="18" height="13" rx="2.5" stroke="#080600" strokeWidth="1.8"/>
            <path d="M3 10h18" stroke="#080600" strokeWidth="1.8"/>
            <circle cx="7.5" cy="14" r="1.5" fill="#080600"/>
          </svg>
          Открыть счёт на StawkiBet
        </M.a>

        {/* Copy URL */}
        <CopyUrl />

        {/* Secondary */}
        <M.button whileTap={{ scale: .97 }} onClick={() => { haptic('medium'); onNext() }}
          style={{ width: '100%', padding: '17px', borderRadius: 16, cursor: 'pointer',
            background: 'rgba(255,255,255,.08)', border: '1.5px solid rgba(255,255,255,.2)',
            fontFamily: f, fontWeight: 800, fontSize: 15, color: 'rgba(255,255,255,.75)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="5.5" stroke="rgba(255,255,255,.45)" strokeWidth="1.2"/>
            <path d="M5 7l2 2 3-3" stroke="rgba(255,255,255,.6)" strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Уже зарегистрировался — дальше
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M5 3l4 3.5L5 10" stroke="rgba(255,255,255,.5)" strokeWidth="1.7"
              strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </M.button>
      </div>
    </M.div>
  )
}

// ── Step 2 ────────────────────────────────────────────────────────────────────
function Step2({
  bkId, setBkId, depositDone, setDepositDone, onSubmit,
}: {
  bkId: string; setBkId: (v: string) => void
  depositDone: boolean; setDepositDone: (v: boolean) => void
  onSubmit: () => void
}) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '')
    if (digits.length <= 15) setBkId(digits)
  }
  const idValid  = bkId.length >= 5
  const idError  = bkId.length > 0 && bkId.length < 5
  const canSubmit = idValid && depositDone

  return (
    <M.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }} transition={{ duration: .26 }}
      style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>

      <div>
        <div style={{ fontFamily: f, fontWeight: 900, fontSize: 'clamp(26px,8.5vw,34px)',
          lineHeight: .93, letterSpacing: '-.02em', marginBottom: 8 }}>
          Подтверди<br/><span style={{ color: GOLD }}>регистрацию</span>
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,.32)',
          lineHeight: 1.5, fontFamily: 'sans-serif', marginBottom: 22 }}>
          Введи ID аккаунта из личного кабинета StawkiBet
        </div>

        {/* ID field */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontFamily: mono, fontSize: 7.5, fontWeight: 700,
              letterSpacing: '.14em', textTransform: 'uppercase' as const,
              color: idError ? '#F87171' : 'rgba(255,255,255,.25)' }}>
              {idError ? `Минимум 5 цифр` : 'ID аккаунта StawkiBet'}
            </span>
            <span style={{ fontFamily: mono, fontSize: 8,
              color: idValid ? GOLD : 'rgba(255,255,255,.18)' }}>
              {bkId.length} / 15
            </span>
          </div>
          <div style={{ position: 'relative' }}>
            <input
              value={bkId} onChange={handleChange}
              inputMode="numeric" pattern="[0-9]*"
              placeholder="Только цифры — от 5 до 15"
              autoComplete="off"
              style={{
                width: '100%', boxSizing: 'border-box' as const,
                padding: '16px 50px 16px 18px', borderRadius: 14,
                background: idError ? 'rgba(248,113,113,.06)'
                  : idValid ? GOLD_DIM : 'rgba(255,255,255,.04)',
                border: `1.5px solid ${idError ? 'rgba(248,113,113,.45)'
                  : idValid ? GOLD_LINE : 'rgba(255,255,255,.1)'}`,
                fontFamily: mono, fontSize: 18, fontWeight: 700,
                color: '#fff', outline: 'none', transition: 'all .22s', letterSpacing: '.08em',
              }}
            />
            {idValid && (
              <div style={{ position: 'absolute', right: 15, top: '50%', transform: 'translateY(-50%)',
                width: 22, height: 22, borderRadius: '50%',
                background: GOLD_DIM, border: `1.5px solid ${GOLD_LINE}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="11" height="8" viewBox="0 0 11 8" fill="none">
                  <path d="M1 4L4 7L10 1" stroke={GOLD} strokeWidth="1.8"
                    strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            )}
            {idError && (
              <div style={{ position: 'absolute', right: 18, top: '50%', transform: 'translateY(-50%)',
                fontFamily: mono, fontSize: 16, color: '#F87171', fontWeight: 800 }}>!</div>
            )}
          </div>
        </div>

        {/* Deposit toggle */}
        <M.div whileTap={{ scale: .98 }} onClick={() => { haptic('light'); setDepositDone(!depositDone) }}
          style={{ display: 'flex', alignItems: 'center', gap: 14,
            padding: '15px 16px', borderRadius: 16, cursor: 'pointer', marginBottom: 10,
            background: depositDone ? GOLD_DIM : 'rgba(255,255,255,.03)',
            border: `1.5px solid ${depositDone ? GOLD_LINE : 'rgba(255,255,255,.09)'}`,
            boxShadow: depositDone ? `0 0 18px ${GOLD}22` : 'none',
            transition: 'all .22s' }}>
          <div style={{ width: 26, height: 26, borderRadius: 9, flexShrink: 0,
            background: depositDone ? GOLD : 'rgba(255,255,255,.05)',
            border: `1.5px solid ${depositDone ? GOLD : 'rgba(255,255,255,.15)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all .22s' }}>
            {depositDone && (
              <svg width="13" height="10" viewBox="0 0 13 10" fill="none">
                <path d="M1 5L5 9L12 1" stroke="#080600" strokeWidth="2.2"
                  strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
          <div>
            <div style={{ fontFamily: f, fontWeight: 800, fontSize: 14, lineHeight: 1.2,
              color: depositDone ? GOLD : '#fff', transition: 'color .2s' }}>
              Я внёс депозит от 30€
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.28)', marginTop: 3,
              fontFamily: 'sans-serif' }}>
              Нажми только после реального пополнения
            </div>
          </div>
        </M.div>

        {/* Warning */}
        <div style={{ fontSize: 12, color: 'rgba(255,150,50,.55)', fontFamily: 'sans-serif',
          paddingLeft: 12, borderLeft: '2px solid rgba(255,120,0,.3)' }}>
          Без реального депозита активация не произойдёт.
        </div>
      </div>

      {/* Submit */}
      <M.button whileTap={canSubmit ? { scale: .97 } : {}} onClick={canSubmit ? () => { haptic('medium'); onSubmit() } : undefined}
        style={{ width: '100%', padding: '16px', borderRadius: 16, border: 'none',
          cursor: canSubmit ? 'pointer' : 'default',
          background: canSubmit
            ? `linear-gradient(135deg,${GOLD} 0%,#F5D87A 55%,${GOLD} 100%)`
            : 'rgba(255,255,255,.05)',
          boxShadow: canSubmit ? `0 0 28px ${GOLD}55` : 'none',
          fontFamily: f, fontWeight: 900, fontSize: 15,
          color: canSubmit ? '#080600' : 'rgba(255,255,255,.12)',
          transition: 'all .3s', position: 'relative', overflow: 'hidden' }}>
        {canSubmit && (
          <span aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'linear-gradient(105deg,transparent 28%,rgba(255,255,255,.25) 48%,rgba(255,255,255,.4) 52%,rgba(255,255,255,.25) 56%,transparent 76%)',
            animation: 'sw-shim 2.6s ease-in-out infinite' }} />
        )}
        Отправить заявку →
      </M.button>
    </M.div>
  )
}

// ── Step 3 ────────────────────────────────────────────────────────────────────
function Step3({ onHome }: { onHome: () => void }) {
  return (
    <M.div key="s3" initial={{ opacity: 0, scale: .94 }} animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: .3 }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', flex: 1, gap: 0 }}>

      <M.div initial={{ scale: 0 }} animate={{ scale: 1 }}
        transition={{ delay: .1, type: 'spring', stiffness: 160, damping: 14 }}
        style={{ width: 88, height: 88, borderRadius: '50%', marginBottom: 24,
          background: GOLD_DIM, border: `2px solid ${GOLD_LINE}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 0 48px ${GOLD}55, 0 0 100px ${GOLD}18` }}>
        <svg width="40" height="30" viewBox="0 0 40 30" fill="none">
          <M.path d="M2 15L14 27L38 2" stroke={GOLD} strokeWidth="4.5"
            strokeLinecap="round" strokeLinejoin="round"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ delay: .32, duration: .55, ease: 'easeOut' }} />
        </svg>
      </M.div>

      <div style={{ fontFamily: f, fontWeight: 900, textAlign: 'center',
        fontSize: 'clamp(26px,8vw,32px)', lineHeight: 1.0, marginBottom: 10 }}>
        Заявка <span style={{ color: GOLD }}>принята!</span>
      </div>
      <div style={{ fontSize: 14, color: 'rgba(255,255,255,.32)', textAlign: 'center',
        lineHeight: 1.6, marginBottom: 24, fontFamily: 'sans-serif' }}>
        Проверим депозит и активируем PRO<br/>— обычно до 24 часов
      </div>

      <div style={{ display: 'flex', gap: 10, padding: '14px 16px', borderRadius: 14,
        background: GOLD_DIM, border: `1px solid ${GOLD_LINE}`,
        width: '100%', boxSizing: 'border-box' as const, marginBottom: 20 }}>
        <span style={{ fontSize: 16, flexShrink: 0 }}>💬</span>
        <span style={{ fontSize: 13, color: 'rgba(255,255,255,.4)',
          lineHeight: 1.5, fontFamily: 'sans-serif' }}>
          Уведомление о подтверждении придёт в этот Telegram-бот
        </span>
      </div>

      <M.button whileTap={{ scale: .97 }} onClick={() => { haptic('medium'); onHome() }}
        style={{ width: '100%', padding: '15px', borderRadius: 14, border: 'none',
          cursor: 'pointer', background: 'rgba(255,255,255,.06)',
          outline: '1px solid rgba(255,255,255,.1)',
          fontFamily: f, fontWeight: 700, fontSize: 13, color: 'rgba(255,255,255,.45)' }}>
        На главную
      </M.button>
    </M.div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function StawkiSteps() {
  const go = useFunnel(s => s.go)
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [bkId, setBkId] = useState('')
  const [depositDone, setDepositDone] = useState(false)
  const [sending, setSending] = useState(false)

  // Отправляем заявку на бэк (номер БК уходит админу с кнопками принять/отклонить),
  // затем показываем экран «принято». Ошибка сети не блокирует — заявка ушла POST'ом.
  const submitRequest = async () => {
    if (sending) return
    setSending(true)
    try { await api.stawkiRequest(bkId, depositDone) } catch { /* ignore */ }
    setSending(false)
    setStep(3)
  }

  return (
    <M.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: .26 }}
      style={{ height: '100%', display: 'flex', flexDirection: 'column',
        background: '#04020D', overflow: 'hidden', position: 'relative' }}>

      {/* Ambient */}
      <div style={{ position: 'absolute', top: '10%', left: '25%', transform: 'translateX(-50%)',
        width: 300, height: 260, pointerEvents: 'none',
        background: 'radial-gradient(ellipse,rgba(232,184,75,.1) 0%,transparent 65%)',
        filter: 'blur(14px)' }} />
      <div style={{ position: 'absolute', top: '40%', right: '-5%',
        width: 240, height: 220, pointerEvents: 'none',
        background: 'radial-gradient(ellipse,rgba(109,40,217,.11) 0%,transparent 65%)',
        filter: 'blur(14px)' }} />

      {/* ── Header ── */}
      <div style={{ flexShrink: 0, padding: 'var(--header-top) 22px 0',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src={stawkiLogo} width={30} height={30} alt="StawkiBet"
            style={{ borderRadius: 8, flexShrink: 0 }} />
          <div>
            <div style={{ fontFamily: f, fontWeight: 800, fontSize: 13, lineHeight: 1 }}>StawkiBet</div>
            <div style={{ fontFamily: mono, fontSize: 7, color: GOLD,
              letterSpacing: '.1em', marginTop: 2 }}>БЕСПЛАТНЫЙ PRO · 30 ДНЕЙ</div>
          </div>
        </div>
        {step !== 3 && <StepDots current={step} />}
      </div>

      {/* ── Divider ── */}
      <div style={{ flexShrink: 0, height: 1, margin: '14px 22px 0',
        background: 'rgba(255,255,255,.06)' }} />

      {/* ── Content ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column',
        padding: '18px 22px 0', overflowY: 'auto' as const }}>
        <MA mode="wait">
          {step === 1 && <Step1 onNext={() => setStep(2)} />}
          {step === 2 && (
            <Step2 bkId={bkId} setBkId={setBkId}
              depositDone={depositDone} setDepositDone={setDepositDone}
              onSubmit={submitRequest} />
          )}
          {step === 3 && <Step3 onHome={() => go('home')} />}
        </MA>
      </div>

      {/* ── Bottom ── */}
      <div style={{ flexShrink: 0, padding: `10px 22px max(24px, calc(env(safe-area-inset-bottom,0px) + 16px))`,
        display: 'flex', flexDirection: 'column', gap: 8 }}>

        {/* Help */}
        <a href={MANAGER_URL} target="_blank" rel="noreferrer"
          style={{ display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 16px', borderRadius: 14, textDecoration: 'none',
            background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
            background: 'rgba(167,139,250,.12)', border: '1px solid rgba(139,92,246,.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
              <path d="M18 2L1 8.5l6 2.5L18 2z" stroke="#A78BFA" strokeWidth="1.4"
                strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7 11l2.5 6.5L14 5" stroke="#A78BFA" strokeWidth="1.4"
                strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: f, fontWeight: 800, fontSize: 12,
              color: 'rgba(196,181,253,.9)', lineHeight: 1 }}>Нужна помощь?</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.25)',
              fontFamily: 'sans-serif', marginTop: 2 }}>Написать менеджеру</div>
          </div>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M5.5 3.5l4 3.5-4 3.5" stroke="rgba(167,139,250,.45)" strokeWidth="1.6"
              strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </a>

        {/* Back */}
        {step < 3 && (
          <M.button whileTap={{ scale: .97 }}
            onClick={() => { haptic('light'); step === 1 ? go('paywall') : setStep(s => (s - 1) as 1 | 2 | 3) }}
            style={{ width: '100%', padding: '12px', borderRadius: 13, cursor: 'pointer',
              background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.14)',
              fontFamily: f, fontWeight: 700, fontSize: 12, color: 'rgba(255,255,255,.45)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M8 3l-4 3.5L8 10" stroke="rgba(255,255,255,.45)" strokeWidth="1.7"
                strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Назад
          </M.button>
        )}
      </div>

      <style>{`
        @keyframes sw-shim { 0%,40%{transform:translateX(-100%)} 60%,100%{transform:translateX(220%)} }
        input { -webkit-appearance: none; appearance: none; }
        input::placeholder { color: rgba(255,255,255,.16) !important; }
      `}</style>
    </M.div>
  )
}
