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
  const res = await fetch(`${BASE}${path}`, {
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
  user:    () => get<UserInfo>('/api/user'),
  signals: () => get<{ signals: Signal[]; isPro: boolean }>('/api/signals'),
  botSignals: () => get<ApiSignal[]>('/api/signals'),
  botExpress: () => get<ApiExpress[]>('/api/express'),
  botTotals:  () => get<ApiSignal[]>('/api/totals'),
  botWeek:    () => get<ApiSignal | null>('/api/week'),
  botStats:   () => get<ApiStats>('/api/stats'),
  // Избранное: сервер узнаёт юзера по x-init-data (подпись Telegram WebApp).
  // toggle → бот пришлёт уведомление об исходе матча; botFavorites отдаёт и
  // рассчитанные матчи за последние 12ч (result: win/lose + score)
  toggleFavorite: (sport: string, home: string, away: string) =>
    post<{ ok: boolean; favorited?: boolean }>('/api/favorite', { sport, home, away }),
  botFavorites: () => getLive<ApiFavorite[]>('/api/favorites'),
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
