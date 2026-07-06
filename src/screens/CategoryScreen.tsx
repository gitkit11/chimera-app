/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, animate as animateMV } from 'framer-motion'
import { useFunnel } from '../store/funnel'
import { haptic } from '../haptic'
import footballIcon   from '../assets/icons/football.svg'
import basketballIcon from '../assets/icons/basketball.svg'
import tennisIcon     from '../assets/icons/tennis.svg'
import cs2Icon        from '../assets/icons/cs2.svg'
import hockeyIcon     from '../assets/icons/hockey.svg'
import tapIcon        from '../assets/icons/tap.svg'
import lockIcon       from '../assets/icons/lock.svg'
import signalsMenuIcon from '../assets/menu/signals.svg'
import expressMenuIcon from '../assets/menu/express.svg'
import totalsMenuIcon  from '../assets/menu/totals.svg'
import weekMenuIcon    from '../assets/menu/week.svg'
import favMenuIcon     from '../assets/menu/favorites.svg'
import lionIcon   from '../assets/agents/lion.svg'
import goatIcon   from '../assets/agents/goat.svg'
import snakeIcon  from '../assets/agents/snake.svg'
import shadowIcon from '../assets/agents/shadow.svg'
import speed210Bg  from '../assets/bg/speed_210.png'
import speed280Bg  from '../assets/bg/speed_280.png'
import speed340Bg  from '../assets/bg/speed_340.png'
import footballBg  from '../assets/bg/football.jpg'
import football2Bg from '../assets/bg/football2.jpg'
import basketballBg from '../assets/bg/basketball.jpg'
import tennisBg    from '../assets/bg/tennis.jpg'
import esportsBg   from '../assets/bg/esports.jpg'
import { api, type ApiSignal, type ApiExpress, type ApiFavorite } from '../api'

const M = motion as any
const f    = "'Clash Display','Unbounded',sans-serif"
const mono = "'JetBrains Mono',monospace"

const SPORT_ICONS: Record<string, string> = {
  football: footballIcon, basketball: basketballIcon,
  tennis: tennisIcon, cs2: cs2Icon, hockey: hockeyIcon,
}
const SPORT_COLOR: Record<string, string> = {
  football: '#A78BFA', basketball: '#F97316', tennis: '#84CC16', cs2: '#38BDF8', hockey: '#E2E8F0',
}

const RARITY = {
  rare:    { label: 'RARE',    color: '#60A5FA' },
  epic:    { label: 'EPIC',    color: '#C084FC' },
  legend:  { label: 'LEGEND',  color: '#F97316' },
  chimera: { label: 'CHIMERA', color: '#EAB308' },
} as const
type RarityKey = keyof typeof RARITY

const AGENTS_META = [
  { role: 'ST', name: 'Статистик', icon: lionIcon,  accent: '#F59E0B' },
  { role: 'SC', name: 'Скаут',     icon: goatIcon,  accent: '#94A3B8' },
  { role: 'AR', name: 'Арбитр',    icon: snakeIcon, accent: '#10B981', verdict: true },
  { role: 'SH', name: 'Shadow',    icon: shadowIcon, accent: '#60A5FA' },
]

// Кэш карточек и избранного. Держим и в модуле (мгновенно при смене вкладок),
// и в localStorage — чтобы после ПОЛНОГО перезапуска приложения список
// рисовался сразу из прошлого сеанса, а не мелькал «Нет сигналов» пока идёт
// первая загрузка. Свежие данные подтягиваются фоновым запросом и заменяют.
const LS_CARDS = 'chimera_cards_cache'
const LS_FAVS  = 'chimera_favs_cache'
function readJSON<T>(key: string): T | null {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null } catch { return null }
}
let _cardsCache: Record<string, Card[]> | null = readJSON<Record<string, Card[]>>(LS_CARDS)
let _favsCache: Card[] | null = readJSON<Card[]>(LS_FAVS)

// Персист последней категории (списка карт) между запусками — App.tsx вернёт
// сюда на старте. Детальную карточку НЕ переоткрываем: возвращаем в список,
// где нужная карта уже помечена «открыто» (см. persist viewedCardIds в сторе).
const LAST_CAT_KEY = 'chimera_last_category'
function saveLastCategory(screen: string) {
  try { localStorage.setItem(LAST_CAT_KEY, screen) } catch { /* ignore */ }
}

type ExpressLeg = { sport: string; match: string; pick: string; odds: string; conf: number; color: string }

type Card = {
  id: string; cardType: 'signal' | 'express' | 'total' | 'week'
  sport: string; tag: string; home: string; away: string
  rec: string; odds: string; ev: string; score: number
  rarity: RarityKey; time: string; date: string; bg: string
  homeLogo: string | null; awayLogo: string | null
  probs: { label: string; pct: number; color: string }[]
  stats: { l: string; v: string; hi?: boolean }[]
  lineMove: { open: string; curr: string; delta: string; dir: 'up' | 'down'; note: string }
  agentTexts: [string, string, string]; shadow: string
  altBet: { rec: string; odds: string; ev: string; note: string }
  legs?: ExpressLeg[]; hitPct?: number; maxBet?: string; correlation?: string
  btts?: number
  isBanker?: boolean        // 🏦 банкер дня (максимум один)
  minOdds?: number | null   // минимальный кэф своей БК для ставки
}

const SPORT_BG: Record<string, string> = {
  football: footballBg, basketball: basketballBg,
  tennis: football2Bg, cs2: esportsBg, hockey: tennisBg,
}
const RARITY_MAP: Record<string, RarityKey> = {
  legendary: 'chimera', epic: 'epic', rare: 'legend', common: 'rare',
}

function mapSignal(s: ApiSignal, cardType: 'signal' | 'total' | 'week'): Card {
  const color = SPORT_COLOR[s.sport] ?? '#A78BFA'
  const conf  = Math.round(s.confidence)
  const ag    = s.agents ?? {}
  const dt    = new Date(s.matchTime)
  const ok    = !isNaN(dt.getTime())
  return {
    id: s.id, cardType, sport: s.sport,
    tag: s.league, home: s.team1, away: s.team2,
    rec: s.prediction,
    odds: String(s.odds),
    ev: s.ev > 0 ? `+${s.ev.toFixed(0)}%` : `${s.ev.toFixed(0)}%`,
    score: s.chimera_score ?? conf,
    rarity: RARITY_MAP[s.rarity] ?? 'rare',
    time: ok ? dt.toLocaleTimeString('ru', { hour:'2-digit', minute:'2-digit' }) : '—',
    date: ok ? dt.toLocaleDateString('ru', { day:'numeric', month:'short' }) : '—',
    bg: SPORT_BG[s.sport] ?? footballBg,
    homeLogo: s.homeLogo ?? null, awayLogo: s.awayLogo ?? null,
    probs: cardType === 'total' ? (() => {
      const pOver  = s.prob_over  !== undefined ? Math.round(s.prob_over)  : conf
      const pUnder = 100 - pOver
      const lblOver  = s.total_line ? `ТБ ${s.total_line}` : 'ТБ'
      const lblUnder = s.total_line ? `ТМ ${s.total_line}` : 'ТМ'
      return s.total_direction === 'under'
        ? [{ label: lblUnder, pct: pUnder, color }, { label: lblOver,  pct: pOver,  color: '#475569' }]
        : [{ label: lblOver,  pct: pOver,  color }, { label: lblUnder, pct: pUnder, color: '#475569' }]
    })() : [
      { label: s.prediction, pct: conf, color },
      { label: 'Против', pct: 100 - conf, color: '#475569' },
    ],
    stats: cardType === 'total' ? [
      { l: 'Ср. тотал',  v: s.avg_total_label ?? (s.avg_total ? String(s.avg_total) : '—'), hi: true },
      { l: s.over_pct !== undefined ? 'Пробив H2H' : 'Уверенность ИИ',
        v: s.over_pct !== undefined ? `${s.over_pct}%` : `${conf}%` },
      { l: 'Тренд',      v: s.trend ?? '—' },
    ] : [
      { l: 'Сигналов',   v: `${s.signals_passed ?? '?'}/${s.signals_total ?? 6}`, hi: true },
      { l: 'Уверенность', v: `${conf}%` },
      // minOdds — правило для своей БК: кэф ниже порога → не ставить
      s.minOdds ? { l: 'Ставь от', v: String(s.minOdds), hi: true }
                : { l: 'Лига', v: s.league },
    ],
    // Живое движение линии (lineMove в %%, >0 — кэф упал, умные деньги с нами)
    lineMove: (s.lineMove !== undefined && s.lineMove !== null && Math.abs(s.lineMove) >= 0.5)
      ? (() => {
          const cur  = Number(s.odds) || 0
          const open = cur * (1 + (s.lineMove as number) / 100)
          const good = (s.lineMove as number) > 0
          return { open: open.toFixed(2), curr: cur.toFixed(2),
            delta: `${cur - open >= 0 ? '+' : ''}${(cur - open).toFixed(2)}`,
            dir: (good ? 'down' : 'up') as 'down' | 'up',
            note: good ? 'Умные деньги с нами' : 'Рынок двигается против' }
        })()
      : { open: String(s.odds), curr: String(s.odds), delta: '0.00', dir: 'down', note: 'Линия стабильна' },
    agentTexts: [ag.statistician ?? '—', ag.scout ?? '—', ag.arbiter ?? '—'],
    shadow: cardType === 'total' ? (s.reasoning ?? ag.llama ?? '—') : (ag.llama ?? '—'),
    altBet: { rec: '—', odds: '—', ev: '—', note: 'Нет альт. ставки' },
    isBanker: !!s.isBanker,
    minOdds: s.minOdds ?? null,
  }
}

// Серверное избранное → карточка списка. У рассчитанных матчей вместо лиги —
// бейдж исхода: «✅ ЗАШЛО · 112:98» (висит 12 часов после результата)
function mapFavorite(fv: ApiFavorite, i: number): Card {
  const tag = fv.result
    ? (fv.result === 'win' ? `✅ ЗАШЛО${fv.score ? ' · ' + fv.score : ''}`
                           : `❌ НЕ ЗАШЛО${fv.score ? ' · ' + fv.score : ''}`)
    : fv.league
  const dt = new Date(fv.matchTime)
  const ok = !isNaN(dt.getTime())
  return {
    id: `srvfav-${i}`, cardType: 'signal', sport: fv.sport, tag,
    home: fv.team1, away: fv.team2, rec: fv.prediction,
    odds: fv.odds ? String(fv.odds) : '—', ev: '—', score: 0, rarity: 'rare',
    time: ok ? dt.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' }) : '—',
    date: ok ? dt.toLocaleDateString('ru', { day: 'numeric', month: 'short' }) : '—',
    bg: SPORT_BG[fv.sport] ?? footballBg,
    homeLogo: fv.homeLogo ?? null, awayLogo: fv.awayLogo ?? null,
    probs: [], stats: [],
    lineMove: { open: '—', curr: '—', delta: '0', dir: 'down', note: '' },
    agentTexts: ['—', '—', '—'], shadow: '—',
    altBet: { rec: '—', odds: '—', ev: '—', note: '—' },
  }
}

