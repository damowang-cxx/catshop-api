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
- Frontend-compatible API placeholders and demo data
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
```

2. Start dependencies:

```bash
docker compose up -d postgres redis minio clickhouse meilisearch mailpit
```

3. Install and generate Prisma client:

```bash
pnpm install
pnpm prisma:generate
```

4. Run API:

```bash
pnpm dev
```

5. Open Swagger:

`http://localhost:3001/api/docs`

## Demo admin account

- email: `admin@example.com`
- password: `admin123`

## Local development notes

- API base URL: `http://localhost:3001/api`
- Uploaded files are stored under `storage/uploads`
- Current service layer uses in-memory demo data for fast local integration
- Prisma schema and seed are ready for the next step: replacing demo repositories with database repositories

## Project files

- architecture: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- roadmap: [docs/ROADMAP.md](docs/ROADMAP.md)
- Prisma schema: [prisma/schema.prisma](prisma/schema.prisma)
- local infra: [docker-compose.yml](docker-compose.yml)
