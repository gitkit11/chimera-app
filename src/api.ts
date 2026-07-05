let BASE = ''
let LIVE = ''  // живой API (cloudflare-туннель) — для POST и персональных данных

async function resolveBase(): Promise<void> {
  // Always fetch api-config.json first — server updates it automatically on each tunnel restart
  try {
    const r = await fetch(`${import.meta.env.BASE_URL}api-config.json`, { cache: 'no-store' })
    if (r.ok) {
      const cfg = await r.json()
      if (cfg.apiUrl) { BASE = cfg.apiUrl }
    }
  } catch { /* ignore */ }
  if (!BASE) BASE = import.meta.env.VITE_API_URL ?? ''

  // apiUrl может указывать на СТАТИЧЕСКИЕ снапшоты (gh-pages) — они не
  // принимают POST и не знают юзера. Для избранного нужен живой сервер:
  // его адрес бот публикует в tunnel-info.json при каждом рестарте туннеля.
  try {
    const r = await fetch(`${import.meta.env.BASE_URL}tunnel-info.json`, { cache: 'no-store' })
    if (r.ok) {
      const cfg = await r.json()
      if (cfg.tunnelUrl) { LIVE = cfg.tunnelUrl }
    }
  } catch { /* ignore */ }
  if (!LIVE) LIVE = BASE
}

const _ready = resolveBase()

function initData(): string {
  return window.Telegram?.WebApp?.initData ?? ''
}

async function get<T>(path: string): Promise<T> {
  await _ready
  // cache:no-store + метка времени: браузер/CDN не имеют права отдать
  // старую (в т.ч. пустую) копию списка сигналов
  const sep = path.includes('?') ? '&' : '?'
  const res = await fetch(`${BASE}${path}${sep}t=${Date.now()}`, {
    cache: 'no-store',
    headers: {
      'x-init-data': initData(),
      'ngrok-skip-browser-warning': '1',
      'cf-skip-browser-warning': '1',
    },
  })
  if (!res.ok) throw new Error(`API ${path} → ${res.status}`)
  return res.json()
}

async function getLive<T>(path: string): Promise<T> {
  await _ready
  const res = await fetch(`${LIVE}${path}`, {
    cache: 'no-store',
    headers: {
      'x-init-data': initData(),
      'ngrok-skip-browser-warning': '1',
      'cf-skip-browser-warning': '1',
    },
  })
  if (!res.ok) throw new Error(`API ${path} → ${res.status}`)
  return res.json()
}

async function post<T>(path: string, body: unknown): Promise<T> {
  await _ready
  const res = await fetch(`${LIVE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-init-data': initData(),
      'ngrok-skip-browser-warning': '1',
      'cf-skip-browser-warning': '1',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`API ${path} → ${res.status}`)
  return res.json()
}


async function getWithLiveFallback<T>(path: string, isEmpty: (v: T) => boolean): Promise<T> {
  try {
    const v = await get<T>(path)
    if (!isEmpty(v)) return v
  } catch { /* статика недоступна — идём на живой сервер */ }
  return getLive<T>(path)
}

export interface UserInfo {
  user_id: number
  username: string
  first_name: string
  isPro: boolean
  daysLeft: number
}

export interface Signal {
  id: number
  sport: string
  teamA: string
  teamB: string
  league: string
  matchDate: string
  signal: string
  outcome: string
  result: string | null
  isCorrect: number | null
  // PRO only
  odds?: number
  ev?: number
  kelly?: number
  confidence?: number
}

export const api = {
  // Персональные данные — только через живой API (getLive): статический
  // origin отдаёт всем одинаковый снапшот и не знает юзера
  user:    () => getLive<UserInfo>('/api/user'),
  signals: () => get<{ signals: Signal[]; isPro: boolean }>('/api/signals'),
  // Карточки: сначала быстрые статические снапшоты; пусто/ошибка →
  // автоматический перезапрос с живого сервера (снапшоты обновляются раз
  // в 10 мин и CDN-грань может отдать пустую/старую копию)
  botSignals: () => getWithLiveFallback<ApiSignal[]>('/api/signals', v => !v || v.length === 0),
  botExpress: () => getWithLiveFallback<ApiExpress[]>('/api/express', v => !v || v.length === 0),
  botTotals:  () => getWithLiveFallback<ApiSignal[]>('/api/totals', v => !v || v.length === 0),
  botWeek:    () => getWithLiveFallback<ApiSignal | null>('/api/week', v => !v || !(v as any).team1),
  botStats:   () => get<ApiStats>('/api/stats'),
  // Избранное: сервер узнаёт юзера по x-init-data (подпись Telegram WebApp).
  // toggle → бот пришлёт уведомление об исходе матча; botFavorites отдаёт и
  // рассчитанные матчи за последние 12ч (result: win/lose + score)
  toggleFavorite: (sport: string, home: string, away: string) =>
    post<{ ok: boolean; favorited?: boolean }>('/api/favorite', { sport, home, away }),
  botFavorites: () => getLive<ApiFavorite[]>('/api/favorites'),
  // Воронка: бесплатный сигнал 4-го экрана (банкер дня) + фиксация выбора
  // (бот пришлёт пуш с исходом бесплатной ставки)
  funnelSignal: () => getLive<FunnelSignal>('/api/funnel-signal'),
  funnelPick: (sport: string, home: string, away: string) =>
    post<{ ok: boolean }>('/api/funnel-pick', { sport, home, away }),
}

export interface FunnelSignal {
  sport: string; team1: string; team2: string
  prediction: string; pick_team: string; odds: number
  confidence: number; matchTime: string; league: string; isBanker?: boolean
}

export interface ApiFavorite {
  sport: string; sportIcon?: string
  team1: string; team2: string
  prediction: string; odds: number | null
  matchTime: string; league: string
  result?: 'win' | 'lose'; score?: string
}

export interface ApiSignal {
  id: string; sport: string; type: string
  team1: string; team2: string; league: string; matchTime: string
  prediction: string; confidence: number; odds: number; ev: number
  rarity: string; chimera_score: number; isPro?: boolean
  agents?: { statistician?: string; scout?: string; arbiter?: string; llama?: string }
  signals_passed?: number; signals_total?: number
  avg_total?: number; avg_total_label?: string
  over_pct?: number; trend?: string; reasoning?: string
  total_line?: number; total_direction?: 'over' | 'under'; prob_over?: number
  isBanker?: boolean       // банкер дня: максимум одна карточка
  minOdds?: number | null  // минимальный кэф своей БК, ниже — не ставить
  lineMove?: number | null // движение линии, >0 = умные деньги за нас
}

export interface ApiExpress {
  id: string; sport: string; type: string
  legs: { sport: string; team1: string; team2: string; prediction: string; odds: number; color: string }[]
  totalOdds: number; confidence: number; rarity: string; isPro?: boolean; why?: string
}

export interface ApiStats {
  winrate: number; roi: number; total_signals: number; total_wins: number; last_updated: string
}
