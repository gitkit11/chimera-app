import { AnimatePresence, motion } from 'framer-motion'
import { lazy, Suspense, useEffect } from 'react'
import { useFunnel, hydrateOpenedFromCloud } from './store/funnel'
import type { Screen } from './store/funnel'
import { haptic } from './haptic'
import { api } from './api'
import { ChunkErrorBoundary } from './ChunkErrorBoundary'

const M = motion as any

// SplashScreen eager — первый экран, нужен сразу
import SplashScreen from './screens/SplashScreen'

// Остальные — lazy: грузятся только когда нужны
const Cover          = lazy(() => import('./screens/Cover'))
const StakeSelect    = lazy(() => import('./screens/StakeSelect'))
const CardReveal     = lazy(() => import('./screens/CardReveal'))
const SignalCards    = lazy(() => import('./screens/SignalCards'))
const Paywall        = lazy(() => import('./screens/Paywall'))
const Verify         = lazy(() => import('./screens/Verify'))
const StawkiSteps    = lazy(() => import('./screens/StawkiSteps'))
const HomeScreen     = lazy(() => import('./screens/HomeScreen'))
const CategoryScreen = lazy(() => import('./screens/CategoryScreen'))
const ProfileScreen  = lazy(() => import('./screens/ProfileScreen'))
const SupportScreen  = lazy(() => import('./screens/SupportScreen'))
// SupportChat eager — маленький, лагает если lazy+анимация одновременно
import SupportChat from './screens/SupportChat'

const f    = "'Clash Display','Unbounded',sans-serif"
const mono = "'JetBrains Mono',monospace"

const NAV_SCREENS: Screen[] = [
  'home','home-signals','home-express','home-totals','home-week','home-favorites','profile','support'
]

function getBack(screen: Screen): Screen {
  if (screen === 'home') return 'signal-cards'
  return 'home'
}

// ── Premium diamond SVG ────────────────────────────────────────────────────
function Diamond({ size = 15, active = true }: { size?: number; active?: boolean }) {
  return (
    <svg width={size} height={Math.round(size * 1.22)} viewBox="0 0 28 34" fill="none" style={{ flexShrink: 0 }}>
      <defs>
        <linearGradient id="dmBody" x1="0.25" y1="0" x2="0.75" y2="1">
          <stop offset="0%"   stopColor={active ? '#F5F3FF' : '#C4B5FD'}/>
          <stop offset="18%"  stopColor={active ? '#DDD6FE' : '#A78BFA'}/>
          <stop offset="52%"  stopColor={active ? '#8B5CF6' : '#6D28D9'}/>
          <stop offset="100%" stopColor={active ? '#2E1065' : '#1E0756'}/>
        </linearGradient>
        <linearGradient id="dmCrL" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="rgba(255,255,255,.58)"/>
          <stop offset="100%" stopColor="rgba(255,255,255,.12)"/>
        </linearGradient>
        <linearGradient id="dmCrR" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="rgba(255,255,255,.32)"/>
          <stop offset="100%" stopColor="rgba(255,255,255,.06)"/>
        </linearGradient>
      </defs>
      {/* тело */}
      <polygon points="14,1 27,12 14,33 1,12" fill="url(#dmBody)"/>
      {/* корона лево */}
      <polygon points="14,1 1,12 8,12"  fill="url(#dmCrL)"/>
      {/* корона право */}
      <polygon points="14,1 27,12 20,12" fill="url(#dmCrR)"/>
      {/* стол (центр короны) */}
      <polygon points="14,1 8,12 14,7 20,12" fill="rgba(255,255,255,.22)"/>
      {/* грани */}
      <line x1="14" y1="1"  x2="1"  y2="12" stroke="rgba(255,255,255,.55)" strokeWidth="0.6"/>
      <line x1="14" y1="1"  x2="27" y2="12" stroke="rgba(255,255,255,.28)" strokeWidth="0.6"/>
      <line x1="1"  y1="12" x2="14" y2="12" stroke="rgba(255,255,255,.32)" strokeWidth="0.55"/>
      <line x1="27" y1="12" x2="14" y2="12" stroke="rgba(255,255,255,.2)"  strokeWidth="0.55"/>
      <line x1="1"  y1="12" x2="14" y2="33" stroke="rgba(255,255,255,.1)"  strokeWidth="0.5"/>
      <line x1="27" y1="12" x2="14" y2="33" stroke="rgba(255,255,255,.07)" strokeWidth="0.5"/>
      <line x1="8"  y1="12" x2="14" y2="33" stroke="rgba(255,255,255,.06)" strokeWidth="0.45"/>
      <line x1="20" y1="12" x2="14" y2="33" stroke="rgba(255,255,255,.05)" strokeWidth="0.45"/>
      {/* блик */}
      <ellipse cx="11" cy="6" rx="3.2" ry="1.4" fill="rgba(255,255,255,.45)" transform="rotate(-20 11 6)"/>
    </svg>
  )
}

