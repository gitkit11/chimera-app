/* eslint-disable @typescript-eslint/no-explicit-any */
import { motion } from 'framer-motion'
import { useRef, useEffect } from 'react'
import { useFunnel } from '../store/funnel'
import logoIcon from '../assets/icon_dark2.png'
import stawkiLogo from '../assets/stawkibet.svg'
import { haptic } from '../haptic'

const M = motion as any
const f    = "'Clash Display','Unbounded',sans-serif"
const mono = "'JetBrains Mono',monospace"

// Gold palette — warm, not neon
const GOLD   = '#E8B84B'
const GOLD_DIM = 'rgba(232,184,75,.18)'
const GOLD_LINE = 'rgba(232,184,75,.35)'

function ChimeraLogo({ size = 28 }: { size?: number }) {
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg viewBox="0 0 62 62" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%',
        filter: 'drop-shadow(0 0 4px rgba(167,139,250,.4))' }}>
        <polygon points="2,6 60,6 31,58" style={{ fill: '#1C1F3A', stroke: 'rgba(167,139,250,.5)', strokeWidth: 1.5 }} />
      </svg>
      <img src={logoIcon} alt="" style={{ position: 'absolute', top: '42%', left: '50%',
        transform: 'translate(-50%,-50%)', width: '76%', height: '76%', objectFit: 'contain' }} />
    </div>
  )
}

