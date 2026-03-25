# CatShop API

CatShop API is the independent backend for the CatShop storefront and admin panel.

## Stack

- `NestJS 11` + `Fastify`
- `TypeScript` + `Node.js 22`
- `Prisma` + `PostgreSQL 16`
- `Redis 7` + `BullMQ`
- `MinIO / S3`
- `ClickHouse`
- `Meilisearch`

## What is implemented

- Shared NestJS monolith skeleton by domain:
  - `auth`
  - `catalog`
  - `cart`
  - `order`
  - `content`
  - `media`
  - `analytics`
  - `inventory`
  - `customer`
  - `search`
- Prisma-backed persistence for:
  - customer auth
  - admin auth and roles
  - products / collections / brands
  - cart
  - orders
  - inventory reservations and commits
- Fastify bootstrap with:
  - validation
  - Swagger
  - cookie support
  - rate limiting
  - multipart upload
  - static upload hosting
- Prisma schema covering product, order, user, inventory, audit, import/export, and analytics facts
- Docker Compose for local dependencies

## Frontend contract

This backend keeps the current frontend contract stable:

- `GET /api/products`
- `GET /api/products/:handleOrId`
- `GET /api/products/:id/recommendations`
- `POST /api/products`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`
- `POST /api/products/bulk`
- `GET /api/collections`
- `GET /api/collections/:handleOrId`
- `GET /api/collections/:handle/products`
- `POST /api/collections`
- `PUT /api/collections/:id`
- `DELETE /api/collections/:id`
- `POST /api/collections/bulk`
- `GET /api/orders`
- `GET /api/orders/:id`
- `POST /api/orders`
- `PATCH /api/orders/:id`
- `POST /api/orders/:id/shipments`
- `POST /api/orders/:id/returns`
- `POST /api/orders/bulk`
- `POST /api/upload`
- `GET /api/stats`
- `GET /api/health`

Response contracts already aligned:

- pagination: `{ items, total, page, pageSize }`
- bulk request: `{ action, ids, status? }`
- upload response: `{ url }`
- login response: `{ user, token }`

## Quick start

Recommended: start both frontend and backend from the parent workspace root:

```bash
cd ..
pnpm install
pnpm dev
```

If you only want to run the API project itself, use the steps below.

1. Copy env:

```bash
cp .env.example .env
cp .env.compose.example .env.compose
```

2. Start dependencies:

```bash
docker compose --env-file .env.compose up -d postgres redis minio clickhouse meilisearch mailpit
```

3. Install dependencies, run migration, and seed:

```bash
pnpm install
pnpm prisma:generate
pnpm prisma:migrate:dev --name init_persistence
pnpm seed
```

4. Run API:

```bash
pnpm dev
```

5. Open Swagger:

`http://127.0.0.1:3001/api/docs`

## Google OAuth

To enable Google sign-in, set these variables in `.env`:

- `GOOGLE_AUTH_ENABLED=true`
- `GOOGLE_CLIENT_ID=...`
- `GOOGLE_CLIENT_SECRET=...`
- `GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback`

## Development accounts

- admin: `admin@example.com / admin123`
- customer: `alice@example.com / password123`
- the env file stores `ADMIN_PASSWORD_HASH` / `CUSTOMER_PASSWORD_HASH`, not plaintext passwords

## Local development notes

- API base URL: `http://127.0.0.1:3001/api`
- Uploaded files are stored under `storage/uploads`
- Core commerce domains now use PostgreSQL through Prisma
- `ADMIN_DEMO_TOKEN` is development-only and must not be set in production
- `PRISMA_CONNECT_ON_BOOT=true` is the recommended default for real integration environments

## Project files

- architecture: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- roadmap: [docs/ROADMAP.md](docs/ROADMAP.md)
- Prisma schema: [prisma/schema.prisma](prisma/schema.prisma)
- local infra: [docker-compose.yml](docker-compose.yml)

