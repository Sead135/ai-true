# Точки — аналитический кабинет

Кабинет для клиентов с несколькими филиалами: показатели присутствия на геосервисах (просмотры, клики, звонки, маршруты, рейтинг, отзывы).

## Стек

| Слой     | Технологии                                               |
| -------- | -------------------------------------------------------- |
| Frontend | Next.js 16, React 19, Tailwind 4, HeroUI, TanStack Query |
| Backend  | NestJS 12, Drizzle ORM, JWT (httpOnly cookies), Swagger  |
| БД       | PostgreSQL 17 (Docker локально / Neon удалённо)          |
| Качество | oxlint, oxfmt, Vitest, lefthook                          |

## Структура

```
tochki/
  backend/            Nest API + Drizzle + миграции + seed
  frontend/           Next.js UI (кабинет, логин, регистрация)
```

## Требования

- Node.js 20+
- Docker (для локального Postgres)
- npm

## Быстрый старт

```bash
# зависимости
npm install
npm install --prefix backend
npm install --prefix frontend

# окружение
cp .env.example .env
cp frontend/.env.example frontend/.env.local

# БД → миграции → демо-данные
npm run docker:up
npm run db:migrate
npm run db:seed

# процессы (в двух терминалах)
npm run dev:backend    # http://localhost:3000  · Swagger /docs
npm run dev:frontend   # http://localhost:3001
```

Опционально оба процесса через [mprocs](https://github.com/pvolok/mprocs): `mprocs` (конфиг — `mprocs.yaml`).

### Демо-аккаунты

Пароль у обоих: `password123`

| Email                  | Роль   | Доступ                 |
| ---------------------- | ------ | ---------------------- |
| `admin@demo.local`     | admin  | все компании и филиалы |
| `client@severny.local` | client | только «Северный Вкус» |

Seed также создаёт: 2 компании, 3 филиала, ~30 дней метрик и отзывы.

`db:seed` делает `TRUNCATE` связанных таблиц — не запускайте на прод-данных.

## Переменные окружения

Корень (`.env`, см. `.env.example`):

| Переменная            | Назначение                                                         |
| --------------------- | ------------------------------------------------------------------ |
| `NEON_ENV`            | `local` (дефолт) → `LOCAL_DATABASE_URL`; `remote` → `DATABASE_URL` |
| `LOCAL_DATABASE_URL`  | Docker Postgres                                                    |
| `DATABASE_URL`        | Neon / прод (не указывайте seed’ом на прод)                        |
| `PORT`                | порт Nest (дефолт `3000`)                                          |
| `FRONTEND_ORIGIN`     | CORS, через запятую; cookies требуют credentials                   |
| `JWT_*`               | секреты и TTL access/refresh                                       |
| `API_URL`             | origin Nest для фронтового rewrite                                 |
| `AWS_*` / `S3_BUCKET` | Neon Object Storage (пресайны аватаров/логотипов)                  |

Фронт (`frontend/.env.local`): достаточно `API_URL=http://localhost:3000`.

## Скрипты (корень)

| Команда                             | Что делает                                 |
| ----------------------------------- | ------------------------------------------ |
| `npm run dev:backend`               | Nest в watch-режиме                        |
| `npm run dev:frontend`              | Next на `:3001`                            |
| `npm run docker:up` / `docker:down` | Postgres в Docker                          |
| `npm run db:migrate`                | применить миграции Drizzle                 |
| `npm run db:seed`                   | перезалить демо-данные                     |
| `npm run lint` / `fmt`              | oxlint / oxfmt                             |
| `npm test`                          | unit + e2e backend (нужны Postgres + seed) |

В `backend/`: также `db:generate`, `db:studio`, `test:watch`, `build`, `start:prod`.

## Архитектура

Два npm-пакета (`backend`, `frontend`) без shared-слоя: тип `Role` объявлен локально на каждой стороне.

```
Browser ──► Next.js (:3001)
               │  rewrite /api/* → Nest (префикс /api снимается)
               ▼
            NestJS (:3000)
               │  JWT guard (глобальный; @Public на login/refresh/logout/health)
               │  роли: admin | client + фильтрация по companyId
               ▼
            PostgreSQL  (companies → branches → daily_metrics / reviews
                         users.companyId для клиентов)
```

**Модули API:** `auth`, `companies`, `branches`, `users`, `stats`, `reviews`, `uploads`.

**Роли и изоляция:** admin видит всё; client — только свою компанию. Проверка на сервере (не только в UI); e2e-тест режет доступ к чужой компании/филиалу.

**Метрики и отзывы:** при seed данные приходят из mock-источников (`MockStatsSource`, `MockReviewsSource`) — имитация внешнего гео-API с идемпотентными ключами.

**Загрузки:** пресайн в S3-совместимое хранилище (Neon Object Storage), см. `neon.ts`.

**Auth:** httpOnly cookies `access_token` / `refresh_token` (Bearer тоже принимается). `GET /auth/me`, CORS с `FRONTEND_ORIGIN`. Документация — Swagger `/docs`.

## База данных

| `NEON_ENV` | URL                  | Где                                   |
| ---------- | -------------------- | ------------------------------------- |
| `local`    | `LOCAL_DATABASE_URL` | Docker (`backend/docker-compose.yml`) |
| `remote`   | `DATABASE_URL`       | Neon                                  |

Схема: `companies`, `branches`, `users`, `daily_metrics`, `reviews`.  
Изменения схемы: `npm run db:generate --prefix backend` → `npm run db:migrate`. На проде миграции — до выката кода.

## Тесты и git hooks

```bash
npm test   # Vitest: unit + e2e изоляции компаний
```

Нужны поднятый Postgres и выполненный seed.

Pre-commit (lefthook): `lint` → `fmt` → `test`. Хук ставится при `npm install` (`prepare`). Пропуск: `LEFTHOOK=0 git commit …`.

## Известные ограничения

- Метрики и отзывы — mock при seed, живой периодический импорт из внешнего API не крутится.
- Object Storage опционален: без `AWS_*` загрузка аватаров/логотипов не заработает.
- Нет отдельного CI-конфига в репозитории — качество держится на pre-commit и локальном `npm test`.
- Псевдо-монорепо: зависимости ставятся отдельно в корень / backend / frontend.
- Seed разрушительный (`TRUNCATE`).

## Масштабирование (ориентир на 500+ компаний)

- Индексы по `(company_id)`, `(branch_id, date)`; партиционирование `daily_metrics` по дате.
- Read-replica / connection pooler (PgBouncer / Neon pooler) для дашбордов.
- Агрегаты по дням/неделям заранее (materialized view или фоновые jobs), а не «сырой» scan за длинный период.
- Импорт метрик — очередь + идемпотентные ключи (как `mockKey` у отзывов), чтобы повторы не дублировали строки.
- Пагинация и жёсткие лимиты на всех list-эндпоинтах (уже есть зачатки на backend).
- При росте UI — CDN для статики Next и отдельный origin для API.
