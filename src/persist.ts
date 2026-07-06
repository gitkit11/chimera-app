// Постоянное хранилище состояния между запусками мини-аппа.
// Проблема: Telegram при ПОЛНОМ закрытии часто очищает localStorage, поэтому
// «открытые» карточки и последняя категория пропадали. Решение: пишем в
// Telegram CloudStorage (он переживает закрытие), а localStorage держим как
// быстрый синхронный кэш/фолбэк.

function cloud(): any {
  try { return (window as any).Telegram?.WebApp?.CloudStorage || null } catch { return null }
}

// Синхронно пишем в localStorage (мгновенно) + асинхронно в CloudStorage.
export function persistSet(key: string, val: string) {
  try { localStorage.setItem(key, val) } catch { /* ignore */ }
  const cs = cloud()
  try { cs?.setItem?.(key, val, () => {}) } catch { /* ignore */ }
}

// Синхронное чтение из localStorage (для мгновенной инициализации стора).
export function persistGetLocal(key: string): string | null {
  try { return localStorage.getItem(key) } catch { return null }
}

// Асинхронная догрузка из CloudStorage (на старте приложения). Если Telegram
// вычистил localStorage — восстановит оттуда. Возвращает через callback.
export function persistLoadCloud(keys: string[], cb: (data: Record<string, string>) => void) {
  const cs = cloud()
  if (!cs?.getItems) { cb({}); return }
  try {
    cs.getItems(keys, (err: any, res: Record<string, string>) => cb(err ? {} : (res || {})))
  } catch {
    cb({})
  }
}
