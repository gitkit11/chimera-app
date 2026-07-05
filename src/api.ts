let BASE = ''

async function resolveBase(): Promise<void> {
  // Always fetch api-config.json first — server updates it automatically on each tunnel restart
  try {
    const r = await fetch(`${import.meta.env.BASE_URL}api-config.json`, { cache: 'no-store' })
    if (r.ok) {
      const cfg = await r.json()
      if (cfg.apiUrl) { BASE = cfg.apiUrl; return }
    }
  } catch { /* ignore */ }
  // Fallback to build-time URL
  BASE = import.meta.env.VITE_API_URL ?? ''
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
}

export interface ApiExpress {
  id: string; sport: string; type: string
  legs: { sport: string; team1: string; team2: string; prediction: string; odds: number; color: string }[]
  totalOdds: number; confidence: number; rarity: string; isPro?: boolean; why?: string
}

export interface ApiStats {
  winrate: number; roi: number; total_signals: number; total_wins: number; last_updated: string
}
