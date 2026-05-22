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

if (tg) {
  tg.ready()
  tg.expand()
  try { tgAny.disableVerticalSwipes?.() } catch {}

  try {
    tgAny.onEvent('viewportChanged', () => {
      tg.expand()
      setTimeout(updateAppHeight, 50)
      setTimeout(updateAppHeight, 300)
    })
  } catch {}
}

// resize — для браузера
window.addEventListener('resize', updateAppHeight)

// visibilitychange — когда Telegram возобновляет приложение после фона
// Несколько ретраев: viewport стабилизируется не сразу
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    try { tg?.expand() } catch {}
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

