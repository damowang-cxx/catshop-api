# Architecture

## Runtime shape

- `NestJS` modular monolith
- one deployable service
- one transactional database
- separate infra for cache, object storage, analytics, and search

## Layers

1. `controllers`
   - expose public and admin HTTP contracts
2. `services`
   - hold business logic and orchestration
3. `repositories`
   - currently represented by the in-memory `MockDatabaseService`
   - next step is Prisma-backed repositories per domain
4. `jobs / webhooks`
   - planned for payment callbacks, publish scheduling, search sync, analytics aggregation

## Domain split

- `auth`: customer/admin login, token issue, session lookup
- `catalog`: products, categories, brands, recommendations
- `cart`: storefront cart state
- `order`: checkout, status changes, shipments, returns, bulk order updates
- `media`: admin upload pipeline
- `analytics`: admin dashboard and report endpoints
- `inventory`: stock adjustments and future ledger workflows
- `customer`: admin-side customer list and management entry point
- `content`: menus and CMS pages

## Data strategy

- `PostgreSQL`
  - orders, inventory, products, users, admin, audit, import/export metadata
- `Redis`
  - cache, queue, distributed lock, short-lived checkout state
- `MinIO / S3`
  - original assets and processed derivatives
- `ClickHouse`
  - high-volume behavioral events and channel analytics
- `Meilisearch`
  - storefront and admin search index

## Current implementation state

- HTTP contracts are live and compile
- demo data is in memory to unblock frontend integration
- Prisma schema is ready, but repositories are not switched over yet
- this keeps local integration fast while preserving the production data model
