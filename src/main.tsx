import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Telegram Mini App инициализация — обязательно до рендера
const tg = window.Telegram?.WebApp
if (tg) {
  tg.ready()       // убирает лоадер Telegram
  tg.expand()      // разворачивает на весь экран
  // Отключаем вертикальные свайпы чтобы не закрывало случайно
  try { (tg as any).disableVerticalSwipes?.() } catch {}
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
