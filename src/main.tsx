import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

const tg = window.Telegram?.WebApp
const tgAny = tg as any

// Последняя корректная высота — защита от кратковременно неверных значений при resume
let _lastH = 0

function updateAppHeight() {
  const stable = tgAny?.viewportStableHeight
  const candidate = (stable && stable > 300) ? stable
                  : (window.innerHeight > 300 ? window.innerHeight : 0)
  if (candidate > 300) {
    _lastH = candidate
    document.documentElement.style.setProperty('--app-height', `${candidate}px`)
  }
  // Если candidate ≤ 300 — не трогаем --app-height, оставляем последнее корректное значение
}

// Полноэкранный режим (Bot API 8.0+): Telegram рисует поверх статус-бара и своих
// кнопок закрытия/сворачивания. Прокидываем их отступы в CSS, чтобы контент не
// залезал под них. В обычном (expanded) режиме инсеты = 0 → ничего не меняется.
function updateSafeArea() {
  try {
    const sa  = tgAny?.safeAreaInset || {}
    const csa = tgAny?.contentSafeAreaInset || {}
    const top    = (sa.top || 0) + (csa.top || 0)
    const bottom = (sa.bottom || 0) + (csa.bottom || 0)
    document.documentElement.style.setProperty('--tg-safe-top', `${top}px`)
    document.documentElement.style.setProperty('--tg-safe-bottom', `${bottom}px`)
  } catch { /* ignore */ }
}

if (tg) {
  tg.ready()
  tg.expand()
  try { tgAny.disableVerticalSwipes?.() } catch {}

  // На весь экран, как нативное приложение (только новые клиенты — гейт по версии)
  try {
    if (tgAny.isVersionAtLeast?.('8.0') && tgAny.requestFullscreen) {
      tgAny.requestFullscreen()
    }
  } catch { /* старый клиент / десктоп — остаёмся в expanded */ }

  // Слушаем изменения безопасных зон + fullscreen
  for (const ev of ['safeAreaChanged', 'contentSafeAreaChanged', 'fullscreenChanged']) {
    try { tgAny.onEvent?.(ev, () => { updateSafeArea(); updateAppHeight() }) } catch {}
  }

  try {
    tgAny.onEvent('viewportChanged', () => {
      tg.expand()
      setTimeout(updateAppHeight, 50)
      setTimeout(updateAppHeight, 300)
    })
  } catch {}

  updateSafeArea()
}

// resize — для браузера
window.addEventListener('resize', updateAppHeight)

// visibilitychange — когда Telegram возобновляет приложение после фона
// Несколько ретраев: viewport стабилизируется не сразу
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    try { tg?.expand() } catch {}
    updateSafeArea()
    setTimeout(updateAppHeight, 100)
    setTimeout(updateAppHeight, 400)
    setTimeout(updateAppHeight, 900)
  }
})

// pageshow — iOS Safari / Telegram WebView при возврате из фона
window.addEventListener('pageshow', () => {
  try { tg?.expand() } catch {}
  setTimeout(updateAppHeight, 100)
  setTimeout(updateAppHeight, 400)
})

updateAppHeight()

// Fallback: если --app-height не установилась (старый кэш, браузер без Telegram)
if (_lastH === 0) {
  document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`)
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

