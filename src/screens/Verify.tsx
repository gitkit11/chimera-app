/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useFunnel } from '../store/funnel'
import logo from '../assets/logo.png'

const M = motion as any
const f = "'Clash Display','Unbounded',sans-serif"

const STEPS = [
  'Активация аккаунта',
  'Загрузка профиля',
  'Подключение агентов',
  'Готово',
]

export default function Verify() {
  const go = useFunnel(s => s.go)
  const [step, setStep] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []
    STEPS.forEach((_, i) => {
      timers.push(setTimeout(() => setStep(i + 1), 700 + i * 800))
    })
    timers.push(setTimeout(() => setDone(true), 700 + STEPS.length * 800 + 200))
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <M.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: .35 }}
      className="h-full flex flex-col items-center justify-center px-6"
      style={{ background: '#04020D' }}
    >
      {!done ? (
        <>
          {/* Spinning logo */}
          <div className="relative w-[120px] h-[120px] flex items-center justify-center mb-10">
            <M.div className="absolute inset-0 rounded-full"
              style={{ border: '1px solid rgba(167,139,250,.25)' }}
              animate={{ rotate: 360 }} transition={{ duration: 12, repeat: Infinity, ease: 'linear' }} />
            <M.div className="absolute rounded-full"
              style={{ inset: 20, border: '1px dashed rgba(139,92,246,.35)' }}
              animate={{ rotate: -360 }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }} />
            <M.div className="absolute inset-[-16px] rounded-full"
              style={{ background: 'radial-gradient(circle,rgba(139,92,246,.14) 0%,transparent 65%)' }}
              animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2.8, repeat: Infinity }} />
            <div className="relative z-10 w-[48px] h-[48px] rounded-[13px] overflow-hidden p-[6px]"
              style={{ background: '#1C1F3A', border: '1.5px solid rgba(167,139,250,.45)', boxShadow: '0 0 18px rgba(139,92,246,.5)' }}>
              <img src={logo} alt="" className="w-full h-full object-contain" />
            </div>
          </div>

          {/* Steps */}
          <div className="w-full max-w-[260px] flex flex-col gap-[10px]">
            {STEPS.map((s, i) => {
              const active = step === i
              const done_ = step > i
              return (
                <M.div key={i}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: i <= step ? 1 : .28, x: 0 }}
                  transition={{ delay: i * .08, duration: .3 }}
                  className="flex items-center gap-3">
                  <div className="w-[18px] h-[18px] rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: done_ ? 'rgba(126,200,142,.18)' : active ? 'rgba(167,139,250,.2)' : 'rgba(255,255,255,.06)',
                      border: `1px solid ${done_ ? '#7EC88E' : active ? '#A78BFA' : 'rgba(255,255,255,.1)'}`,
                      transition: 'all .3s'
                    }}>
                    {done_
                      ? <span style={{ fontSize: 8, color: '#7EC88E', fontWeight: 900 }}>✓</span>
                      : active
                        ? <M.span className="w-[6px] h-[6px] rounded-full block"
                            style={{ background: '#A78BFA' }}
                            animate={{ opacity: [1, .3, 1] }} transition={{ duration: .9, repeat: Infinity }} />
                        : null
                    }
                  </div>
                  <span className="font-mono text-[10.5px] font-medium tracking-[.12em] uppercase"
                    style={{ color: done_ ? '#7EC88E' : active ? '#A78BFA' : 'rgba(255,255,255,.3)', transition: 'color .3s' }}>
                    {s}
                  </span>
                </M.div>
              )
            })}
          </div>
        </>
      ) : (
        <M.div
          initial={{ opacity: 0, scale: .92 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: .5, type: 'spring', stiffness: 160 }}
          className="flex flex-col items-center text-center px-4"
        >
          {/* Success aura */}
          <div className="relative w-[100px] h-[100px] flex items-center justify-center mb-8">
            <M.div className="absolute inset-[-20px] rounded-full"
              style={{ background: 'radial-gradient(circle,rgba(126,200,142,.2) 0%,transparent 65%)' }}
              animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 2.5, repeat: Infinity }} />
            <div className="w-[72px] h-[72px] rounded-full flex items-center justify-center"
              style={{ background: 'rgba(126,200,142,.15)', border: '1.5px solid rgba(126,200,142,.45)', boxShadow: '0 0 24px rgba(126,200,142,.3)' }}>
              <span style={{ fontSize: 32 }}>✓</span>
            </div>
          </div>

          <div style={{ fontFamily: f, fontWeight: 800, fontSize: 'clamp(28px,8vw,34px)', lineHeight: .96, letterSpacing: '.01em', marginBottom: 10 }}>
            Доступ<br /><span style={{ color: '#A78BFA' }}>открыт</span>
          </div>
          <p className="text-[13.5px] font-light leading-[1.42] mb-8"
            style={{ color: 'rgba(250,250,248,.48)' }}>
            Сигнал дня уже ждёт тебя.<br />7 дней без ограничений.
          </p>

          <M.button
            whileTap={{ scale: .985 }}
            onClick={() => go('home')}
            className="w-full max-w-[300px] flex items-center justify-between rounded-[14px] overflow-hidden"
            style={{
              background: 'linear-gradient(135deg,#4C1D95 0%,#7C3AED 50%,#A78BFA 100%)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,.2),0 0 0 1px rgba(139,92,246,.35),0 14px 36px -8px rgba(109,40,217,.65)',
              border: 'none', cursor: 'pointer'
            }}>
            <span className="px-[22px] py-[19px]"
              style={{ fontFamily: f, fontWeight: 700, fontSize: 15, letterSpacing: '.02em', color: '#FAFAF8' }}>
              Смотреть сигнал
            </span>
            <span className="w-[52px] flex items-center justify-center text-[16px] font-bold self-stretch"
              style={{ background: 'rgba(0,0,0,.18)', borderLeft: '1px solid rgba(255,255,255,.14)', color: '#FAFAF8' }}>
              →
            </span>
          </M.button>
        </M.div>
      )}
    </M.div>
  )
}
