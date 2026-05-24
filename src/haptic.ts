/* eslint-disable @typescript-eslint/no-explicit-any */

// Direct native event names used by Telegram Mini Apps
const EVT = 'web_app_trigger_haptic_feedback'

// Android vibration fallback durations (ms)
const MS = { light: 30, medium: 60, heavy: 100 } as const

function postTgEvent(data: object): boolean {
  const w = window as any
  // iOS / Android Telegram WebView — most reliable path
  if (typeof w.TelegramWebviewProxy?.postEvent === 'function') {
    w.TelegramWebviewProxy.postEvent(EVT, JSON.stringify(data))
    return true
  }
  // Desktop Telegram (Windows/macOS)
  if (typeof w.external?.notify === 'function') {
    w.external.notify(JSON.stringify({ eventType: EVT, eventData: data }))
    return true
  }
  return false
}

export function haptic(style: 'light' | 'medium' | 'heavy' = 'light') {
  // 1. Native proxy — bypasses all wrappers, works in any Telegram version
  try { postTgEvent({ type: 'impact', impact_style: style }) } catch {}
  // 2. High-level fallback (in case proxy path changes in future Telegram versions)
  try { (window as any).Telegram?.WebApp?.HapticFeedback?.impactOccurred(style) } catch {}
  // 3. Android system vibration (works outside Telegram too)
  try { navigator.vibrate?.(MS[style]) } catch {}
}

export function hapticNotify(type: 'success' | 'error' | 'warning' = 'success') {
  try { postTgEvent({ type: 'notification', notification_type: type }) } catch {}
  try { (window as any).Telegram?.WebApp?.HapticFeedback?.notificationOccurred(type) } catch {}
  try { navigator.vibrate?.(type === 'error' ? [40, 30, 40] : 35) } catch {}
}

export function hapticSelect() {
  try { postTgEvent({ type: 'selection_change' }) } catch {}
  try { (window as any).Telegram?.WebApp?.HapticFeedback?.selectionChanged() } catch {}
  try { navigator.vibrate?.(10) } catch {}
}