// ── Global Bottom Nav ──────────────────────────────────────────────────────
function BottomNav() {
  const screen   = useFunnel(s => s.screen)
  const cardOpen = useFunnel(s => s.cardOpen)
  const isPro    = useFunnel(s => s.isPro)
  const go       = useFunnel(s => s.go)

  if (!NAV_SCREENS.includes(screen) || cardOpen) return null

  const backTarget = getBack(screen)
  const isProfile  = screen === 'profile'
  const isSupport  = screen === 'support'

  return (
    <div style={{
      flexShrink: 0, position: 'relative',
      background: 'rgba(4,2,13,.97)',
      backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)' as any,
      padding: '10px 12px var(--nav-bottom)'
    }}>
      {/* Верхняя линия-свечение */}
      <div style={{ position:'absolute', top:0, left:'4%', right:'4%', height:1, pointerEvents:'none',
        background:'linear-gradient(90deg,transparent,rgba(109,40,217,.45) 20%,rgba(167,139,250,.75) 50%,rgba(109,40,217,.45) 80%,transparent)' }}/>

      <div style={{ display:'flex', gap:7 }}>

        {/* ── Назад ── */}
        <M.button whileTap={{ scale:.88 }} onClick={() => { haptic('light'); go(backTarget) }}
          style={{ flex:1, padding:'9px 4px 8px', borderRadius:14, cursor:'pointer',
            background:'linear-gradient(160deg,rgba(109,40,217,.18),rgba(76,29,149,.09))',
            border:'1px solid rgba(139,92,246,.24)' as any,
            boxShadow:'inset 0 1px 0 rgba(167,139,250,.16)',
            display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
          {/* Кастомная иконка: стрелка в круге */}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
            style={{ filter:'drop-shadow(0 0 5px rgba(139,92,246,.6))' }}>
            <circle cx="12" cy="12" r="9" stroke="#7C3AED" strokeWidth="1.2" opacity=".5"/>
            <circle cx="12" cy="12" r="9" stroke="url(#navBackRing)" strokeWidth="1.2"/>
            <path d="M13.5 8.5L10 12l3.5 3.5" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="10" y1="12" x2="16" y2="12" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round"/>
            <defs>
              <linearGradient id="navBackRing" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#A78BFA" stopOpacity=".7"/>
                <stop offset="100%" stopColor="#6D28D9" stopOpacity=".2"/>
              </linearGradient>
            </defs>
          </svg>
          <span style={{ fontFamily:mono, fontSize:8, fontWeight:700,
            color:'rgba(196,181,253,.75)', letterSpacing:'.07em' }}>Назад</span>
        </M.button>

        {/* ── Профиль ── */}
        <M.button whileTap={{ scale:.88 }} onClick={() => { haptic(); go('profile') }}
          style={{ flex:1, padding:'9px 4px 8px', borderRadius:14, cursor:'pointer',
            background: isProfile
              ? 'linear-gradient(160deg,rgba(37,99,235,.28),rgba(29,78,216,.15))'
              : 'linear-gradient(160deg,rgba(37,99,235,.13),rgba(29,78,216,.06))',
            border:`1px solid rgba(96,165,250,${isProfile ? '.38' : '.18'})` as any,
            boxShadow: isProfile
              ? 'inset 0 1px 0 rgba(147,197,253,.22),0 0 14px rgba(96,165,250,.22)'
              : 'inset 0 1px 0 rgba(147,197,253,.1)',
            display:'flex', flexDirection:'column', alignItems:'center', gap:4, position:'relative' }}>
          {isProfile && <div style={{ position:'absolute', top:0, left:'22%', right:'22%', height:2,
            borderRadius:2, background:'linear-gradient(90deg,transparent,#60A5FA,transparent)' }}/>}
          {/* Кастомная иконка: шестиугольник + силуэт */}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
            style={{ filter:`drop-shadow(0 0 ${isProfile?6:4}px rgba(96,165,250,${isProfile?.7:.38}))` }}>
            <defs>
              <linearGradient id="navProfGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#93C5FD" stopOpacity={isProfile?'.9':'.6'}/>
                <stop offset="100%" stopColor="#3B82F6" stopOpacity={isProfile?'.7':'.4'}/>
              </linearGradient>
            </defs>
            {/* Шестиугольная рамка */}
            <path d="M12 2l8 4.5v9L12 22l-8-6.5v-9L12 2z"
              stroke="url(#navProfGrad)" strokeWidth="1.3" fill="rgba(59,130,246,.08)"/>
            {/* Голова */}
            <circle cx="12" cy="9.5" r="2.8" stroke="#60A5FA" strokeWidth="1.4"
              fill="rgba(96,165,250,.12)"/>
            {/* Плечи */}
            <path d="M6.5 18.5c0-3 2.5-5 5.5-5s5.5 2 5.5 5"
              stroke="#60A5FA" strokeWidth="1.4" strokeLinecap="round"/>
            {/* Декоративная точка сверху */}
            <circle cx="12" cy="2" r="1.2" fill="#93C5FD" opacity=".7"/>
          </svg>
          <span style={{ fontFamily:mono, fontSize:8, fontWeight:700,
            color: isProfile ? 'rgba(147,197,253,.95)' : 'rgba(147,197,253,.68)',
            letterSpacing:'.07em' }}>Профиль</span>
        </M.button>

        {/* ── Поддержка ── */}
        <M.button whileTap={{ scale:.88 }} onClick={() => { haptic(); go('support') }}
          style={{ flex:1, padding:'9px 4px 8px', borderRadius:14, cursor:'pointer',
            background: isSupport
              ? 'linear-gradient(160deg,rgba(5,150,105,.24),rgba(4,120,87,.13))'
              : 'linear-gradient(160deg,rgba(5,150,105,.12),rgba(4,120,87,.06))',
            border:`1px solid rgba(52,211,153,${isSupport ? '.35' : '.17'})` as any,
            boxShadow: isSupport
              ? 'inset 0 1px 0 rgba(110,231,183,.22),0 0 14px rgba(52,211,153,.2)'
              : 'inset 0 1px 0 rgba(110,231,183,.09)',
            display:'flex', flexDirection:'column', alignItems:'center', gap:4, position:'relative' }}>
          {isSupport && <div style={{ position:'absolute', top:0, left:'22%', right:'22%', height:2,
            borderRadius:2, background:'linear-gradient(90deg,transparent,#34D399,transparent)' }}/>}
          {/* Кастомная иконка: чат + молния */}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
            style={{ filter:`drop-shadow(0 0 ${isSupport?6:4}px rgba(52,211,153,${isSupport?.65:.35}))` }}>
            <defs>
              <linearGradient id="navSuppGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#6EE7B7" stopOpacity={isSupport?'.9':'.6'}/>
                <stop offset="100%" stopColor="#059669" stopOpacity={isSupport?'.7':'.4'}/>
              </linearGradient>
            </defs>
            {/* Пузырь */}
            <path d="M20 3H4a2 2 0 00-2 2v10a2 2 0 002 2h4l4 4 4-4h4a2 2 0 002-2V5a2 2 0 00-2-2z"
              stroke="url(#navSuppGrad)" strokeWidth="1.3" fill="rgba(5,150,105,.1)"
              strokeLinejoin="round"/>
            {/* Молния внутри */}
            <path d="M13 6l-3 5h4l-3 5" stroke="#34D399" strokeWidth="1.6"
              strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{ fontFamily:mono, fontSize:8, fontWeight:700,
            color: isSupport ? 'rgba(110,231,183,.95)' : 'rgba(110,231,183,.68)',
            letterSpacing:'.07em' }}>Поддержка</span>
        </M.button>

        {/* ── Pro кнопка ── */}
        {isPro ? (
          <M.button whileTap={{ scale:.88 }} onClick={() => { haptic(); go('paywall') }}
            style={{ flex:1, padding:'9px 6px 8px', borderRadius:14, cursor:'pointer',
              background:'linear-gradient(160deg,rgba(76,29,149,.55),rgba(109,40,217,.32))',
              border:'1.5px solid rgba(167,139,250,.5)' as any,
              boxShadow:'0 0 14px rgba(139,92,246,.25), inset 0 1px 0 rgba(255,255,255,.1)',
              display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
            <Diamond size={15} active={true}/>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:1 }}>
              <span style={{ fontFamily:f, fontWeight:800, fontSize:10, color:'#DDD6FE', lineHeight:1 }}>Pro</span>
              <span style={{ fontFamily:mono, fontSize:7, fontWeight:700, color:'#6EE7B7', letterSpacing:'.08em', lineHeight:1 }}>активен</span>
            </div>
          </M.button>
        ) : (
          <M.button whileTap={{ scale:.88 }} onClick={() => { haptic(); go('paywall') }}
            style={{ flex:1, padding:'9px 6px 8px', borderRadius:14, cursor:'pointer', position:'relative',
              background:'linear-gradient(160deg,rgba(55,20,120,.24),rgba(109,40,217,.12))',
              border:'1px solid rgba(139,92,246,.38)' as any,
              boxShadow:'inset 0 1px 0 rgba(167,139,250,.12)',
              display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
            {/* GPU-composited glow: opacity-only animation, no repaint */}
            <div style={{ position:'absolute', inset:0, borderRadius:14, pointerEvents:'none',
              boxShadow:'0 0 16px rgba(139,92,246,.5)', animation:'nav-pro-pulse 2.4s ease-in-out infinite' }}/>
            <Diamond size={15} active={false}/>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:1 }}>
              <span style={{ fontFamily:f, fontWeight:800, fontSize:10, color:'rgba(196,181,253,.9)', lineHeight:1 }}>Pro</span>
              <span style={{ fontFamily:mono, fontSize:7, fontWeight:700, color:'rgba(167,139,250,.52)', letterSpacing:'.06em', lineHeight:1 }}>активировать</span>
            </div>
          </M.button>
        )}

      </div>
    </div>
  )
}

