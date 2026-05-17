interface TelegramWebApp {
  initData: string
  initDataUnsafe: Record<string, unknown>
  HapticFeedback: {
    impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void
    notificationOccurred(type: 'error' | 'success' | 'warning'): void
    selectionChanged(): void
  }
  ready(): void
  expand(): void
  close(): void
  BackButton: {
    show(): void
    hide(): void
    onClick(fn: () => void): void
    offClick(fn: () => void): void
    isVisible: boolean
  }
}

interface Window {
  Telegram?: {
    WebApp: TelegramWebApp
  }
}
