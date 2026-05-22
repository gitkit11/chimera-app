const MS = { light: 30, medium: 60, heavy: 100 } as const

export function haptic(type: 'light' | 'medium' | 'heavy' = 'light') {
  // iOS Telegram: HapticFeedback API
  try { window.Telegram?.WebApp?.HapticFeedback?.impactOccurred(type) } catch {}
  // Android fallback: navigator.vibrate
  try { navigator.vibrate?.(MS[type]) } catch {}
}

export function hapticNotify(type: 'success' | 'error' | 'warning' = 'success') {
  try { window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred(type) } catch {}
  try { navigator.vibrate?.(type === 'error' ? [40, 30, 40] : 35) } catch {}
}