export default function Paywall() {
  const go          = useFunnel(s => s.go)
  const isPro       = useFunnel(s => s.isPro)
  const proDaysLeft = useFunnel(s => s.proDaysLeft)
  const proPlan     = useFunnel(s => s.proPlan)
  const proUntil    = useFunnel(s => s.proUntil)
  const tickerRef   = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let anim: Animation | null = null

    const start = () => {
      const el = tickerRef.current
      if (!el) return
      anim?.cancel()
      anim = el.animate(
        [{ transform: 'translateY(0px)' }, { transform: 'translateY(-1320px)' }],
        { duration: 132000, iterations: Infinity, easing: 'linear' }
      )
    }

    // Delay past Framer Motion entry animation (opacity 0→1 ~260ms)
    const timer = setTimeout(start, 300)

    // Restart when Telegram brings app back to foreground
    const onVisible = () => { if (!document.hidden) start() }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      clearTimeout(timer)
      anim?.cancel()
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])

  if (isPro) {
    // Метаданные плана: владелец / PRO бесплатный (StawkiBet) / пробный / PRO
    const PLAN = proPlan === 'admin'
        ? { label: 'ВЛАДЕЛЕЦ', accent: GOLD, sub: 'Полный доступ' }
      : proPlan === 'bk_free'
        ? { label: 'PRO БЕСПЛАТНЫЙ', accent: GOLD, sub: 'от StawkiBet' }
      : proPlan === 'trial'
        ? { label: 'ПРОБНЫЙ PRO', accent: '#A78BFA', sub: 'тест-доступ' }
        : { label: 'PRO', accent: '#A78BFA', sub: 'полная подписка' }
    const isForever = proPlan === 'admin'
    // «2026-08-15» → «15 авг 2026»
    const MON = ['янв','фев','мар','апр','мая','июн','июл','авг','сен','окт','ноя','дек']
    const untilStr = (() => {
      if (!proUntil) return ''
      const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(proUntil)
      if (!m) return ''
      return `${+m[3]} ${MON[+m[2] - 1] ?? ''} ${m[1]}`
    })()
    const PERKS = [
      'Все сигналы по 5 видам спорта',
      'Экспрессы и тоталы',
      'Банкер дня и карточка недели',
      'Избранное с пуш-уведомлениями об исходе',
      'Личные встречи и движение линии',
    ]
    return (
      <M.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .26 }}
        style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          background: '#04020D', overflow: 'hidden' }}>
        {/* Ambient glow под акцент плана */}
        <div style={{ position: 'absolute', top: '12%', left: '50%', transform: 'translateX(-50%)',
          width: 360, height: 260, pointerEvents: 'none', zIndex: 0,
          background: `radial-gradient(ellipse,${PLAN.accent}1f 0%,transparent 70%)`, filter: 'blur(16px)' }} />

        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', scrollbarWidth: 'none' as const,
          position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: `var(--header-top) 24px max(40px, calc(env(safe-area-inset-bottom,0px) + 24px))` }}>

          {/* Логотип с короной-свечением */}
          <M.div initial={{ opacity: 0, scale: .8 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: .05, type: 'spring', stiffness: 200 }}
            style={{ marginBottom: 16, filter: `drop-shadow(0 0 16px ${PLAN.accent}55)` }}>
            <ChimeraLogo size={58} />
          </M.div>

          {/* Плашка плана */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '6px 14px',
            borderRadius: 999, marginBottom: 10,
            background: `${PLAN.accent}1c`, border: `1px solid ${PLAN.accent}55` }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path d="M3.6 8.2 7 12l5-6 5 6 3.4-3.8-1.5 9.3a1 1 0 0 1-1 .85H6.1a1 1 0 0 1-1-.85L3.6 8.2Z"
                fill={PLAN.accent} />
            </svg>
            <span style={{ fontFamily: mono, fontSize: 10, fontWeight: 800, letterSpacing: '.16em',
              color: PLAN.accent }}>{PLAN.label}</span>
          </div>

          <div style={{ fontFamily: f, fontWeight: 900, fontSize: 26, textAlign: 'center',
            lineHeight: 1, marginBottom: 6 }}>
            Chimera <span style={{ color: PLAN.accent }}>{proPlan === 'admin' ? '∞' : 'PRO'}</span>
          </div>
          <div style={{ fontFamily: mono, fontSize: 9.5, color: 'rgba(255,255,255,.3)',
            letterSpacing: '.06em', marginBottom: 22 }}>{PLAN.sub}</div>

          {/* Статус-карточка: активна + осталось + дата */}
          <div style={{ width: '100%', maxWidth: 320, borderRadius: 18, overflow: 'hidden',
            background: 'linear-gradient(155deg,#0E0B1E,#070514)',
            border: `1px solid ${PLAN.accent}33`, marginBottom: 18 }}>
            <div style={{ height: 1.5,
              background: `linear-gradient(90deg,transparent,${PLAN.accent} 50%,transparent)` }} />
            <div style={{ padding: '16px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 14 }}>
                <span style={{ fontFamily: mono, fontSize: 9, letterSpacing: '.14em',
                  color: 'rgba(255,255,255,.35)', textTransform: 'uppercase' as const }}>Статус</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5,
                  fontFamily: mono, fontSize: 9.5, fontWeight: 800, letterSpacing: '.1em', color: '#34D399' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34D399',
                    boxShadow: '0 0 8px #34D399' }} /> АКТИВНА
                </span>
              </div>
              {isForever ? (
                <div style={{ fontFamily: f, fontWeight: 900, fontSize: 26, color: PLAN.accent }}>
                  Безлимит
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontFamily: f, fontWeight: 900, fontSize: 40, lineHeight: 1,
                    color: '#F5F3FF' }}>{proDaysLeft}</span>
                  <span style={{ fontFamily: f, fontWeight: 700, fontSize: 14,
                    color: 'rgba(255,255,255,.5)' }}>дней осталось</span>
                </div>
              )}
              {untilStr && !isForever && (
                <div style={{ fontFamily: mono, fontSize: 10, color: 'rgba(255,255,255,.4)',
                  marginTop: 8 }}>Действует до <b style={{ color: 'rgba(255,255,255,.7)' }}>{untilStr}</b></div>
              )}
            </div>
          </div>

          {/* Что открыто */}
          <div style={{ width: '100%', maxWidth: 320, marginBottom: 22 }}>
            <div style={{ fontFamily: mono, fontSize: 8.5, letterSpacing: '.2em',
              color: 'rgba(255,255,255,.28)', textTransform: 'uppercase' as const, marginBottom: 10 }}>
              Тебе открыто
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {PERKS.map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                    <circle cx="12" cy="12" r="11" fill={`${PLAN.accent}22`} stroke={`${PLAN.accent}66`} strokeWidth="1" />
                    <path d="M7 12.5l3 3 7-7.5" stroke={PLAN.accent} strokeWidth="2"
                      strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span style={{ fontFamily: f, fontWeight: 500, fontSize: 12.5,
                    color: 'rgba(255,255,255,.78)' }}>{p}</span>
                </div>
              ))}
            </div>
          </div>

          <M.button whileTap={{ scale: .97 }} onClick={() => { haptic('medium'); go('home') }}
            style={{ width: '100%', maxWidth: 320, padding: '15px', borderRadius: 16, border: 'none',
              cursor: 'pointer', background: 'linear-gradient(135deg,#2D1065,#7C3AED)',
              fontFamily: f, fontWeight: 800, fontSize: 15, color: '#F5F3FF' }}>
            ← К сигналам
          </M.button>
        </div>
      </M.div>
    )
  }

  return (
    <M.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .26 }}
      style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' as const,
        background: '#04020D', overflow: 'hidden' }}>

      {/* Purple ambient */}
      <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
        width: 380, height: 280, pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(ellipse,rgba(109,40,217,.09) 0%,transparent 68%)',
        filter: 'blur(14px)' }} />

      {/* ── SCROLL ZONE: Header + PRO card + Stawki ──
           flex:'0 1 auto' (НЕ 1): зона занимает высоту КОНТЕНТА и может ужаться
           со скроллом на низких экранах, но НЕ раздувается на всю высоту. Иначе
           между Stawki-картой и панелью агентов зияла мёртвая пустота (тот самый
           отступ). Освободившийся низ теперь забирает «живая» панель агентов. */}
      <div style={{ flex: '0 1 auto', minHeight: 0, overflowY: 'auto', scrollbarWidth: 'none' as const,
        position: 'relative', zIndex: 1,
        padding: 'var(--header-top) 18px 20px' }}>

        {/* ── Header ── */}
        <M.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .06 }}
          style={{ marginBottom: 16 }}>
          <div style={{ fontFamily: mono, fontSize: 8, fontWeight: 600, letterSpacing: '.34em',
            textTransform: 'uppercase' as const, color: '#6D28D9', marginBottom: 7 }}>
            Chimera AI · Доступ
          </div>
          <div style={{ fontFamily: f, fontWeight: 900,
            fontSize: 'clamp(22px,7vw,28px)', lineHeight: .97, marginBottom: 6 }}>
            Разблокируй <span style={{ color: '#A78BFA' }}>все сигналы</span>
          </div>
          <div style={{ fontFamily: mono, fontSize: 9, color: 'rgba(255,255,255,.28)' }}>
            74% точность · 4 агента · 5 видов спорта
          </div>
        </M.div>

        {/* ══ PRO CARD ══ */}
        <M.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .11 }}
          style={{ borderRadius: 18, position: 'relative', overflow: 'hidden',
            background: 'linear-gradient(155deg,#0E0B1E 0%,#070514 60%,#0A0620 100%)',
            border: '1px solid rgba(139,92,246,.28)',
            boxShadow: '0 4px 32px rgba(76,29,149,.14)' }}>
          <div style={{ height: 1.5, background: 'linear-gradient(90deg,transparent,#7C3AED 35%,#A78BFA 50%,#7C3AED 65%,transparent)' }} />
          <div style={{ padding: '14px 16px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
              <ChimeraLogo size={32} />
              <div style={{ flex: 1, marginLeft: 11 }}>
                <div style={{ fontFamily: f, fontWeight: 800, fontSize: 15, lineHeight: 1 }}>
                  Chimera <span style={{ color: '#A78BFA' }}>PRO</span>
                </div>
                <div style={{ fontFamily: mono, fontSize: 7.5, color: 'rgba(255,255,255,.26)', marginTop: 2 }}>
                  Полный доступ · 30 дней
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: f, fontWeight: 900, fontSize: 28, lineHeight: 1,
                  background: 'linear-gradient(160deg,#F5F3FF 30%,#A78BFA 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>€99</div>
                <div style={{ fontFamily: mono, fontSize: 7.5, color: 'rgba(255,255,255,.22)' }}>/мес</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '4px 5px', marginBottom: 14 }}>
              {['Все сигналы','AI · 4 агента','5 спортов','Движение линий','Вероятности'].map((t,i) => (
                <div key={i} style={{ padding: '3px 9px', borderRadius: 6,
                  background: 'rgba(109,40,217,.12)', border: '1px solid rgba(139,92,246,.2)',
                  fontFamily: mono, fontSize: 8, color: 'rgba(196,181,253,.65)' }}>✓ {t}</div>
              ))}
            </div>
            <M.button whileTap={{ scale: .97 }} onClick={() => { haptic('medium'); window.open('https://t.me/chimera_manager', '_blank') }}
              style={{ position: 'relative', width: '100%', padding: '2px', borderRadius: 13,
                overflow: 'hidden', background: 'none', border: 'none', cursor: 'pointer', display: 'block' }}>
              <span aria-hidden style={{ position: 'absolute', top: '50%', left: '50%',
                width: '220%', height: '220%', transform: 'translate(-50%,-50%)',
                animation: 'pw-spin 3s linear infinite',
                background: 'conic-gradient(from 0deg,#04020D 0deg,#04020D 88deg,#4C1D95 130deg,#8B5CF6 172deg,#DDD6FE 190deg,#8B5CF6 208deg,#4C1D95 250deg,#04020D 295deg,#04020D 360deg)',
                pointerEvents: 'none' }} />
              <span style={{ position: 'relative', display: 'flex', alignItems: 'center',
                justifyContent: 'center', padding: '13px', borderRadius: 11, zIndex: 1,
                background: 'linear-gradient(135deg,#2D1065,#5B21B6,#7C3AED)',
                fontFamily: f, fontWeight: 800, fontSize: 14, color: '#F5F3FF' }}>
                <span aria-hidden style={{ position: 'absolute', inset: 0, borderRadius: 11, pointerEvents: 'none',
                  background: 'linear-gradient(105deg,transparent 28%,rgba(255,255,255,.1) 48%,rgba(255,255,255,.18) 52%,rgba(255,255,255,.1) 56%,transparent 76%)',
                  animation: 'pw-shim 3.2s ease-in-out infinite' }} />
                Подключить PRO →
              </span>
            </M.button>
          </div>
        </M.div>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6, marginBottom: 10 }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,.05)' }} />
          <span style={{ fontFamily: mono, fontSize: 7.5, color: 'rgba(255,255,255,.14)', letterSpacing: '.2em' }}>ИЛИ БЕСПЛАТНО</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,.05)' }} />
        </div>

        {/* ══ STAWKIBET CARD ══ */}
        <M.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .19 }}
          style={{ borderRadius: 18, marginBottom: 0, overflow: 'hidden',
            background: '#07060A', border: `1.5px solid ${GOLD_LINE}`,
            boxShadow: `0 4px 32px rgba(232,184,75,.06)` }}>
          <div style={{ height: 2, background: `linear-gradient(90deg,transparent,${GOLD} 30%,#F5D78A 50%,${GOLD} 70%,transparent)` }} />
          <div style={{ padding: '12px 14px 14px' }}>
            {/* Header row */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
              <img src={stawkiLogo} width={32} height={32} alt="StawkiBet"
                style={{ borderRadius: 8, flexShrink: 0 }} />
              <div style={{ flex: 1, marginLeft: 9 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                  <span style={{ fontFamily: f, fontWeight: 800, fontSize: 14 }}>StawkiBet</span>
                  <span style={{ padding: '2px 6px', borderRadius: 5,
                    background: GOLD_DIM, border: `1px solid ${GOLD_LINE}`,
                    fontFamily: mono, fontSize: 6.5, fontWeight: 700, color: GOLD, letterSpacing: '.1em' }}>ПАРТНЁР</span>
                </div>
                <div style={{ fontFamily: mono, fontSize: 7, color: 'rgba(255,255,255,.26)' }}>
                  Официальный партнёр Chimera AI
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: f, fontWeight: 900, fontSize: 26, lineHeight: 1, color: GOLD }}>€0</div>
                <div style={{ fontFamily: mono, fontSize: 7, color: 'rgba(255,255,255,.22)',
                  textDecoration: 'line-through' }}>€99</div>
              </div>
            </div>

            {/* Offer — inline, no box */}
            <div style={{ marginBottom: 10, paddingBottom: 10,
              borderBottom: `1px solid ${GOLD_DIM}` }}>
              <div style={{ fontFamily: f, fontWeight: 900, fontSize: 15, lineHeight: 1.2, marginBottom: 3 }}>
                PRO 30 дней — <span style={{ color: GOLD }}>бесплатно</span>
              </div>
              <div style={{ fontFamily: mono, fontSize: 8, color: 'rgba(255,255,255,.30)', marginBottom: 5 }}>
                Зарегистрируйся + первый депозит на StawkiBet
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 3, height: 3, borderRadius: '50%', background: GOLD, flexShrink: 0 }} />
                <span style={{ fontFamily: mono, fontSize: 7, color: GOLD, letterSpacing: '.05em' }}>
                  Только для новых участников · 1 раз
                </span>
              </div>
            </div>

            <M.button whileTap={{ scale: .97 }} onClick={() => { haptic('heavy'); go('stawki-steps') }}
              style={{ position: 'relative', width: '100%', padding: '13px', borderRadius: 13,
                border: 'none', cursor: 'pointer', overflow: 'hidden',
                background: GOLD, fontFamily: f, fontWeight: 900, fontSize: 14,
                color: '#0A0800', letterSpacing: '.01em' }}>
              <span aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
                background: 'linear-gradient(105deg,transparent 28%,rgba(255,255,255,.22) 48%,rgba(255,255,255,.36) 52%,rgba(255,255,255,.22) 56%,transparent 76%)',
                animation: 'pw-shim 2.8s ease-in-out infinite' }} />
              Получить бесплатно →
            </M.button>
          </div>
        </M.div>

      </div>

      {/* ── Live agents panel — растёт и заполняет свободный низ (нет мёртвого
           отступа), оформлена как «живой» блок: заголовок + пульс-точка + LIVE.
           flex-basis 0px (НЕ auto!): панель забирает только ОСТАТОК высоты после
           карточек. С auto её базис = натуральная высота тикера (~4000px строк)
           → она перетягивала дележ и ужимала PRO/«бесплатно» почти в ноль. */}
      <div style={{ flex: '1 1 0px', minHeight: 112, display: 'flex', flexDirection: 'column' as const,
        position: 'relative', zIndex: 1,
        background: 'linear-gradient(180deg,rgba(124,58,237,.06),transparent 62%)' }}>
        {/* Стильная разделительная линия сверху: фиолетовый→зелёный со свечением */}
        <div style={{ flexShrink: 0, height: 1.5, background:
          'linear-gradient(90deg,transparent,rgba(167,139,250,.55) 26%,rgba(52,211,153,.62) 50%,rgba(167,139,250,.55) 74%,transparent)',
          boxShadow: '0 0 10px rgba(139,92,246,.3)' }} />
        {/* Заголовок панели */}
        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8,
          padding: '11px 16px 8px' }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#34D399',
            boxShadow: '0 0 8px rgba(52,211,153,.9)', flexShrink: 0,
            animation: 'pw-pulse 1.6s ease-in-out infinite' }} />
          <span style={{ fontFamily: mono, fontSize: 8.5, fontWeight: 700, letterSpacing: '.14em',
            textTransform: 'uppercase' as const, color: 'rgba(255,255,255,.5)' }}>
            Агенты работают сейчас
          </span>
          <span style={{ flex: 1 }} />
          <span style={{ fontFamily: mono, fontSize: 8, fontWeight: 800, letterSpacing: '.1em',
            color: 'rgba(52,211,153,.72)', background: 'rgba(52,211,153,.08)',
            border: '1px solid rgba(52,211,153,.2)', padding: '2px 7px', borderRadius: 5 }}>
            LIVE
          </span>
        </div>
        {/* Тонкий разделитель под заголовком */}
        <div style={{ flexShrink: 0, height: 1, margin: '0 16px',
          background: 'linear-gradient(90deg,rgba(167,139,250,.22),rgba(255,255,255,.05) 45%,transparent 82%)' }} />
        {/* Прокручиваемое окно трансляции */}
        <div style={{ flex: '1 1 auto', minHeight: 0, overflow: 'hidden', position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 22, zIndex: 2, pointerEvents: 'none',
          background: 'linear-gradient(180deg,#04020D,transparent)' }} />
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 22, zIndex: 2, pointerEvents: 'none',
          background: 'linear-gradient(0deg,#04020D,transparent)' }} />
        <div ref={tickerRef} style={{ display: 'flex', flexDirection: 'column' as const,
          willChange: 'transform' }}>
          {[...Array(3)].map((_, rep) => (
            <div key={rep}>
              {[
                { role: 'Скаут',     action: 'читает новости за последние 24 часа',                 col: '#60A5FA' },
                { role: 'Статистик', action: 'загружает данные последних 10 матчей',              col: '#A78BFA' },
                { role: 'Скаут',     action: 'обнаружил возможное отсутствие ключевого игрока',   col: '#60A5FA' },
                { role: 'Статистик', action: 'считает вероятности всех исходов матча',            col: '#A78BFA' },
                { role: 'Скаут',     action: 'оценивает мотивацию обеих команд',                  col: '#60A5FA' },
                { role: 'Статистик', action: 'видит явный перевес хозяев в атаке',                col: '#A78BFA' },
                { role: 'Арбитр',    action: 'сравнивает выводы Скаута и Статистика',             col: '#34D399' },
                { role: 'Арбитр',    action: 'следит за движением линии у букмекеров',            col: '#34D399' },
                { role: 'Тень',      action: 'независимо анализирует тот же матч',                col: '#F59E0B' },
                { role: 'Арбитр',    action: 'рассчитывает оптимальный размер ставки',            col: '#34D399' },
                { role: 'Тень',      action: 'подтверждает — мнения агентов совпали',             col: '#F59E0B' },
                { role: 'Арбитр',    action: 'выносит финальный вердикт по сигналу',              col: '#34D399' },
                { role: 'Статистик', action: 'проверяет историческую статистику команд',          col: '#A78BFA' },
                { role: 'Скаут',     action: 'сканирует активность в соцсетях команд',            col: '#60A5FA' },
                { role: 'Тень',      action: 'сравнивает коэффициенты у 12 букмекеров',           col: '#F59E0B' },
                { role: 'Статистик', action: 'обнаружил ценное расхождение с рынком',             col: '#A78BFA' },
                { role: 'Арбитр',    action: 'оценивает надёжность сигнала: высокая',             col: '#34D399' },
                { role: 'Тень',      action: 'фиксирует финальные данные перед матчем',           col: '#F59E0B' },
                { role: 'Скаут',     action: 'анализирует состав и ротацию игроков',              col: '#60A5FA' },
                { role: 'Статистик', action: 'строит математическую модель матча',                col: '#A78BFA' },
                { role: 'Тень',      action: 'ищет скрытые паттерны в последних 20 матчах',       col: '#F59E0B' },
                { role: 'Скаут',     action: 'оценивает психологический фактор команд',           col: '#60A5FA' },
                { role: 'Статистик', action: 'рассчитывает ожидаемую ценность ставки',            col: '#A78BFA' },
                { role: 'Арбитр',    action: 'применяет критерий Келли к итоговому сигналу',      col: '#34D399' },
                { role: 'Скаут',     action: 'проверяет свежие интервью тренеров обеих команд',   col: '#60A5FA' },
                { role: 'Статистик', action: 'применяет модель Пуассона к голевой статистике',    col: '#A78BFA' },
                { role: 'Скаут',     action: 'анализирует усталость после плотного расписания',   col: '#60A5FA' },
                { role: 'Тень',      action: 'запускает анализ без данных других агентов',         col: '#F59E0B' },
                { role: 'Статистик', action: 'сравнивает xG обеих команд за последние 5 матчей',  col: '#A78BFA' },
                { role: 'Скаут',     action: 'изучает историю встреч команд на этой арене',       col: '#60A5FA' },
                { role: 'Арбитр',    action: 'взвешивает аргументы всех четырёх агентов',         col: '#34D399' },
                { role: 'Тень',      action: 'перекрёстно проверяет результат с моделью Арбитра', col: '#F59E0B' },
                { role: 'Статистик', action: 'анализирует эффективность стандартных положений',   col: '#A78BFA' },
                { role: 'Скаут',     action: 'отслеживает инсайды о настроении в раздевалке',     col: '#60A5FA' },
                { role: 'Арбитр',    action: 'проверяет согласованность прогнозов агентов',       col: '#34D399' },
                { role: 'Тень',      action: 'ищет аномалии в поведении букмекерских линий',      col: '#F59E0B' },
                { role: 'Статистик', action: 'строит матрицу результатов по 100+ матчам',         col: '#A78BFA' },
                { role: 'Скаут',     action: 'выявляет давление на команду перед матчем',         col: '#60A5FA' },
                { role: 'Арбитр',    action: 'рассчитывает итоговую уверенность в сигнале',       col: '#34D399' },
                { role: 'Тень',      action: 'проверяет сигнал на исторических аналогах',         col: '#F59E0B' },
                { role: 'Статистик', action: 'рассчитывает Dixon-Coles поправку к вероятностям',  col: '#A78BFA' },
                { role: 'Скаут',     action: 'изучает форму команд в последних выездных матчах',  col: '#60A5FA' },
                { role: 'Арбитр',    action: 'фильтрует шум и выделяет ключевые факторы',         col: '#34D399' },
                { role: 'Тень',      action: 'оценивает риск — итог: в пределах нормы',           col: '#F59E0B' },
              ].map((item, i) => (
                <div key={i} style={{ height: 30, display: 'flex', alignItems: 'center',
                  padding: '0 16px', gap: 7, whiteSpace: 'nowrap' as const }}>
                  <span style={{
                    fontFamily: mono, fontSize: 6.5, fontWeight: 700, letterSpacing: '.12em',
                    textTransform: 'uppercase' as const, color: 'rgba(255,255,255,.3)',
                    background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)',
                    padding: '2px 6px', borderRadius: 4, flexShrink: 0,
                  }}>AI АГЕНТ</span>
                  <span style={{ fontFamily: mono, fontSize: 9, fontWeight: 700,
                    color: item.col, flexShrink: 0 }}>{item.role}</span>
                  <span style={{ color: 'rgba(255,255,255,.12)', fontSize: 9 }}>·</span>
                  <span style={{ fontFamily: mono, fontSize: 8.5,
                    color: 'rgba(255,255,255,.28)', letterSpacing: '.01em' }}>
                    {item.action}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
        </div>
      </div>

      {/* ── Bottom nav ── */}
      <div style={{ flexShrink: 0, padding: `8px 18px max(22px, calc(env(safe-area-inset-bottom,0px) + 12px))`,
        display: 'flex', gap: 8, zIndex: 1, background: '#04020D' }}>
        <M.button whileTap={{ scale: .96 }} onClick={() => { haptic('light'); go('signal-cards') }}
          style={{ flex: 1, padding: '13px', borderRadius: 14, cursor: 'pointer', border: 'none',
            background: 'rgba(255,255,255,.05)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L4 7L9 12" stroke="rgba(255,255,255,.32)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{ fontFamily: f, fontWeight: 700, fontSize: 11, color: 'rgba(255,255,255,.32)' }}>Назад</span>
        </M.button>
        <M.button whileTap={{ scale: .96 }} onClick={() => { haptic('light'); go('home') }}
          style={{ flex: 2, padding: '13px', borderRadius: 14, cursor: 'pointer', border: 'none',
            background: 'rgba(109,40,217,.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: f, fontWeight: 700, fontSize: 11, color: 'rgba(167,139,250,.65)' }}>Главное меню</span>
        </M.button>
      </div>

    </M.div>
  )
}
