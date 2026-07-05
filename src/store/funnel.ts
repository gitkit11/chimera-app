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

export const useFunnel = create<FunnelState>((set, get) => ({
  screen: 'splash',
  stake: 100,
  favorites: [],
  isPro: localStorage.getItem(DEV_PRO_KEY) === '1',
  proDaysLeft: 7,
  cardOpen: false,
  funnelSignalIdx: null,
  viewedCardIds: [],
  expandedCardIds: [],
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
  markViewed: (id) => set(s => ({ viewedCardIds: s.viewedCardIds.includes(id) ? s.viewedCardIds : [...s.viewedCardIds, id] })),
  expandCard: (id) => set(s => ({ expandedCardIds: s.expandedCardIds.includes(id) ? s.expandedCardIds : [...s.expandedCardIds, id] })),
}))