function mapExpress(e: ApiExpress): Card {
  const bgByLegs: Record<number, string> = { 2: speed210Bg, 3: speed280Bg, 4: speed340Bg }
  const conf = Math.round(e.confidence)
  return {
    id: e.id, cardType: 'express', sport: e.sport,
    tag: `Экспресс ×${e.legs.length}`,
    home: e.legs.map(l => l.team1).join(' + '), away: '',
    rec: `×${Number(e.totalOdds).toFixed(2)}`,
    odds: String(Number(e.totalOdds).toFixed(2)),
    ev: '+??%', score: conf,
    rarity: RARITY_MAP[e.rarity] ?? 'rare',
    time: '—', date: '—',
    bg: bgByLegs[e.legs.length] ?? speed280Bg,
    homeLogo: null, awayLogo: null,
    legs: e.legs.map(l => ({
      sport: l.sport,
      match: `${l.team1} vs ${l.team2}`,
      pick: l.prediction,
      odds: String(l.odds),
      conf: 70, color: l.color,
    })),
    hitPct: conf, maxBet: '3%', correlation: 'средняя',
    probs: [
      { label: 'Hit',  pct: conf, color: '#34D399' },
      { label: 'Miss', pct: 100 - conf, color: '#475569' },
    ],
    stats: [
      { l: 'Кэф',        v: `×${Number(e.totalOdds).toFixed(2)}`, hi: true },
      { l: 'Уверенность', v: `${conf}%` },
      { l: 'Рекоменд.',  v: '3% банка' },
    ],
    lineMove: { open: String(e.totalOdds), curr: String(e.totalOdds), delta: '0', dir: 'down', note: 'Данные от бота' },
    agentTexts: ['—', '—', '—'], shadow: '—',
    altBet: { rec: '—', odds: '—', ev: '—', note: e.why ?? '—' },
  }
}

const CATEGORY_META: Record<string, { label: string; icon: string; color: string }> = {
  'home-signals':   { label: 'Сигналы',        icon: signalsMenuIcon, color: '#A78BFA' },
  'home-express':   { label: 'Экспресс',        icon: expressMenuIcon, color: '#F97316' },
  'home-totals':    { label: 'Тоталы',          icon: totalsMenuIcon,  color: '#34D399' },
  'home-week':      { label: 'Карточка недели', icon: weekMenuIcon,    color: '#EAB308' },
  'home-favorites': { label: 'Избранные',       icon: favMenuIcon,     color: '#FFD700' },
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function TeamLogo({ name, url, size = 44 }: { name: string; url: string | null; size?: number }) {
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  const colors = ['#A78BFA','#06B6D4','#F97316','#10B981','#EAB308','#F472B6']
  const bg = colors[name.charCodeAt(0) % colors.length]
  return (
    <div style={{ width:size, height:size, borderRadius:size*.28, flexShrink:0, overflow:'hidden',
      background:url?'transparent':`${bg}22`, border:`1.5px solid ${bg}44`,
      display:'flex', alignItems:'center', justifyContent:'center' }}>
      {url ? <img src={url} alt={name} style={{ width:'100%',height:'100%',objectFit:'contain' }}/>
           : <span style={{ fontFamily:f, fontWeight:900, fontSize:size*.38, color:bg }}>{initials}</span>}
    </div>
  )
}

function FormPills({ val }: { val: string }) {
  const parts = val.split(' vs ')
  const pills = (str: string, key: string) => (
    <div key={key} style={{ display:'flex', gap:3 }}>
      {str.split('').map((ch, i) => {
        const col = ch==='W'?'#10B981':ch==='L'?'#EF4444':'#64748B'
        return <div key={i} style={{ width:16,height:16,borderRadius:4,background:`${col}22`,border:`1px solid ${col}55`,
          display:'flex',alignItems:'center',justifyContent:'center',fontFamily:mono,fontSize:7.5,fontWeight:800,color:col }}>{ch}</div>
      })}
    </div>
  )
  if (parts.length===2) return <div style={{ display:'flex',flexDirection:'column',gap:4,alignItems:'flex-end' }}>{pills(parts[0],'h')}{pills(parts[1],'a')}</div>
  return pills(val,'v')
}

function ProbBars({ probs }: { probs: { label: string; pct: number; color: string }[] }) {
  return (
    <div style={{ display:'flex', alignItems:'flex-end', gap:6 }}>
      {probs.map((p,i) => (
        <div key={i} style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:4 }}>
          <div style={{ fontFamily:f,fontWeight:900,fontSize:13,color:p.color,lineHeight:1,textShadow:`0 0 12px ${p.color}88` }}>{p.pct}%</div>
          <div style={{ width:30,height:52,borderRadius:8,background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.07)',
            display:'flex',alignItems:'flex-end',overflow:'hidden',position:'relative' }}>
            {[25,50,75].map(t=><div key={t} style={{ position:'absolute',left:0,right:0,bottom:`${t}%`,height:1,background:'rgba(255,255,255,.06)' }}/>)}
            <M.div initial={{ height:'0%' }} animate={{ height:`${p.pct}%` }}
              transition={{ duration:.7,delay:.2+i*.1,ease:[.16,1,.3,1] }}
              style={{ width:'100%',borderRadius:8,background:`linear-gradient(180deg,${p.color} 0%,${p.color}55 100%)`,
                boxShadow:`0 0 14px ${p.color}55`,position:'relative' }}>
              <div style={{ position:'absolute',top:0,left:'15%',right:'15%',height:2,borderRadius:1,background:'rgba(255,255,255,.35)' }}/>
            </M.div>
          </div>
          <div style={{ fontFamily:mono,fontSize:8.5,fontWeight:800,color:'rgba(255,255,255,.38)',letterSpacing:'.08em' }}>{p.label}</div>
        </div>
      ))}
    </div>
  )
}

function LineMoveWidget({ lm }: { lm: { open:string;curr:string;delta:string;dir:'up'|'down';note:string } }) {
  const good = lm.dir==='down', col = good?'#10B981':'#F97316'
  return (
    <div style={{ borderRadius:12,overflow:'hidden',background:'rgba(255,255,255,.04)',border:`1px solid ${col}33` }}>
      <div style={{ padding:'8px 14px',background:`${col}15`,display:'flex',alignItems:'center',justifyContent:'space-between' }}>
        <div style={{ display:'flex',alignItems:'center',gap:6 }}>
          <div style={{ width:5,height:5,borderRadius:'50%',background:col }}/>
          <span style={{ fontFamily:mono,fontSize:8.5,fontWeight:700,letterSpacing:'.15em',textTransform:'uppercase' as const,color:col }}>Движение линии</span>
        </div>
        <span style={{ fontFamily:mono,fontSize:8,color:'rgba(255,255,255,.35)' }}>{lm.note}</span>
      </div>
      <div style={{ padding:'12px 14px',display:'flex',alignItems:'center' }}>
        <div style={{ flex:1 }}>
          <div style={{ fontFamily:mono,fontSize:8,color:'rgba(255,255,255,.3)',marginBottom:3,letterSpacing:'.1em' }}>БЫЛО</div>
          <div style={{ fontFamily:f,fontWeight:700,fontSize:18,color:'rgba(255,255,255,.4)',textDecoration:'line-through' }}>{lm.open}</div>
        </div>
        <div style={{ flexShrink:0,display:'flex',flexDirection:'column',alignItems:'center',gap:2,padding:'0 8px' }}>
          <span style={{ fontSize:20,color:col }}>{good?'↘':'↗'}</span>
          <span style={{ fontFamily:f,fontWeight:900,fontSize:13,color:col }}>{lm.delta}</span>
        </div>
        <div style={{ flex:1,textAlign:'right' }}>
          <div style={{ fontFamily:mono,fontSize:8,color:col,marginBottom:3,letterSpacing:'.1em',fontWeight:700 }}>СЕЙЧАС</div>
          <div style={{ fontFamily:f,fontWeight:900,fontSize:24,color:col,lineHeight:1 }}>{lm.curr}</div>
        </div>
      </div>
      <div style={{ padding:'6px 14px 10px',fontFamily:mono,fontSize:9,color:col,opacity:.7 }}>
        {good?'Линия падает — шарпы на нашей стороне':'Линия растёт — публика против'}
      </div>
    </div>
  )
}

