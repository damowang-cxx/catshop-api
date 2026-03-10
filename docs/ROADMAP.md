# Roadmap

## Phase 1

- replace in-memory services with Prisma repositories
- add migrations
- seed real demo data
- persist admin/product/order operations

## Phase 2

- inventory reservation and ledger transaction flow
- Stripe webhook ingestion
- shipment and return persistence
- audit log persistence

## Phase 3

- background jobs with BullMQ
- media derivative generation
- Meilisearch index sync
- front-end revalidate job

## Phase 4

- analytics event ingestion to ClickHouse
- daily aggregated report jobs
- customer segmentation and channel attribution

## Phase 5

- RBAC data scope
- admin action audit views
- rate limiting and abuse controls
- observability and alerting
