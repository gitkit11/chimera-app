# Статус проекта Chimera AI

> Этот файл обновляется при каждом деплое. Читай его первым при старте сессии.

## Текущее состояние (май 2026)

**Бот РАБОТАЕТ на Windows VPS 24/7.**

- GitHub: `gitkit11/Chimera-ai-v09` (приватный, ветка `master`)
- Сайт: https://www.chimera-ai.tech/
- Telegram-бот: @Chimera_AI_Bet_bot

## Инфраструктура сервера

| Параметр | Значение |
|---|---|
| ОС | Windows Server |
| Путь к боту | `C:\chimera_bot` |
| Python | 3.11.9, venv в `C:\chimera_bot\venv` |
| Node.js | v20.18.1 |
| Сервис | NSSM (`chimera_bot`) — автозапуск |
| Claude Code | Установлен, запуск: `cd C:\chimera_bot && claude` |

**Управление сервисом:**
```
C:\nssm\nssm-2.24\win64\nssm.exe restart chimera_bot
C:\nssm\nssm-2.24\win64\nssm.exe status chimera_bot
```

## Архитектура (актуальная)

- `main.py` — ~719 строк (рефакторинг завершён)
- `handlers/` — 13 модулей (football, cs2, tennis, basketball, hockey, signals, admin, user, navigation, common, stats, express, chimera)
- `tests/` — 7 файлов

## ROI (апрель 2026, после фиксов)

| Спорт | ROI | Статус |
|---|---|---|
| Футбол | -22% → мониторинг | Фиксы задеплоены 09.04 |
| CS2 | -10% → мониторинг | Фиксы задеплоены 09.04 |
| Теннис | ~+9% | Стабильно |
| Хоккей | В норме | Стабильно |
| Баскетбол | ~0% | Намеренно высокие пороги, конец сезона NBA |

## Последние изменения с сервера (май 2026, 02.05)

Сервер прислал крупный патч (709 строк):
- `math_model.py` — значительные улучшения (+171 строк)
- `elo_calibrate.py` — большой рефакторинг (+324 строк)
- `background_tasks.py`, `database.py`, `agents.py`, `oracle_ai.py` — обновления
- `handlers/football.py`, `handlers/basketball.py`, `handlers/hockey.py` — фиксы
- `main.py` — новые функции (+22 строки)
- `sports/cs2/core.py`, `sports/cs2/agents.py` — улучшения CS2
- `sports/basketball/core.py`, `sports/hockey/core.py` — улучшения
Нужно: запросить у пользователя/сервера что именно было изменено.

## Что было сделано (апрель 2026)

10 критических багов исправлены (CS2 инверсия, Football min_ev=30%, MetaLearner MAX_EV_CAP, Scout кэш, и др.)
Агенты переписаны (пороги 62%+EV≥8%, draw_risk, injury_impact)
season_phase.py — авто-даты НХЛ/НБА
self_reflection.py — ежедневный AI-анализ в 23:00

## Открытые задачи

1. **ROI мониторинг** — ждём 7-10 дней после фиксов (старт 09.04)
2. **Tennis API** — trial истёк 22.04, нужно решение
3. **Backtesting модуль** — история сигналов с графиком ROI (для продажи подписок)
4. **team_intel** — подключить в агентов когда >10 команд накопится
