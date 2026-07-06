import { create } from 'zustand'

export type Screen =
  | 'splash'
  | 'cover'
  | 'stake-select'
  | 'card-reveal'
  | 'signal-cards'
  | 'paywall'
  | 'verify'
  | 'stawki-steps'
  | 'home'
  | 'home-signals'
  | 'home-express'
  | 'home-totals'
  | 'home-week'
  | 'home-favorites'
  | 'profile'
  | 'support'
  | 'support-chat'

interface FunnelState {
  screen: Screen
  stake: number
  favorites: string[]
  isPro: boolean
  proDaysLeft: number
  cardOpen: boolean
  funnelSignalIdx: number | null
  viewedCardIds: string[]
  expandedCardIds: string[]
  go: (s: Screen) => void
  setStake: (v: number) => void
  addFavorite: (id: string) => void
  removeFavorite: (id: string) => void
  isFavorite: (id: string) => boolean
  setPro: (v: boolean) => void
  setProDaysLeft: (v: number) => void
  setCardOpen: (v: boolean) => void
  setFunnelSignalIdx: (i: number | null) => void
  markViewed: (id: string) => void
  expandCard: (id: string) => void
}

const DEV_PRO_KEY = 'chimera_dev_pro'

// Персист «открытых» карточек в списке между запусками: юзер открыл карту →
// закрыл приложение → снова открыл → карта всё ещё помечена «открыто»
// (кнопка «Смотреть», а не «Открыть»), заново открывать не нужно.
const LS_VIEWED   = 'chimera_viewed_cards'
const LS_EXPANDED = 'chimera_expanded_cards'
function readIds(key: string): string[] {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : [] } catch { return [] }
}
function writeIds(key: string, ids: string[]) {
  try { localStorage.setItem(key, JSON.stringify(ids.slice(-60))) } catch { /* ignore */ }
}

export const useFunnel = create<FunnelState>((set, get) => ({
  screen: 'splash',
  stake: 100,
  favorites: [],
  isPro: localStorage.getItem(DEV_PRO_KEY) === '1',
  proDaysLeft: 7,
  cardOpen: false,
  funnelSignalIdx: null,
  viewedCardIds: readIds(LS_VIEWED),
  expandedCardIds: readIds(LS_EXPANDED),
  go: (screen) => set(s => {
    // Pro никогда не попадает в онбординг-воронку — любой переход туда
    // (включая кнопку «назад» с главного экрана) уводит на home.
    // paywall не блокируем: Pro может открыть его для продления.
    const FUNNEL: Screen[] = ['cover', 'stake-select', 'card-reveal',
                              'signal-cards', 'verify', 'stawki-steps']
    if (s.isPro && FUNNEL.includes(screen)) return { screen: 'home' as Screen }
    return { screen }
  }),
  setStake: (stake) => set({ stake }),
  addFavorite: (id) => set(s => ({ favorites: s.favorites.includes(id) ? s.favorites : [...s.favorites, id] })),
  removeFavorite: (id) => set(s => ({ favorites: s.favorites.filter(f => f !== id) })),
  isFavorite: (id) => get().favorites.includes(id),
  setPro: (isPro) => { localStorage.setItem(DEV_PRO_KEY, isPro ? '1' : '0'); set({ isPro }) },
  setProDaysLeft: (proDaysLeft) => set({ proDaysLeft }),
  setCardOpen: (cardOpen) => set({ cardOpen }),
  setFunnelSignalIdx: (funnelSignalIdx) => set({ funnelSignalIdx }),
  markViewed: (id) => set(s => {
    if (s.viewedCardIds.includes(id)) return s
    const next = [...s.viewedCardIds, id]; writeIds(LS_VIEWED, next)
    return { viewedCardIds: next }
  }),
  expandCard: (id) => set(s => {
    if (s.expandedCardIds.includes(id)) return s
    const next = [...s.expandedCardIds, id]; writeIds(LS_EXPANDED, next)
    return { expandedCardIds: next }
  }),
}))