// Свайп-строка (как в мессенджерах). Тянешь карточку влево → из-под неё
// ПЛАВНО проявляется стеклянная панель «Удалить» (в покое её не видно —
// никакого красного по краям). Тап по панели удаляет. Свайп вправо / тап по
// карточке — закрыть. Два осознанных действия — случайно не удалить.
function SwipeRow({ children, onDelete, height, radius }:
  { children: React.ReactNode; onDelete: () => void; height: number; radius: number }) {
  const REVEAL = 84
  const x = useMotionValue(0)
  const [open, setOpen] = useState(false)
  // Прозрачность и масштаб панели завязаны на само движение пальца:
  // при x=0 панель невидима (opacity 0) → красного по контуру нет вообще.
  const panelOpacity = useTransform(x, [-REVEAL, -14, 0], [1, 0, 0])
  const iconScale    = useTransform(x, [-REVEAL, -44], [1, 0.72])
  const snap = (to: number) => animateMV(x, to, { type:'spring', stiffness:520, damping:46 })
  const doDelete = () => { haptic('medium'); animateMV(x, -560, { duration:0.22 }).then(onDelete) }
  return (
    <div style={{ position:'relative', borderRadius:radius, overflow:'hidden', height, flexShrink:0 }}>
      {/* Стеклянная панель удаления — с отступами, скруглением под стиль */}
      <M.div onClick={() => { if (open) doDelete() }}
        style={{ position:'absolute', top:7, right:7, bottom:7, width:REVEAL-10,
          borderRadius:Math.max(10, radius-5), opacity:panelOpacity,
          pointerEvents: open ? 'auto' : 'none', cursor:'pointer',
          background:'linear-gradient(135deg,rgba(190,18,60,.32) 0%,rgba(136,19,55,.24) 100%)',
          border:'1px solid rgba(244,63,94,.42)',
          boxShadow:'inset 0 1px 0 rgba(255,255,255,.08), 0 0 14px rgba(244,63,94,.14)',
          backdropFilter:'blur(3px)', WebkitBackdropFilter:'blur(3px)' as any,
          display:'flex', alignItems:'center', justifyContent:'center' }}>
        <M.div style={{ scale:iconScale, display:'flex', flexDirection:'column',
          alignItems:'center', gap:5 }}>
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
            <path d="M4 7h16M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m2 0v12a2 2 0 01-2 2H8a2 2 0 01-2-2V7"
              stroke="#FDA4AF" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10 11v6M14 11v6" stroke="#FDA4AF" strokeWidth="1.7" strokeLinecap="round"/>
          </svg>
          <span style={{ fontFamily:mono, fontSize:8.5, fontWeight:800, color:'#FECDD3',
            letterSpacing:'.1em' }}>УДАЛИТЬ</span>
        </M.div>
      </M.div>
      <M.div drag="x" dragDirectionLock
        dragConstraints={{ left:-REVEAL, right:0 }} dragElastic={0.05}
        style={{ x, position:'relative', height:'100%', touchAction:'pan-y', zIndex:2 }}
        onDragEnd={(_e:any, info:any) => {
          const shouldOpen = info.offset.x < -REVEAL / 2
          setOpen(shouldOpen); snap(shouldOpen ? -REVEAL : 0)
        }}>
        {children}
        {/* Панель открыта — тап по карточке закрывает её (а не открывает матч) */}
        {open && (
          <div onClick={(e:React.MouseEvent) => { e.stopPropagation(); setOpen(false); snap(0) }}
            style={{ position:'absolute', inset:0, zIndex:9 }} />
        )}
      </M.div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function CategoryScreen() {
  const screen             = useFunnel(s=>s.screen)
  const go                 = useFunnel(s=>s.go)
  const isPro              = useFunnel(s=>s.isPro)
  const favorites          = useFunnel(s=>s.favorites)
  const addFavorite        = useFunnel(s=>s.addFavorite)
  const removeFavorite     = useFunnel(s=>s.removeFavorite)
  const funnelSignalIdx    = useFunnel(s=>s.funnelSignalIdx)
  const expandedCardIds    = useFunnel(s=>s.expandedCardIds)
  const expandCard         = useFunnel(s=>s.expandCard)
  const viewedCardIds      = useFunnel(s=>s.viewedCardIds)
  const markViewed         = useFunnel(s=>s.markViewed)
  const setCardOpen        = useFunnel(s=>s.setCardOpen)
  const [openCard, setOpenCard] = useState<Card|null>(null)
  const [flipped,  setFlipped]  = useState(false)
  // Инициализируем из модульного кэша → при возврате в категорию данные видны
  // мгновенно, без мелькания «Нет сигналов» на перемонтировании.
  const [liveCards, setLiveCards] = useState<Record<string, Card[]> | null>(_cardsCache)
  const [serverFavs, setServerFavs] = useState<Card[]>(_favsCache ?? [])

  useEffect(() => {
    Promise.allSettled([
      api.botSignals(),
      api.botExpress(),
      api.botTotals(),
      api.botWeek(),
    ]).then(([sigR, expR, totR, wkR]) => {
      // Пустой ответ = честный пустой экран. Раньше стояло `.length > 0`,
      // и при пустоте/ошибке подмешивались захардкоженные демо-карточки.
      const upd: Record<string, Card[]> = {
        'home-signals': [], 'home-express': [], 'home-totals': [], 'home-week': [],
      }
      if (sigR.status === 'fulfilled')
        upd['home-signals'] = sigR.value.map(s => mapSignal(s, 'signal'))
      if (expR.status === 'fulfilled')
        upd['home-express'] = expR.value.map(mapExpress)
      if (totR.status === 'fulfilled')
        upd['home-totals'] = totR.value.map(s => mapSignal(s, 'total'))
      if (wkR.status === 'fulfilled' && wkR.value && wkR.value.team1)
        upd['home-week'] = [mapSignal(wkR.value, 'week')]
      _cardsCache = upd
      try { localStorage.setItem(LS_CARDS, JSON.stringify(upd)) } catch { /* ignore */ }
      setLiveCards(upd)
    }).catch(() => { if (!_cardsCache) setLiveCards({}) })
  }, [])

  // Серверное избранное (с исходами за 12ч) — подгружаем при входе на вкладку
  useEffect(() => {
    if (screen !== 'home-favorites') return
    api.botFavorites()
      .then(fs => {
        const m = fs.map(mapFavorite); _favsCache = m
        try { localStorage.setItem(LS_FAVS, JSON.stringify(m)) } catch { /* ignore */ }
        setServerFavs(m)
      })
      .catch(() => { /* оставляем кэш */ })
  }, [screen])

  const meta = CATEGORY_META[screen] || CATEGORY_META['home-signals']
  const isLoading = liveCards === null
  // Демо-карточки (ALL_CARDS) в выдачу НЕ подмешиваются — только живые данные
  const CARDS = isLoading ? {} : liveCards
  let cards: Card[]
  if (isLoading) {
    cards = []
  } else if (screen==='home-favorites') {
    const local = Object.values(CARDS).flat().filter(c=>favorites.includes(c.id))
      .filter(c => !serverFavs.some(sf => sf.home === c.home && sf.away === c.away))
    cards = [...serverFavs, ...local]
  } else {
    cards = CARDS[screen] || []
  }

  const toggleFav = (c: Card, e?: React.MouseEvent) => {
    e?.stopPropagation()
    favorites.includes(c.id) ? removeFavorite(c.id) : addFavorite(c.id)
    // Сервер: включает уведомление об исходе матча в Telegram-боте.
    // Fire-and-forget: локальный стор работает даже если API недоступен.
    if (c.cardType !== 'express' && c.away)
      api.toggleFavorite(c.sport, c.home, c.away).catch(() => {})
  }
  // Удаление из избранного (крестик на карточке во вкладке «Избранное»):
  // убираем и локальный, и серверный (в т.ч. уже прошедшие матчи, которые
  // висели 12ч и раньше удалить было нельзя).
  const removeFav = (c: Card, e?: React.MouseEvent) => {
    e?.stopPropagation()
    haptic('medium')
    removeFavorite(c.id)
    setServerFavs(prev => {
      const next = prev.filter(sf => !(sf.home === c.home && sf.away === c.away))
      _favsCache = next
      return next
    })
    if (c.away) api.toggleFavorite(c.sport, c.home, c.away).catch(() => {})
  }
  const openDetail = (c: Card) => {
    markViewed(c.id)
    setFlipped(false)
    setOpenCard(c)
    setCardOpen(true)
  }
  const closeDetail = () => { setOpenCard(null); setFlipped(false); setCardOpen(false) }
  const flip = () => setFlipped(p=>!p)

  // Запоминаем последнюю категорию — App.tsx вернёт сюда при следующем запуске
  useEffect(() => { saveLastCategory(screen) }, [screen])


  // ── DETAIL SCREEN ─────────────────────────────────────────────────────────
  if (openCard) {
    const c = openCard
    const isWeek    = c.cardType==='week'
    const isExpress = c.cardType==='express'
    const isTotal   = c.cardType==='total'
    const isFav     = favorites.includes(c.id)
    const accent     = isWeek ? '#EAB308' : isExpress ? '#F97316' : isTotal ? '#34D399' : '#A78BFA'
    const accentBg   = isWeek ? 'rgba(234,179,8,.18)' : isExpress ? 'rgba(249,115,22,.18)' : isTotal ? 'rgba(52,211,153,.14)' : 'rgba(139,92,246,.18)'
    const accentBd   = isWeek ? 'rgba(234,179,8,.45)' : isExpress ? 'rgba(249,115,22,.4)' : isTotal ? 'rgba(52,211,153,.4)' : 'rgba(167,139,250,.45)'
    const accentShadow = isWeek ? 'rgba(234,179,8,.25)' : isExpress ? 'rgba(249,115,22,.2)' : isTotal ? 'rgba(52,211,153,.15)' : 'rgba(139,92,246,.25)'

    return (
      <div style={{ height:'100%', position:'relative', overflow:'hidden',
        background: isWeek    ? 'linear-gradient(160deg,#1a0f00,#0d0800)'
                  : isExpress ? 'linear-gradient(160deg,#1a0800,#431407)'
                  : isTotal   ? 'linear-gradient(160deg,#001a0f,#022c22)'
                  :             'linear-gradient(160deg,#0D0525,#2D1065)' }}>
        <img src={c.bg} alt="" onError={(e)=>{(e.target as HTMLImageElement).style.display='none'}}
          style={{ position:'absolute',inset:0,width:'100%',height:'100%',
          objectFit:'cover',objectPosition:'center top',
          filter:`brightness(${flipped?.3:.6}) saturate(.65)` }} />
        {!flipped && <div style={{ position:'absolute',inset:0,background:'linear-gradient(180deg,rgba(4,2,13,.35) 0%,rgba(4,2,13,.02) 22%,rgba(4,2,13,.02) 44%,rgba(4,2,13,.65) 65%,rgba(4,2,13,.97) 86%)' }}/>}
        {flipped  && <div style={{ position:'absolute',inset:0,background:'rgba(7,3,20,.88)' }}/>}

        <AnimatePresence mode="sync">
          {!flipped ? (
          <M.div key="front" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:.12}}
            style={{ position:'absolute',inset:0 }}>

            {/* Top bar */}
            <div style={{ position:'absolute',top:0,left:0,right:0,zIndex:10,
              display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 16px 0' }}>
              {isWeek ? (
                <div style={{ display:'flex',alignItems:'center',gap:6,padding:'4px 12px',borderRadius:20,
                  background:'rgba(0,0,0,.55)',backdropFilter:'blur(8px)',border:'1px solid rgba(234,179,8,.35)' }}>
                  <span style={{ fontSize:12 }}>👑</span>
                  <span style={{ fontFamily:mono,fontSize:9,fontWeight:800,letterSpacing:'.18em',color:'#EAB308' }}>ВЫБОР НЕДЕЛИ</span>
                </div>
              ) : (
                <div style={{ display:'flex',alignItems:'center',gap:5,padding:'4px 10px',borderRadius:20,
                  background:'rgba(0,0,0,.5)',backdropFilter:'blur(8px)' }}>
                  <div style={{ width:6,height:6,borderRadius:'50%',background:RARITY[c.rarity].color,boxShadow:`0 0 8px ${RARITY[c.rarity].color}` }}/>
                  <span style={{ fontFamily:mono,fontSize:9.5,fontWeight:800,letterSpacing:'.16em',color:RARITY[c.rarity].color }}>{RARITY[c.rarity].label}</span>
                </div>
              )}
              <div style={{ display:'flex',gap:8 }}>
                <M.button whileTap={{scale:.88}} onClick={()=>isFav?removeFavorite(c.id):addFavorite(c.id)}
                  style={{ width:36,height:36,borderRadius:10,border:'none',cursor:'pointer',
                    background:isFav?'rgba(255,215,0,.25)':'rgba(0,0,0,.5)',backdropFilter:'blur(8px)',
                    display:'flex',alignItems:'center',justifyContent:'center',
                    fontSize:16,color:isFav?'#FFD700':'rgba(255,255,255,.5)',transition:'all .2s' }}>
                  {isFav?'★':'☆'}
                </M.button>
                <M.button whileTap={{scale:.88}} onClick={closeDetail}
                  style={{ width:36,height:36,borderRadius:10,border:'none',cursor:'pointer',
                    background:'rgba(0,0,0,.5)',backdropFilter:'blur(8px)',
                    display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,color:'rgba(255,255,255,.7)' }}>✕</M.button>
              </div>
            </div>

            {/* Scroll */}
            <div style={{ position:'absolute',inset:0,overflowY:'auto',scrollbarWidth:'none' as const,paddingBottom:88 }}>
              <div style={{ padding:'52px 18px 0',display:'flex',flexDirection:'column',justifyContent:'flex-end',minHeight:'100%' }}>

                {/* Tag + date + time */}
                <div style={{ display:'flex',alignItems:'center',gap:6,marginBottom:10 }}>
                  <span style={{ fontFamily:mono,fontSize:9,letterSpacing:'.18em',textTransform:'uppercase' as const,color:'rgba(255,255,255,.35)' }}>{c.tag}</span>
                  <span style={{ fontFamily:mono,fontSize:9,color:'rgba(255,255,255,.2)' }}>·</span>
                  <span style={{ fontFamily:mono,fontSize:9,color:'rgba(255,255,255,.28)' }}>{c.date}</span>
                  <span style={{ fontFamily:mono,fontSize:9,color:'rgba(255,255,255,.2)' }}>·</span>
                  <span style={{ fontFamily:mono,fontSize:10,fontWeight:700,color:'rgba(255,255,255,.65)',letterSpacing:'.04em' }}>{c.time}</span>
                </div>

                {/* ── EXPRESS FRONT ── */}
                {isExpress && (<>
                  {/* Legs */}
                  <div style={{ marginBottom:12,borderRadius:14,overflow:'hidden',
                    background:'rgba(255,255,255,.04)',border:'1px solid rgba(249,115,22,.2)' }}>
                    {c.legs?.map((leg,li)=>(
                      <div key={li}>
                        {li>0 && (
                          <div style={{ display:'flex',alignItems:'center',padding:'5px 16px',gap:8 }}>
                            <div style={{ flex:1,height:1,background:'rgba(255,255,255,.06)' }}/>
                            <span style={{ fontFamily:mono,fontSize:11,color:'#F97316',fontWeight:900 }}>+</span>
                            <div style={{ flex:1,height:1,background:'rgba(255,255,255,.06)' }}/>
                          </div>
                        )}
                        <div style={{ padding:li===0?'13px 14px 8px':'8px 14px 13px',
                          display:'flex',alignItems:'center',gap:10 }}>
                          <img src={SPORT_ICONS[leg.sport]||footballIcon} width={30} height={30}
                            style={{ borderRadius:8,flexShrink:0,background:`${leg.color}15`,
                              border:`1px solid ${leg.color}33`,padding:4,boxSizing:'border-box' as const }}/>
                          <div style={{ flex:1,minWidth:0 }}>
                            <div style={{ fontFamily:mono,fontSize:8.5,color:'rgba(255,255,255,.4)',
                              marginBottom:4,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' as const }}>{leg.match}</div>
                            <div style={{ display:'flex',alignItems:'center',gap:8 }}>
                              <div style={{ padding:'2px 9px',borderRadius:5,
                                background:`${leg.color}22`,border:`1px solid ${leg.color}44`,
                                fontFamily:f,fontWeight:700,fontSize:12,color:leg.color }}>{leg.pick}</div>
                              <div style={{ fontFamily:f,fontWeight:700,fontSize:15 }}>×{leg.odds}</div>
                            </div>
                          </div>
                          <div style={{ flexShrink:0,textAlign:'right' }}>
                            <div style={{ fontFamily:mono,fontSize:7.5,color:'rgba(255,255,255,.3)',marginBottom:2 }}>уверен.</div>
                            <div style={{ fontFamily:f,fontWeight:900,fontSize:18,color:leg.color }}>{leg.conf}%</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Combined box */}
                  <div style={{ marginBottom:10,padding:'14px 16px',borderRadius:14,
                    background:accentBg,border:`1.5px solid ${accentBd}`,
                    boxShadow:`0 0 24px ${accentShadow}`,
                    display:'flex',alignItems:'center',justifyContent:'space-between' }}>
                    <div>
                      <div style={{ fontFamily:mono,fontSize:9.5,letterSpacing:'.22em',textTransform:'uppercase' as const,
                        color:accent,marginBottom:5,fontWeight:700 }}>⚡ Итого экспресс</div>
                      <div style={{ fontFamily:f,fontWeight:900,fontSize:32,color:accent,lineHeight:1,
                        textShadow:`0 0 20px ${accentShadow}` }}>×{c.odds}</div>
                    </div>
                    <div style={{ display:'flex',gap:14 }}>
                      {[['Hit',`${c.hitPct}%`,'#FAFAF8'],['EV',c.ev,'#34D399']].map(([l,v,col])=>(
                        <div key={l} style={{ textAlign:'center' }}>
                          <div style={{ fontFamily:mono,fontSize:9,letterSpacing:'.12em',color:'rgba(255,255,255,.55)',marginBottom:3 }}>{l}</div>
                          <div style={{ fontFamily:f,fontWeight:900,fontSize:20,color:col }}>{v}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Bank + correlation */}
                  <div style={{ display:'flex',gap:8,marginBottom:12 }}>
                    {[
                      {lbl:'Макс. ставка',val:c.maxBet+' банка',c1:'rgba(255,255,255,.04)',c2:'rgba(255,255,255,.07)',tc:'#FAFAF8'},
                      {lbl:'Корреляция',val:c.correlation+' ✓',c1:'rgba(52,211,153,.06)',c2:'rgba(52,211,153,.2)',tc:'#34D399'},
                    ].map(({lbl,val,c1,c2,tc})=>(
                      <div key={lbl} style={{ flex:1,padding:'10px 12px',borderRadius:11,background:c1,border:`1px solid ${c2}` }}>
                        <div style={{ fontFamily:mono,fontSize:7.5,color:'rgba(255,255,255,.3)',marginBottom:3,letterSpacing:'.15em',textTransform:'uppercase' as const }}>{lbl}</div>
                        <div style={{ fontFamily:f,fontWeight:700,fontSize:15,color:tc }}>{val}</div>
                      </div>
                    ))}
                  </div>
                  {/* Chimera Score */}
                  <div style={{ display:'flex',alignItems:'center',justifyContent:'flex-end',marginBottom:12 }}>
                    <div style={{ textAlign:'right' }}>
                      <div style={{ fontFamily:mono,fontSize:8,letterSpacing:'.2em',textTransform:'uppercase' as const,color:'rgba(255,255,255,.28)',marginBottom:3 }}>Chimera Score</div>
                      <div style={{ fontFamily:f,fontWeight:900,fontSize:26,background:'linear-gradient(135deg,#FEF3C7,#F59E0B)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent' }}>
                        {c.score}<span style={{ fontSize:12,opacity:.6 }}>/100</span>
                      </div>
                    </div>
                  </div>
                </>)}

                {/* ── TOTAL FRONT ── */}
                {isTotal && (<>
                  {/* Teams */}
                  <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:6 }}>
                    <TeamLogo name={c.home} url={c.homeLogo} size={38}/>
                    <div style={{ fontFamily:f,fontWeight:900,fontSize:'clamp(20px,6vw,28px)',lineHeight:.95 }}>{c.home}</div>
                  </div>
                  <div style={{ fontFamily:mono,fontSize:10,fontWeight:700,color:'#34D399',letterSpacing:'.12em',marginBottom:6,paddingLeft:48 }}>VS</div>
                  <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:14 }}>
                    <TeamLogo name={c.away} url={c.awayLogo} size={38}/>
                    <div style={{ fontFamily:f,fontWeight:900,fontSize:'clamp(20px,6vw,28px)',lineHeight:.95,color:'rgba(255,255,255,.5)' }}>{c.away}</div>
                  </div>
                  {/* Big line box */}
                  <div style={{ marginBottom:12,padding:'14px 18px',borderRadius:14,
                    background:accentBg,border:`1.5px solid ${accentBd}`,
                    boxShadow:`0 0 24px ${accentShadow}`,
                    display:'flex',alignItems:'center',justifyContent:'space-between' }}>
                    <div>
                      <div style={{ fontFamily:mono,fontSize:9.5,letterSpacing:'.22em',textTransform:'uppercase' as const,
                        color:accent,marginBottom:5,fontWeight:700 }}>
                        {c.rec.startsWith('ТБ')?'📈 Больше':'📉 Меньше'}
                      </div>
                      <div style={{ fontFamily:f,fontWeight:900,fontSize:30,color:'#FFFFFF',lineHeight:1,
                        textShadow:`0 0 20px ${accentShadow}` }}>{c.rec}</div>
                    </div>
                    <div style={{ display:'flex',gap:14 }}>
                      {[['Коэф',c.odds,'#FAFAF8'],['EV',c.ev,'#34D399']].map(([l,v,col])=>(
                        <div key={l} style={{ textAlign:'center' }}>
                          <div style={{ fontFamily:mono,fontSize:9,letterSpacing:'.12em',color:'rgba(255,255,255,.55)',marginBottom:3 }}>{l}</div>
                          <div style={{ fontFamily:f,fontWeight:900,fontSize:20,color:col }}>{v}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Prob bars + score */}
                  <div style={{ display:'flex',alignItems:'flex-end',justifyContent:'space-between',marginBottom:12 }}>
                    <ProbBars probs={c.probs}/>
                    <div style={{ textAlign:'right',paddingBottom:4 }}>
                      <div style={{ fontFamily:mono,fontSize:8,letterSpacing:'.2em',textTransform:'uppercase' as const,color:'rgba(255,255,255,.28)',marginBottom:3 }}>Chimera Score</div>
                      <div style={{ fontFamily:f,fontWeight:900,fontSize:26,background:'linear-gradient(135deg,#D1FAE5,#34D399)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent' }}>
                        {c.score}<span style={{ fontSize:12,opacity:.6 }}>/100</span>
                      </div>
                    </div>
                  </div>
                  {/* BTTS row */}
                  {c.btts!==undefined && (
                    <div style={{ marginBottom:10,padding:'9px 14px',borderRadius:11,
                      background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.07)',
                      display:'flex',alignItems:'center',justifyContent:'space-between' }}>
                      <span style={{ fontFamily:mono,fontSize:9,color:'rgba(255,255,255,.4)',letterSpacing:'.1em',textTransform:'uppercase' as const }}>Обе забьют</span>
                      <span style={{ fontFamily:f,fontWeight:900,fontSize:16,color:'#A78BFA' }}>{c.btts}%</span>
                    </div>
                  )}
                  {/* LineMove */}
                  <div style={{ marginBottom:12 }}><LineMoveWidget lm={c.lineMove}/></div>
                  {/* Stats - teal highlight */}
                  <div style={{ borderRadius:12,overflow:'hidden',background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.07)' }}>
                    {c.stats.map((s,si)=>(
                      <div key={si} style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'9px 14px',
                        background:s.hi?'rgba(52,211,153,.06)':'transparent',
                        borderBottom:si<c.stats.length-1?'1px solid rgba(255,255,255,.05)':'none' }}>
                        <div style={{ display:'flex',alignItems:'center',gap:8 }}>
                          {s.hi && <div style={{ width:3,height:12,borderRadius:2,background:'#34D399',boxShadow:'0 0 6px rgba(52,211,153,.7)' }}/>}
                          <span style={{ fontFamily:mono,fontSize:9,letterSpacing:'.14em',textTransform:'uppercase' as const,color:s.hi?'rgba(52,211,153,.8)':'rgba(255,255,255,.3)' }}>{s.l}</span>
                        </div>
                        <span style={{ fontFamily:mono,fontSize:11,fontWeight:700,color:s.hi?'#6EE7B7':'rgba(255,255,255,.75)' }}>{s.v}</span>
                      </div>
                    ))}
                  </div>
                </>)}

                {/* ── SIGNAL / WEEK FRONT ── */}
                {(c.cardType==='signal'||isWeek) && (<>
                  {isWeek && (
                    <div style={{ marginBottom:12,padding:'8px 14px',borderRadius:10,
                      background:'rgba(234,179,8,.1)',border:'1px solid rgba(234,179,8,.25)',
                      display:'flex',alignItems:'center',gap:8 }}>
                      <span style={{ fontSize:14 }}>👑</span>
                      <span style={{ fontFamily:mono,fontSize:9,fontWeight:700,letterSpacing:'.2em',color:'#EAB308' }}>ЛУЧШИЙ СИГНАЛ НЕДЕЛИ · CHIMERA AI</span>
                    </div>
                  )}
                  {/* Teams */}
                  <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:6 }}>
                    <TeamLogo name={c.home} url={c.homeLogo} size={42}/>
                    <div style={{ fontFamily:f,fontWeight:900,fontSize:'clamp(24px,7vw,32px)',lineHeight:.95 }}>{c.home}</div>
                  </div>
                  {c.away && <>
                    <div style={{ fontFamily:mono,fontSize:10,fontWeight:700,color:accent,letterSpacing:'.12em',marginBottom:6,paddingLeft:52 }}>VS</div>
                    <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:16 }}>
                      <TeamLogo name={c.away} url={c.awayLogo} size={42}/>
                      <div style={{ fontFamily:f,fontWeight:900,fontSize:'clamp(24px,7vw,32px)',lineHeight:.95,color:'rgba(255,255,255,.5)' }}>{c.away}</div>
                    </div>
                  </>}
                  {/* Bet box */}
                  <div style={{ marginBottom:10,padding:'12px 16px',borderRadius:14,
                    background:accentBg,border:`1.5px solid ${accentBd}`,
                    boxShadow:`0 0 24px ${accentShadow}`,
                    display:'flex',alignItems:'center',justifyContent:'space-between' }}>
                    <div>
                      <div style={{ fontFamily:mono,fontSize:9.5,letterSpacing:'.22em',textTransform:'uppercase' as const,color:accent,marginBottom:5,fontWeight:700 }}>⬆ Ставить</div>
                      <div style={{ fontFamily:f,fontWeight:900,fontSize:isWeek?32:28,color:'#FFFFFF',lineHeight:1,
                        textShadow:`0 0 20px ${accentShadow}, 0 0 40px ${accentShadow}` }}>{c.rec}</div>
                    </div>
                    <div style={{ display:'flex',gap:12 }}>
                      {[['Коэф',c.odds,'#FAFAF8'],['EV',c.ev,'#34D399']].map(([l,v,col])=>(
                        <div key={l} style={{ textAlign:'center' }}>
                          <div style={{ fontFamily:mono,fontSize:9,letterSpacing:'.16em',textTransform:'uppercase' as const,color:'rgba(255,255,255,.55)',marginBottom:3 }}>{l}</div>
                          <div style={{ fontFamily:f,fontWeight:900,fontSize:20,color:col }}>{v}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* LinMove */}
                  <div style={{ marginBottom:10 }}><LineMoveWidget lm={c.lineMove}/></div>
                  {/* Probs + Score */}
                  <div style={{ display:'flex',alignItems:'flex-end',justifyContent:'space-between',marginBottom:12 }}>
                    <ProbBars probs={c.probs}/>
                    <div style={{ textAlign:'right',paddingBottom:4 }}>
                      <div style={{ fontFamily:mono,fontSize:8,letterSpacing:'.2em',textTransform:'uppercase' as const,color:'rgba(255,255,255,.28)',marginBottom:3 }}>Chimera Score</div>
                      <div style={{ fontFamily:f,fontWeight:900,fontSize:isWeek?32:26,
                        background:isWeek?'linear-gradient(135deg,#FEF3C7,#EAB308)':'linear-gradient(135deg,#EDE9FE,#A78BFA)',
                        WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent' }}>
                        {c.score}<span style={{ fontSize:12,opacity:.6 }}>/100</span>
                      </div>
                    </div>
                  </div>
                  {/* Stats */}
                  <div style={{ borderRadius:12,overflow:'hidden',background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.07)' }}>
                    {c.stats.map((s,si)=>{
                      const isForm = s.l==='Форма'
                      return (
                        <div key={si} style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'9px 14px',
                          background:s.hi?`${accentBg}`:'transparent',
                          borderBottom:si<c.stats.length-1?'1px solid rgba(255,255,255,.05)':'none' }}>
                          <div style={{ display:'flex',alignItems:'center',gap:8 }}>
                            {s.hi && <div style={{ width:3,height:12,borderRadius:2,background:accent,boxShadow:`0 0 6px ${accent}aa` }}/>}
                            <span style={{ fontFamily:mono,fontSize:9,letterSpacing:'.14em',textTransform:'uppercase' as const,color:s.hi?`${accent}cc`:'rgba(255,255,255,.3)' }}>{s.l}</span>
                          </div>
                          {isForm
                            ? <div style={{ maxWidth:180,overflow:'hidden' }}><FormPills val={s.v}/></div>
                            : <span style={{ fontFamily:mono,fontSize:11,fontWeight:700,color:s.hi?'#FAFAF8':'rgba(255,255,255,.75)' }}>{s.v}</span>}
                        </div>
                      )
                    })}
                  </div>
                </>)}

              </div>
            </div>

            {/* Bottom buttons */}
            <div style={{ position:'absolute',bottom:0,left:0,right:0,zIndex:10,
              padding:'14px 20px 34px',background:'linear-gradient(180deg,transparent,rgba(4,2,13,.96) 35%)',
              display:'flex',gap:10 }}>
              <M.button whileTap={{scale:.9}} onClick={closeDetail}
                style={{ width:54,height:54,borderRadius:16,border:'1px solid rgba(255,255,255,.1)',cursor:'pointer',
                  background:'rgba(255,255,255,.06)',display:'flex',alignItems:'center',justifyContent:'center',
                  fontSize:20,color:'rgba(255,255,255,.5)' }}>←</M.button>
              <M.button whileTap={{scale:.97}} onClick={flip}
                style={{ flex:1,height:54,padding:'2px',borderRadius:16,overflow:'hidden',
                  background:'none',border:'none',cursor:'pointer',position:'relative',display:'block' }}>
                <span aria-hidden style={{ position:'absolute',top:'50%',left:'50%',width:'220%',height:'220%',
                  transform:'translate(-50%,-50%)',animation:'cs-spin 2.8s linear infinite',
                  background:`conic-gradient(from 0deg,#04020D 0deg,#04020D 95deg,${isWeek?'#78350F':isExpress?'#7C2D12':isTotal?'#064E3B':'#5B21B6'} 140deg,${accent} 178deg,white 195deg,${accent} 212deg,${isWeek?'#78350F':isExpress?'#7C2D12':isTotal?'#064E3B':'#5B21B6'} 255deg,#04020D 300deg,#04020D 360deg)`,
                  pointerEvents:'none' }}/>
                <span style={{ position:'relative',display:'flex',alignItems:'center',justifyContent:'center',
                  height:'100%',borderRadius:14,zIndex:1,
                  background:isWeek?'linear-gradient(135deg,#1a0f00,#3d2200,#4a2b00)':isExpress?'linear-gradient(135deg,#1a0800,#7c2d12,#431407)':isTotal?'linear-gradient(135deg,#001a0f,#064e3b,#022c22)':'linear-gradient(135deg,#160528,#2D1065,#3B1578)',
                  fontFamily:f,fontWeight:700,fontSize:15,letterSpacing:'.04em',color:'#F5F3FF' }}>
                  <span aria-hidden style={{ position:'absolute',inset:0,borderRadius:14,pointerEvents:'none',
                    background:'linear-gradient(105deg,transparent 25%,rgba(255,255,255,.1) 45%,rgba(255,255,255,.2) 50%,rgba(255,255,255,.1) 55%,transparent 75%)',
                    animation:'cs-shim 3.2s ease-in-out infinite' }}/>
                  Разбор AI
                </span>
              </M.button>
            </div>

          </M.div>
          ) : (
          <M.div key="back" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:.12}}
            style={{ position:'absolute',inset:0,overflow:'hidden',
              background:isWeek?'linear-gradient(160deg,#1a0f00 0%,#0d0800 45%,#030200 100%)':'linear-gradient(160deg,#0D0525 0%,#060D2A 45%,#030810 100%)' }}>

            {/* Top accent line */}
            <div style={{ position:'absolute',top:0,left:0,right:0,height:2,
              background:`linear-gradient(90deg,transparent,${accent} 40%,white,${accent} 60%,transparent)` }}/>
            {/* Glow */}
            <div style={{ position:'absolute',top:'20%',left:'50%',transform:'translateX(-50%)',
              width:220,height:220,borderRadius:'50%',
              background:`radial-gradient(circle,${accent}1a 0%,transparent 70%)`,pointerEvents:'none' }}/>
            {/* Faded heads */}
            <div style={{ position:'absolute',top:'4%',left:0,right:0,
              display:'flex',justifyContent:'center',opacity:.09,pointerEvents:'none' }}>
              <img src={lionIcon} width={120} height={120} alt="" style={{ marginRight:-14 }}/>
              <img src={goatIcon} width={120} height={120} alt="" style={{ marginTop:-10 }}/>
              <img src={snakeIcon} width={120} height={120} alt="" style={{ marginLeft:-14 }}/>
            </div>
            {/* Top bar */}
            <div style={{ position:'absolute',top:0,left:0,right:0,zIndex:10,
              display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 16px 0' }}>
              <div style={{ fontFamily:mono,fontSize:9,fontWeight:700,letterSpacing:'.22em',textTransform:'uppercase' as const,
                color:accent,padding:'4px 10px',borderRadius:20,background:'rgba(0,0,0,.4)',backdropFilter:'blur(8px)' }}>◆ AI Разбор</div>
              <M.button whileTap={{scale:.88}} onClick={closeDetail}
                style={{ width:36,height:36,borderRadius:10,border:'none',cursor:'pointer',
                  background:'rgba(0,0,0,.4)',backdropFilter:'blur(8px)',
                  display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,color:'rgba(255,255,255,.7)' }}>✕</M.button>
            </div>
            <div style={{ position:'absolute',top:52,left:16,right:16,zIndex:5 }}>
              <div style={{ fontFamily:mono,fontSize:9,color:'rgba(255,255,255,.35)',letterSpacing:'.12em' }}>
                {c.home}{c.away?` · vs · ${c.away}`:''}
              </div>
            </div>

            {/* Oracle scroll */}
            <div style={{ position:'absolute',inset:0,overflowY:'auto',scrollbarWidth:'none' as const,
              display:'flex',flexDirection:'column',alignItems:'center',padding:'80px 22px 108px',gap:0 }}>

              {/* Score ring */}
              <M.div initial={{scale:.7,opacity:0}} animate={{scale:1,opacity:1}} transition={{delay:.1,type:'spring',stiffness:140}}>
                <svg width="130" height="130" viewBox="0 0 130 130" style={{ overflow:'visible' }}>
                  <defs>
                    <linearGradient id={`arc-${c.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor={isWeek?'#92400e':isExpress?'#7c2d12':isTotal?'#064e3b':'#7C3AED'}/>
                      <stop offset="100%" stopColor={accent}/>
                    </linearGradient>
                    <filter id={`glow-${c.id}`}><feDropShadow dx="0" dy="0" stdDeviation="4" floodColor={accent} floodOpacity="0.7"/></filter>
                  </defs>
                  <circle cx="65" cy="65" r="52" fill="none" stroke="rgba(255,255,255,.07)" strokeWidth="6"/>
                  <circle cx="65" cy="65" r="52" fill="none" stroke={`url(#arc-${c.id})`} strokeWidth="6"
                    strokeDasharray={`${(c.score/100)*327} 327`} strokeLinecap="round"
                    transform="rotate(-90 65 65)" filter={`url(#glow-${c.id})`}/>
                  <circle cx="65" cy="65" r="40" fill={`${accent}0a`}/>
                  <text x="65" y="60" textAnchor="middle" fontFamily="'Clash Display','Unbounded',sans-serif"
                    fontSize="34" fontWeight="900" fill="white">{c.score}</text>
                  <text x="65" y="76" textAnchor="middle" fontFamily="monospace" fontSize="9"
                    fill="rgba(255,255,255,.3)" letterSpacing="1">/100</text>
                  <text x="65" y="90" textAnchor="middle" fontFamily="monospace" fontSize="7"
                    fontWeight="700" fill={`${accent}88`} letterSpacing="2">CHIMERA SCORE</text>
                </svg>
              </M.div>

              {/* Agents row */}
              <M.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:.3}}
                style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:14,marginTop:10,marginBottom:20 }}>
                {AGENTS_META.map((a,i)=>(
                  <div key={i} style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:5 }}>
                    <div style={{ position:'relative' }}>
                      <img src={a.icon} width={40} height={40} alt=""
                        style={{ borderRadius:10,boxShadow:`0 0 12px ${a.accent}66` }}/>
                      <div style={{ position:'absolute',bottom:-3,right:-3,width:13,height:13,borderRadius:'50%',
                        background:'#10B981',border:'2px solid #04020D',
                        display:'flex',alignItems:'center',justifyContent:'center',fontSize:7,color:'white',fontWeight:900 }}>✓</div>
                    </div>
                    <span style={{ fontFamily:mono,fontSize:7.5,color:`${a.accent}99`,letterSpacing:'.05em' }}>{a.name}</span>
                  </div>
                ))}
              </M.div>

              <div style={{ width:'100%',height:2,background:`linear-gradient(90deg,transparent,${accent}88 30%,${accent} 50%,${accent}88 70%,transparent)`,marginBottom:18,borderRadius:1 }}/>

              {/* Verdict */}
              <M.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:.45}}
                style={{ width:'100%',textAlign:'center',marginBottom:16 }}>
                <div style={{ fontFamily:mono,fontSize:8,fontWeight:700,letterSpacing:'.3em',textTransform:'uppercase' as const,
                  color:`${accent}88`,marginBottom:8 }}>Вердикт арбитра</div>
                <div style={{ fontFamily:f,fontWeight:700,fontSize:15,lineHeight:1.45,color:'#FAFAF8' }}>{c.agentTexts[2]}</div>
              </M.div>

              {/* Agent cards */}
              {AGENTS_META.slice(0,3).map((a,i)=>(
                <M.div key={i} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:.35+i*.08}}
                  style={{ width:'100%',marginBottom:8,padding:'11px 14px',borderRadius:13,
                    background:a.verdict?`${accent}22`:'rgba(255,255,255,.07)',
                    border:`1px solid ${a.verdict?`${accent}55`:'rgba(255,255,255,.1)'}` }}>
                  <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:6 }}>
                    <img src={a.icon} width={32} height={32} alt="" style={{ borderRadius:8,flexShrink:0 }}/>
                    <div>
                      <div style={{ fontFamily:f,fontWeight:700,fontSize:12 }}>{a.name}</div>
                      <div style={{ fontFamily:mono,fontSize:8,color:a.accent,letterSpacing:'.1em' }}>{a.role} Agent</div>
                    </div>
                  </div>
                  <div style={{ fontFamily:mono,fontSize:10,color:'rgba(255,255,255,.65)',lineHeight:1.5 }}>{c.agentTexts[i]}</div>
                </M.div>
              ))}

              {/* Shadow */}
              <M.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:.58}}
                style={{ width:'100%',padding:'9px 13px',borderRadius:11,borderLeft:'2px solid rgba(96,165,250,.45)',
                  background:'rgba(59,130,246,.06)',marginBottom:12 }}>
                <div style={{ fontFamily:mono,fontSize:7.5,color:'rgba(96,165,250,.65)',letterSpacing:'.18em',
                  textTransform:'uppercase' as const,marginBottom:4 }}>Shadow · Llama 70B</div>
                <div style={{ fontFamily:mono,fontSize:10,color:'rgba(255,255,255,.58)',lineHeight:1.5 }}>{c.shadow}</div>
              </M.div>

              {/* Alt bet */}
              <M.div initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} transition={{delay:.68}}
                style={{ width:'100%',padding:'9px 14px',borderRadius:11,
                  background:'rgba(16,185,129,.09)',border:'1px solid rgba(52,211,153,.25)',
                  display:'flex',alignItems:'center',justifyContent:'space-between' }}>
                <div>
                  <div style={{ fontFamily:mono,fontSize:7,letterSpacing:'.2em',textTransform:'uppercase' as const,
                    color:'rgba(52,211,153,.55)',marginBottom:3 }}>Альт. ставка</div>
                  <div style={{ fontFamily:f,fontWeight:900,fontSize:16,color:'#34D399' }}>{c.altBet.rec}</div>
                  <div style={{ fontFamily:mono,fontSize:9,color:'rgba(255,255,255,.35)',marginTop:2 }}>{c.altBet.note}</div>
                </div>
                <div style={{ display:'flex',gap:12 }}>
                  {[['КОЭФ',c.altBet.odds,'#FAFAF8'],['EV',c.altBet.ev,'#34D399']].map(([l,v,col])=>(
                    <div key={l} style={{ textAlign:'right' }}>
                      <div style={{ fontFamily:mono,fontSize:7,color:'rgba(255,255,255,.28)',marginBottom:2 }}>{l}</div>
                      <div style={{ fontFamily:f,fontWeight:800,fontSize:15,color:col }}>{v}</div>
                    </div>
                  ))}
                </div>
              </M.div>

            </div>

            {/* Back buttons */}
            <div style={{ position:'absolute',bottom:0,left:0,right:0,zIndex:10,
              padding:'14px 20px 34px',background:'linear-gradient(180deg,transparent,rgba(7,3,26,.98) 35%)' }}>
              <div style={{ display:'flex',gap:10 }}>
                <M.button whileTap={{scale:.97}} onClick={flip}
                  style={{ flex:1,height:54,borderRadius:16,border:'none',cursor:'pointer',
                    background:`linear-gradient(135deg,${isWeek?'#3d2200,#78350F':isExpress?'#431407,#7c2d12':isTotal?'#022c22,#064e3b':'#2D1065,#5B21B6'})`,
                    boxShadow:`0 0 0 1px ${accent}66`,fontFamily:f,fontWeight:700,fontSize:15,color:'#F5F3FF' }}>← К сигналу</M.button>
                <M.button whileTap={{scale:.9}} onClick={closeDetail}
                  style={{ width:54,height:54,borderRadius:16,border:'1px solid rgba(255,255,255,.1)',cursor:'pointer',
                    background:'rgba(255,255,255,.06)',display:'flex',alignItems:'center',justifyContent:'center',
                    fontSize:18,color:'rgba(255,255,255,.5)' }}>✕</M.button>
              </div>
            </div>

          </M.div>
          )}
        </AnimatePresence>

        <style>{`
          @keyframes cs-spin { to { transform: translate(-50%,-50%) rotate(360deg) } }
          @keyframes cs-shim { 0%,42%{transform:translateX(-100%)} 62%,100%{transform:translateX(220%)} }
          @keyframes week-glow { 0%,100%{box-shadow:inset 0 0 0 1.5px rgba(234,179,8,.4),0 0 20px rgba(234,179,8,.15)} 50%{box-shadow:inset 0 0 0 1.5px rgba(234,179,8,.8),0 0 35px rgba(234,179,8,.35)} }
        `}</style>
      </div>
    )
  }

  // ── LIST SCREEN ───────────────────────────────────────────────────────────
  return (
    <M.div initial={{opacity:0,x:40}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-40}} transition={{duration:.28}}
      style={{ height:'100%',display:'flex',flexDirection:'column',background:'#04020D',overflow:'hidden',position:'relative' }}>

      {/* Header */}
      <div style={{ flexShrink:0,padding:'var(--header-top) 20px 14px' }}>
        <div style={{ display:'flex',alignItems:'center',gap:12,marginBottom:4 }}>
          <div style={{ width:36,height:36,borderRadius:10,flexShrink:0,
            background:`${meta.color}18`,border:`1px solid ${meta.color}44`,
            display:'flex',alignItems:'center',justifyContent:'center' }}>
            <img src={meta.icon} width={22} height={22} alt=""/>
          </div>
          <div style={{ fontFamily:f,fontWeight:900,fontSize:22,lineHeight:1 }}>{meta.label}</div>
        </div>
        <div style={{ fontFamily:mono,fontSize:9.5,color:'rgba(255,255,255,.35)',letterSpacing:'.1em' }}>
          {isLoading ? 'Загрузка…'
            : cards.length>0?`${cards.length} сигнал${cards.length!==1?'а':''} · Сегодня`:'Нет сигналов'}
        </div>
      </div>

      {/* Cards */}
      <div style={{ flex:1,overflowY:'auto',padding:'0 20px var(--scroll-bottom)',scrollbarWidth:'none' as const }}>
        {isLoading ? (
          <div style={{ display:'flex',flexDirection:'column',gap:10,paddingTop:4 }}>
            {[0,1,2].map(i=>(
              <M.div key={i}
                animate={{ opacity:[.3,.55,.3] }}
                transition={{ duration:1.6,repeat:Infinity,delay:i*.2,ease:'easeInOut' }}
                style={{ height:118,borderRadius:16,
                  background:'rgba(255,255,255,.05)',
                  border:'1px solid rgba(255,255,255,.06)' }}/>
            ))}
          </div>
        ) : cards.length===0 ? (
          <div style={{ height:'60%',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:14 }}>
            <div style={{ fontSize:44,opacity:.25 }}>{screen==='home-favorites' ? '★' : '📡'}</div>
            <div style={{ fontFamily:mono,fontSize:11,color:'rgba(255,255,255,.25)',textAlign:'center',letterSpacing:'.08em',lineHeight:1.6 }}>
              {screen==='home-favorites'
                ? <>Здесь появятся<br/>сохранённые сигналы</>
                : <>Сигналов нет · 0<br/>новые появятся после ближайшего скана</>}
            </div>
          </div>
        ) : (
          <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
            {cards.map((c,i)=>{
              const freeIdx = screen === 'home-signals'
                ? (funnelSignalIdx !== null ? funnelSignalIdx : 0)
                : -1
              const isFav      = favorites.includes(c.id)
              const isWeek     = c.cardType==='week'
              const isExpress  = c.cardType==='express'
              // non-PRO locked (paywall): show lock icon
              const isLocked   = !isPro && (screen === 'home-signals' ? i !== freeIdx : true)
              // PRO: card not yet expanded in list (dark/closed, no lock)
              const isProClosed   = isPro && !expandedCardIds.includes(c.id)
              // PRO: card expanded in list (glow + full info + СМОТРЕТЬ)
              const isProExpanded = isPro && expandedCardIds.includes(c.id)
              // any mode: card was opened (button shows СМОТРЕТЬ + ↗)
              const isOpened = isProExpanded || viewedCardIds.includes(c.id)
              const cardH = isWeek ? 190 : isExpress ? 132 : 118

              const cardEl = (
                <M.div
                  initial={{opacity:0,y:14}} animate={{opacity:1,y:0}}
                  transition={{delay:.05*i,type:'spring',stiffness:200}}
                  style={{ position:'relative',borderRadius:isWeek?20:16,overflow:'hidden',height:cardH }}>

                  <img src={c.bg} alt="" onError={(e)=>{(e.target as HTMLImageElement).style.display='none'}}
                    style={{ position:'absolute',inset:0,width:'100%',height:'100%',
                    objectFit:'cover',
                    filter:`brightness(${(isLocked||isProClosed) ? .32 : isWeek ? .6 : .52}) saturate(${(isLocked||isProClosed) ? .3 : isWeek ? .85 : .7})`,
                    transition:'filter .4s' }}/>

                  {isLocked ? (
                    /* ── LOCKED: funnel-style dark + placeholder ── */
                    <>
                      <div style={{ position:'absolute',inset:0,
                        background:'linear-gradient(90deg,rgba(4,2,13,.93) 0%,rgba(4,2,13,.75) 100%)' }}/>
                      <div onClick={()=>{ haptic('medium'); go('paywall') }}
                        style={{ position:'relative',zIndex:2,height:'100%',
                          display:'flex',alignItems:'center',padding:'0 14px',gap:12,cursor:'pointer' }}>
                        <div style={{ position:'relative',flexShrink:0 }}>
                          {isExpress && c.legs ? (
                            /* Stacked leg icons for locked express */
                            <div style={{ position:'relative',width:50,height:50 }}>
                              {c.legs.slice(0,3).map((leg,li)=>(
                                <img key={li} src={SPORT_ICONS[leg.sport]||footballIcon}
                                  style={{ position:'absolute',top:li*9,left:li*6,
                                    width:li===0?42:li===1?36:30,height:li===0?42:li===1?36:30,
                                    borderRadius:9,opacity:.12-li*.02,
                                    border:'1.5px solid rgba(255,255,255,.08)',
                                    padding:3,boxSizing:'border-box' as const,zIndex:3-li }} />
                              ))}
                              <div style={{ position:'absolute',inset:0,borderRadius:12,zIndex:10,
                                background:'rgba(4,2,13,.55)',display:'flex',alignItems:'center',justifyContent:'center' }}>
                                <img src={lockIcon} width={24} height={24} alt="" />
                              </div>
                            </div>
                          ) : (
                            <>
                              <img src={SPORT_ICONS[c.sport]||footballIcon} alt=""
                                style={{ width:50,height:50,borderRadius:12,opacity:.3 }}/>
                              <div style={{ position:'absolute',inset:0,borderRadius:12,
                                background:'rgba(4,2,13,.55)',display:'flex',alignItems:'center',justifyContent:'center' }}>
                                <img src={lockIcon} width={24} height={24} alt="" />
                              </div>
                            </>
                          )}
                        </div>
                        <div style={{ flex:1,minWidth:0 }}>
                          <div style={{ height:7,width:'45%',borderRadius:4,background:'rgba(255,255,255,.07)',marginBottom:8 }}/>
                          <div style={{ height:12,width:'78%',borderRadius:4,background:'rgba(255,255,255,.05)',marginBottom:8 }}/>
                          <div style={{ height:7,width:'52%',borderRadius:4,background:'rgba(255,255,255,.04)' }}/>
                        </div>
                        <div style={{ flexShrink:0,width:52,height:50,borderRadius:12,
                          background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.07)',
                          display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:3 }}>
                          <img src={lockIcon} width={18} height={18} alt="" style={{ opacity:.4 }}/>
                          <span style={{ fontFamily:mono,fontSize:7.5,fontWeight:700,
                            color:'rgba(255,255,255,.28)',letterSpacing:'.08em',
                            textTransform:'uppercase' as const }}>PRO</span>
                        </div>
                      </div>
                    </>
                  ) : isProClosed ? (
                    /* ── PRO CLOSED: dark, no lock icon, ОТКРЫТЬ reveals in list ── */
                    <>
                      <div style={{ position:'absolute',inset:0,
                        background:'linear-gradient(90deg,rgba(4,2,13,.88) 0%,rgba(4,2,13,.65) 100%)' }}/>
                      <div style={{ position:'relative',zIndex:2,height:'100%',
                        display:'flex',alignItems:'center',padding:'0 14px',gap:12 }}>
                        {isExpress && c.legs ? (
                          <div style={{ position:'relative',width:52,height:50,flexShrink:0 }}>
                            {c.legs.slice(0,3).map((leg,li)=>(
                              <img key={li} src={SPORT_ICONS[leg.sport]||footballIcon}
                                style={{ position:'absolute',
                                  top:li*9, left:li*6,
                                  width:li===0?42:li===1?36:30, height:li===0?42:li===1?36:30,
                                  borderRadius:9, opacity:(1-li*.15)*.55,
                                  border:`1.5px solid ${leg.color}44`,
                                  background:`${leg.color}0D`, padding:3,
                                  boxSizing:'border-box' as const, zIndex:3-li }} />
                            ))}
                          </div>
                        ) : (
                          <img src={SPORT_ICONS[c.sport]||footballIcon} alt=""
                            style={{ width:50,height:50,borderRadius:12,opacity:.55,flexShrink:0 }}/>
                        )}
                        <div style={{ flex:1,minWidth:0 }}>
                          <div style={{ height:7,width:'45%',borderRadius:4,background:'rgba(255,255,255,.08)',marginBottom:8 }}/>
                          <div style={{ height:12,width:'78%',borderRadius:4,background:'rgba(255,255,255,.06)',marginBottom:8 }}/>
                          <div style={{ height:7,width:'52%',borderRadius:4,background:'rgba(255,255,255,.05)' }}/>
                        </div>
                        <div className="glow-lavender"
                          style={{ flexShrink:0,width:52,height:50,borderRadius:12 }}>
                          <M.button whileTap={{scale:.93}} onClick={()=>{ haptic('medium'); expandCard(c.id); openDetail(c) }}
                            style={{ width:'100%',height:'100%',borderRadius:12,cursor:'pointer',
                              background:'linear-gradient(135deg,#2D1065,#4C1D95)',
                              border:'1px solid rgba(167,139,250,.4)' as any,
                              display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:3 }}>
                            <img src={tapIcon} width={22} height={22} alt=""/>
                            <span style={{ fontFamily:mono,fontSize:7,fontWeight:700,color:'#C4B5FD',
                              letterSpacing:'.06em',textTransform:'uppercase' as const }}>открыть</span>
                          </M.button>
                        </div>
                      </div>
                    </>
                  ) : (<>

                  {/* PRO expanded glow border */}
                  {isProExpanded && (
                    <div style={{ position:'absolute',inset:0,borderRadius:16,pointerEvents:'none',zIndex:4,
                      boxShadow:`inset 0 0 0 1.5px ${SPORT_COLOR[c.sport]||'#A78BFA'}99,0 0 24px ${SPORT_COLOR[c.sport]||'#A78BFA'}18` }}/>
                  )}

                  {/* Free badge: only the chosen free signal */}
                  {!isPro && i===freeIdx && !isWeek && screen==='home-signals' && (
                    <div style={{ position:'absolute',top:8,left:10,zIndex:21,
                      padding:'3px 8px',borderRadius:8,
                      background:'rgba(52,211,153,.18)',border:'1px solid rgba(52,211,153,.45)',
                      fontFamily:mono,fontSize:7,fontWeight:800,
                      letterSpacing:'.18em',color:'#34D399' }}>БЕСПЛАТНО</div>
                  )}

                  {/* 🏦 Банкер дня: пик с максимальной калиброванной вероятностью,
                      прошедший все проверки (исторически заходят ~84%) */}
                  {c.isBanker && (
                    <div style={{ position:'absolute',top:8,right:10,zIndex:21,
                      padding:'3px 8px',borderRadius:8,
                      background:'rgba(234,179,8,.18)',border:'1px solid rgba(234,179,8,.5)',
                      fontFamily:mono,fontSize:7,fontWeight:800,
                      letterSpacing:'.14em',color:'#EAB308',
                      boxShadow:'0 0 12px rgba(234,179,8,.25)' }}>🏦 БАНКЕР ДНЯ</div>
                  )}

                  {/* Week: gradient overlay gold-tinted */}
                  {isWeek ? (
                    <div style={{ position:'absolute',inset:0,
                      background:'linear-gradient(180deg,rgba(4,2,13,.2) 0%,rgba(4,2,13,.1) 30%,rgba(20,12,0,.7) 65%,rgba(15,8,0,.97) 100%)' }}/>
                  ) : (
                    <div style={{ position:'absolute',inset:0,
                      background:'linear-gradient(90deg,rgba(4,2,13,.92) 0%,rgba(4,2,13,.6) 55%,rgba(4,2,13,.3) 100%)' }}/>
                  )}

                  {/* Week animated gold border */}
                  {isWeek && (
                    <div style={{ position:'absolute',inset:0,borderRadius:20,pointerEvents:'none',
                      animation:'week-glow 2.4s ease-in-out infinite' }}/>
                  )}

                  {/* Rarity (non-week, hide when БЕСПЛАТНО badge is showing) */}
                  {!isWeek && (isPro || i!==freeIdx || screen!=='home-signals') && (
                    <M.div initial={{opacity:0,scale:.6}} animate={{opacity:1,scale:1}}
                      transition={{delay:.1+i*.05,type:'spring'}}
                      style={{ position:'absolute',top:8,left:10,zIndex:3,display:'flex',alignItems:'center',gap:4 }}>
                      <div style={{ width:5,height:5,borderRadius:'50%',
                        background:RARITY[c.rarity].color,boxShadow:`0 0 6px ${RARITY[c.rarity].color}` }}/>
                      <span style={{ fontFamily:mono,fontSize:7.5,fontWeight:800,letterSpacing:'.12em',color:RARITY[c.rarity].color }}>{RARITY[c.rarity].label}</span>
                    </M.div>
                  )}

                  {/* Week crown + label */}
                  {isWeek && (
                    <div style={{ position:'absolute',top:12,left:14,zIndex:3,display:'flex',alignItems:'center',gap:6 }}>
                      <span style={{ fontSize:16 }}>👑</span>
                      <span style={{ fontFamily:mono,fontSize:8.5,fontWeight:800,letterSpacing:'.2em',color:'#EAB308' }}>ВЫБОР НЕДЕЛИ</span>
                    </div>
                  )}

                  {/* Fav star — top-right */}
                  <M.button whileTap={{scale:.82}} onClick={(e: React.MouseEvent)=>toggleFav(c,e)}
                    style={{ position:'absolute',top:8,right:10,zIndex:5,
                      width:32,height:32,borderRadius:9,cursor:'pointer',
                      background:isFav?'rgba(255,215,0,.22)':'rgba(0,0,0,.42)',
                      backdropFilter:'blur(6px)' as any,
                      border:isFav?'1px solid rgba(255,215,0,.45)':'1px solid rgba(255,255,255,.14)' as any,
                      display:'flex',alignItems:'center',justifyContent:'center',
                      fontSize:15,color:isFav?'#FFD700':'rgba(255,255,255,.65)',
                      boxShadow:isFav?'0 0 14px rgba(255,215,0,.45)':'none',transition:'all .2s' }}>
                    {isFav?'★':'☆'}
                  </M.button>

                  {/* WEEK card content */}
                  {isWeek && (
                    <div style={{ position:'absolute',bottom:0,left:0,right:0,zIndex:2,padding:'14px 16px' }}>
                      <div style={{ fontFamily:f,fontWeight:900,fontSize:20,lineHeight:1,marginBottom:6 }}>
                        {c.home} <span style={{ color:'rgba(255,255,255,.35)',fontWeight:400,fontSize:14 }}>vs</span> {c.away}
                      </div>
                      <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:8 }}>
                        <div style={{ padding:'3px 10px',borderRadius:7,
                          background:'rgba(234,179,8,.15)',border:'1px solid rgba(234,179,8,.4)',
                          fontFamily:f,fontWeight:700,fontSize:13,color:'#EAB308' }}>{c.rec}</div>
                        <div style={{ fontFamily:f,fontWeight:700,fontSize:14 }}>×{c.odds}</div>
                        <div style={{ fontFamily:mono,fontSize:10,color:'#34D399',fontWeight:700 }}>{c.ev}</div>
                        {/* Mini score ring */}
                        <div style={{ marginLeft:'auto' }}>
                          <svg width="42" height="42" viewBox="0 0 42 42">
                            <circle cx="21" cy="21" r="16" fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="3"/>
                            <circle cx="21" cy="21" r="16" fill="none" stroke="#EAB308" strokeWidth="3"
                              strokeDasharray={`${(c.score/100)*100} 100`} strokeLinecap="round" transform="rotate(-90 21 21)"/>
                            <text x="21" y="25" textAnchor="middle" fontFamily="monospace" fontSize="10"
                              fontWeight="900" fill="white">{c.score}</text>
                          </svg>
                        </div>
                      </div>
                      <div style={{ fontFamily:mono,fontSize:8,color:'rgba(255,255,255,.35)',letterSpacing:'.1em' }}>
                        {c.tag} · {c.date} · {c.time}
                      </div>
                    </div>
                  )}

                  {/* EXPRESS card content */}
                  {isExpress && (
                    <div style={{ position:'relative',zIndex:2,height:'100%',
                      display:'flex',alignItems:'center',padding:'0 14px',gap:10 }}>
                      {/* Stacked sport icons */}
                      <div style={{ position:'relative',width:52,height:50,flexShrink:0 }}>
                        {c.legs?.slice(0,3).map((leg,li)=>(
                          <img key={li} src={SPORT_ICONS[leg.sport]||footballIcon}
                            style={{ position:'absolute',
                              top:li*9, left:li*6,
                              width:li===0?42:li===1?36:30, height:li===0?42:li===1?36:30,
                              borderRadius:9,opacity:1-li*.15,
                              border:`1.5px solid ${leg.color}55`,
                              background:`${leg.color}15`, padding:3, boxSizing:'border-box' as const,
                              zIndex:3-li }} />
                        ))}
                      </div>
                      {/* Info */}
                      <div style={{ flex:1,minWidth:0 }}>
                        <div style={{ fontFamily:mono,fontSize:8,color:'rgba(255,255,255,.38)',letterSpacing:'.15em',marginBottom:4 }}>
                          {c.tag} · {c.time}
                        </div>
                        <div style={{ fontFamily:f,fontWeight:700,fontSize:12,lineHeight:1.3,marginBottom:5,
                          overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' as const }}>
                          {c.legs?.map(l=>l.match.split(' vs ')[0]).join(' + ')}
                        </div>
                        <div style={{ display:'flex',gap:7,alignItems:'center' }}>
                          <div style={{ padding:'2px 8px',borderRadius:5,
                            background:'rgba(249,115,22,.15)',border:'1px solid rgba(249,115,22,.35)',
                            fontFamily:f,fontWeight:700,fontSize:13,color:'#F97316' }}>×{c.odds}</div>
                          <div style={{ fontFamily:mono,fontSize:9,color:'#34D399',fontWeight:700 }}>{c.ev}</div>
                          <div style={{ fontFamily:mono,fontSize:9,color:'rgba(255,255,255,.4)' }}>Hit {c.hitPct}%</div>
                        </div>
                      </div>
                      <div className="glow-orange"
                        style={{ flexShrink:0,width:52,height:50,borderRadius:12 }}>
                        <M.button whileTap={{scale:.93}} onClick={()=>openDetail(c)}
                          style={{ width:'100%',height:'100%',borderRadius:12,cursor:'pointer',
                            background:'linear-gradient(135deg,#431407,#7c2d12)',
                            border:'1px solid rgba(249,115,22,.4)' as any,
                            display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:3 }}>
                          {isOpened
                            ? <span style={{ fontSize:18,lineHeight:1 }}>↗</span>
                            : <img src={tapIcon} width={22} height={22} alt=""/>}
                          <span style={{ fontFamily:mono,fontSize:7,fontWeight:700,color:'#FED7AA',letterSpacing:'.06em',textTransform:'uppercase' as const }}>{isOpened?'смотреть':'открыть'}</span>
                        </M.button>
                      </div>
                    </div>
                  )}

                  {/* SIGNAL / TOTAL card content */}
                  {(c.cardType==='signal'||c.cardType==='total') && (
                    <div style={{ position:'relative',zIndex:2,height:'100%',
                      display:'flex',alignItems:'center',padding:'0 14px',gap:12 }}>
                      <img src={SPORT_ICONS[c.sport]||footballIcon} alt=""
                        style={{ width:50,height:50,borderRadius:12,flexShrink:0,opacity:.85 }}/>
                      <div style={{ flex:1,minWidth:0 }}>
                        <div style={{ fontFamily:mono,fontSize:8,color:'rgba(255,255,255,.38)',letterSpacing:'.15em',marginBottom:4 }}>
                          {c.tag} · {c.time}
                        </div>
                        <div style={{ fontFamily:f,fontWeight:700,fontSize:14,lineHeight:1.2,
                          whiteSpace:'nowrap' as const,overflow:'hidden',textOverflow:'ellipsis',marginBottom:4 }}>
                          {c.home}{c.away?` vs ${c.away}`:''}
                        </div>
                        <div style={{ display:'flex',gap:8,alignItems:'center' }}>
                          {c.cardType==='total' && (
                            <div style={{ padding:'2px 7px',borderRadius:5,
                              background:'rgba(52,211,153,.15)',border:'1px solid rgba(52,211,153,.35)',
                              fontFamily:f,fontWeight:700,fontSize:11,color:'#34D399' }}>{c.rec}</div>
                          )}
                          {c.cardType==='signal' && (
                            <div style={{ padding:'3px 8px',borderRadius:6,
                              background:'rgba(139,92,246,.15)',border:'1px solid rgba(139,92,246,.3)',
                              fontFamily:f,fontWeight:700,fontSize:11,color:'#A78BFA' }}>{c.rec}</div>
                          )}
                          <div style={{ fontFamily:f,fontWeight:700,fontSize:13 }}>{c.odds}</div>
                          <div style={{ fontFamily:mono,fontSize:10,color:'#34D399',fontWeight:700 }}>{c.ev}</div>
                        </div>
                      </div>
                      <div className="glow-violet"
                        style={{ flexShrink:0,width:52,height:50,borderRadius:12 }}>
                        <M.button whileTap={{scale:.93}} onClick={()=>openDetail(c)}
                          style={{ width:'100%',height:'100%',borderRadius:12,cursor:'pointer',
                            background:c.cardType==='total'?'linear-gradient(135deg,#022c22,#064e3b)':'linear-gradient(135deg,#2D1065,#4C1D95)',
                            border:`1px solid ${c.cardType==='total'?'rgba(52,211,153,.4)':'rgba(167,139,250,.4)'}` as any,
                            display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:3 }}>
                          {isOpened
                            ? <span style={{ fontSize:18,lineHeight:1 }}>↗</span>
                            : <img src={tapIcon} width={22} height={22} alt=""/>}
                          <span style={{ fontFamily:mono,fontSize:7,fontWeight:700,
                            color:c.cardType==='total'?'#6EE7B7':'#C4B5FD',letterSpacing:'.06em',textTransform:'uppercase' as const }}>{isOpened?'смотреть':'открыть'}</span>
                        </M.button>
                      </div>
                    </div>
                  )}

                  {/* Week open button (bottom right) */}
                  {isWeek && (
                    <M.button whileTap={{scale:.95}} onClick={()=>openDetail(c)}
                      style={{ position:'absolute',bottom:14,right:14,zIndex:5,
                        padding:'8px 16px',borderRadius:11,cursor:'pointer',
                        background:'rgba(234,179,8,.2)',border:'1px solid rgba(234,179,8,.5)' as any,
                        fontFamily:f,fontWeight:700,fontSize:11,color:'#EAB308',
                        display:'flex',alignItems:'center',gap:6 }}>
                      {isOpened ? 'Смотреть' : 'Открыть'} <span>→</span>
                    </M.button>
                  )}
                  </>)}

                </M.div>
              )

              // Во вкладке «Избранное» — свайп влево для удаления (как в
              // мессенджерах). В остальных вкладках карточка как есть.
              return screen==='home-favorites'
                ? <SwipeRow key={c.id} height={cardH} radius={isWeek?20:16}
                    onDelete={()=>removeFav(c)}>{cardEl}</SwipeRow>
                : <div key={c.id}>{cardEl}</div>
            })}
          </div>
        )}
      </div>

      <style>{`
        @keyframes week-glow {
          0%,100%{box-shadow:inset 0 0 0 1.5px rgba(234,179,8,.4),0 0 20px rgba(234,179,8,.1)}
          50%{box-shadow:inset 0 0 0 2px rgba(234,179,8,.8),0 0 40px rgba(234,179,8,.3)}
        }
      `}</style>
    </M.div>
  )
}