// CSS анимации выведены из JS — не нагружают главный поток
const GLOBAL_STYLES = `
  @keyframes nav-pro-pulse {
    0%,100% { opacity: 0; }
    50%      { opacity: 1; }
  }
  @keyframes sc-spin { to { transform: translate(-50%,-50%) rotate(360deg) } }
  @keyframes sc-shim { 0%,42%{transform:translateX(-100%)} 62%,100%{transform:translateX(220%)} }
`

// Экраны, отправленные в аналитику за эту сессию (дедуп на фронте;
// бэк дополнительно дедупит 12ч). splash не трекаем — это не действие юзера.
const _trackedScreens = new Set<string>()

// ── App ────────────────────────────────────────────────────────────────────
export default function App() {
  const screen      = useFunnel(s => s.screen)
  const isPro       = useFunnel(s => s.isPro)
  const setPro      = useFunnel(s => s.setPro)
  const setProDays  = useFunnel(s => s.setProDaysLeft)
  const setProInfo  = useFunnel(s => s.setProInfo)

  // Трекинг глубины: каждый новый экран сессии → POST /api/track
  useEffect(() => {
    if (screen === 'splash' || _trackedScreens.has(screen)) return
    _trackedScreens.add(screen)
    api.track(screen)
  }, [screen])

  useEffect(() => {
    // Догружаем «открытые» карточки из Telegram CloudStorage (localStorage при
    // закрытии мог очиститься) — карточки останутся помеченными «открыто».
    hydrateOpenedFromCloud()

    const FUNNEL: Screen[] = ['splash', 'cover', 'stake-select',
      'card-reveal', 'signal-cards', 'paywall', 'verify', 'stawki-steps']

    api.user().then(u => {
      setPro(u.isPro)
      setProDays(u.daysLeft)
      setProInfo(u.plan ?? 'full', u.until ?? null)
      // Подписчику онбординг-воронка не нужна → всегда открываем ГЛАВНОЕ МЕНЮ
      // (не последнюю категорию). Метки «открыто» на карточках сохраняются
      // отдельно через CloudStorage.
      if (!u.isPro) return
      const jump = () => {
        const cur = useFunnel.getState().screen
        if (FUNNEL.includes(cur)) useFunnel.getState().go('home')
      }
      if (useFunnel.getState().screen === 'splash') setTimeout(jump, 1600)
      else jump()
    }).catch(() => {})
  }, [])

  // Telegram часто НЕ перезагружает мини-апп при повторном открытии, а держит
  // его в памяти и возвращает на тот же экран. Ловим возврат приложения на
  // передний план и, если юзер был в категории/детальной/профиле/поддержке,
  // отправляем в ГЛАВНОЕ МЕНЮ — чтобы «открыть заново» всегда открывало главное.
  useEffect(() => {
    const DEEP: Screen[] = ['home-signals', 'home-express', 'home-totals',
      'home-week', 'home-favorites', 'profile', 'support', 'support-chat']
    const goHomeIfDeep = () => {
      const cur = useFunnel.getState().screen
      if (DEEP.includes(cur)) useFunnel.getState().go('home')
    }
    // 1) стандартное событие: вкладка снова видима
    const onVis = () => { if (document.visibilityState === 'visible') goHomeIfDeep() }
    document.addEventListener('visibilitychange', onVis)
    // 2) возврат из bfcache
    window.addEventListener('pageshow', goHomeIfDeep)
    // 3) родное событие Telegram (Bot API 8.0+) — на случай, если webview не
    //    шлёт visibilitychange при реоткрытии
    const tg = (window as any).Telegram?.WebApp
    try { tg?.onEvent?.('activated', goHomeIfDeep) } catch { /* нет поддержки */ }
    return () => {
      document.removeEventListener('visibilitychange', onVis)
      window.removeEventListener('pageshow', goHomeIfDeep)
      try { tg?.offEvent?.('activated', goHomeIfDeep) } catch { /* ignore */ }
    }
  }, [])

  return (
    <div id="app" className="relative max-w-[440px] mx-auto"
      style={{ background: '#04020D', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <style>{GLOBAL_STYLES}</style>

      {/* ─── DEV TOGGLE (dev only) ─── */}
      {import.meta.env.DEV && screen !== 'splash' && <M.button whileTap={{ scale: .88 }} onClick={() => setPro(!isPro)}
        style={{ position: 'absolute', top: 14, right: 14, zIndex: 9999,
          padding: '5px 11px', borderRadius: 20, cursor: 'pointer',
          background: isPro ? 'rgba(109,40,217,.55)' : 'rgba(255,255,255,.08)',
          border: isPro ? '1px solid rgba(167,139,250,.6)' : '1px solid rgba(255,255,255,.12)' as any,
          boxShadow: isPro ? '0 0 12px rgba(139,92,246,.5)' : 'none',
          fontFamily: "'JetBrains Mono',monospace", fontSize: 9, fontWeight: 700,
          color: isPro ? '#DDD6FE' : 'rgba(255,255,255,.35)',
          letterSpacing: '.12em', display: 'flex', alignItems: 'center', gap: 5 }}>
        {isPro ? '💎 PRO' : '🔒 FREE'}
      </M.button>}

      <div style={{ flex: 1, overflow: 'hidden', position: 'relative', minHeight: 0, background: '#04020D' }}>
        <ChunkErrorBoundary>
        <Suspense fallback={
          <div style={{ background: '#04020D', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 28, height: 28, border: '2.5px solid rgba(167,139,250,.2)', borderTopColor: '#A78BFA', borderRadius: '50%', animation: 'sc-spin .8s linear infinite' }} />
          </div>
        }>
          <AnimatePresence mode="wait">
            {screen === 'splash'       && <SplashScreen key="splash" />}
            {screen === 'cover'        && <Cover        key="cover" />}
            {screen === 'stake-select' && <StakeSelect  key="stake-select" />}
            {screen === 'card-reveal'  && <CardReveal   key="card-reveal" />}
            {screen === 'signal-cards' && <SignalCards  key="signal-cards" />}
            {screen === 'paywall'      && <Paywall      key="paywall" />}
            {screen === 'verify'       && <Verify       key="verify" />}
            {screen === 'stawki-steps' && <StawkiSteps  key="stawki-steps" />}
            {screen === 'home'         && <HomeScreen   key="home" />}
            {(screen === 'home-signals' || screen === 'home-express' ||
              screen === 'home-totals'  || screen === 'home-week'    ||
              screen === 'home-favorites') && <CategoryScreen key="category" />}
            {screen === 'profile'      && <ProfileScreen  key="profile" />}
            {screen === 'support'      && <SupportScreen  key="support" />}
            {screen === 'support-chat' && <SupportChat    key="support-chat" />}
          </AnimatePresence>
        </Suspense>
        </ChunkErrorBoundary>
      </div>

      <BottomNav />
    </div>
  )
}
