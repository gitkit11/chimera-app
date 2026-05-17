export function haptic(type: 'light' | 'medium' = 'light') {
  try {
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred(type)
  } catch {}
}
