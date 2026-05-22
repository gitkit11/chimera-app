let BASE = import.meta.env.VITE_API_URL ?? ''

async function resolveBase(): Promise<void> {
  if (BASE) return
  try {
    const r = await fetch('/chimera-app/api-config.json')
    if (r.ok) {
      const cfg = await r.json()
      if (cfg.apiUrl) { BASE = cfg.apiUrl; return }
    }
  } catch { /* ignore */ }
  BASE = window.location.origin
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
}
