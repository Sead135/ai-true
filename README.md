# Истинный интеллект — каркас

Псевдо-монорепо: Nest API + Next.js UI + общие типы. ТЗ — `description.txt`.

## Структура

```
ii-test/
  backend/           Nest.js + Drizzle + Swagger
  frontend/          Next.js + Tailwind
  packages/shared/   @ii/shared (типы)
```

## Быстрый старт

```bash
npm install && npm install --prefix backend && npm install --prefix frontend

cp .env.example .env
cp frontend/.env.example frontend/.env.local

npm run docker:up
npm run db:migrate          # когда появятся schema-миграции

npm run dev:backend         # :3000 · Swagger /docs
npm run dev:frontend        # :3001
```

## Прокси

`/api/...` на фронте → `API_URL/...` на Nest (префикс `/api` снимается).  
`API_URL` — в `frontend/.env.local`.

## БД

| `NEON_ENV` | URL                  | Где         |
| ---------- | -------------------- | ----------- |
| `local`    | `LOCAL_DATABASE_URL` | Docker      |
| `remote`   | `DATABASE_URL`       | Neon (прод) |

Дефолт `local`. Миграции: `db:generate` → `db:migrate` (на проде — до выката кода).  
Drizzle-клиент: `backend/src/database/db.ts` (`createDb`) — подключить в Nest при первом репозитории.

## Скрипты

`dev:backend` · `dev:frontend` · `docker:up/down` · `db:migrate` · `lint` · `fmt`
