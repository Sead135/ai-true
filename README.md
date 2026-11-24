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
npm run db:migrate
npm run db:seed             # 2 компании · 3 филиала · admin + client

npm run dev:backend         # :3000 · Swagger /docs
npm run dev:frontend        # :3001
```

Тестовые логины (пароль `password123`): `admin@ii.local` (все компании), `client@severny.local` (только «Северный Вкус»).

## Прокси

`/api/...` на фронте → `API_URL/...` на Nest (префикс `/api` снимается).  
`API_URL` — в `frontend/.env.local`.

## БД

| `NEON_ENV` | URL                  | Где         |
| ---------- | -------------------- | ----------- |
| `local`    | `LOCAL_DATABASE_URL` | Docker      |
| `remote`   | `DATABASE_URL`       | Neon (прод) |

Дефолт `local`. Миграции: `db:generate` → `db:migrate` (на проде — до выката кода).  
Drizzle подключён через `DatabaseModule`. Auth: httpOnly cookies + глобальный JWT guard (`@Public()` только login/refresh/health) · `GET /auth/me` · Swagger `/docs`.

## Скрипты

`dev:backend` · `dev:frontend` · `docker:up/down` · `db:migrate` · `db:seed` · `lint` · `fmt`
