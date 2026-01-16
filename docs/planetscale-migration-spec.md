# PlanetScale Migration Spec (Postgres)

## Summary
Replace the current datastore with PlanetScale for Postgres as the primary database. This spec covers schema mapping, data access approach, and the implementation steps required for the switch.

## Goals
- Lower ongoing database cost while keeping the data model intact.
- Use a relational schema that maps cleanly from the current entities.
- Keep the API surface stable for client features (chat, diary, feed, tarot).

## Non-Goals
- Re-architecting product features.
- Building a full analytics stack.
- Finalizing vector/embedding storage (called out as an open decision).

## Decisions / Assumptions
- **Primary DB:** PlanetScale for Postgres (GA as of 2025-09-22).
- **Access layer:** Use a typed ORM/query builder (proposed: Prisma; alternative: Drizzle or Kysely).
- **IDs:** Use `UUID` for primary keys.
- **Timestamps:** Use `TIMESTAMPTZ` for `created_at` and `updated_at` (UTC).
- **JSON fields:** Use `JSONB` for flexible fields (settings, tags, raw payloads).
- **Plan:** Start on $5/month single-node Postgres (non-HA but production-ready); upgrade to HA/replicas as needed. Dev branches are $5/month; Query Insights, schema recommendations, metrics, and branching are included.

## Schema Mapping (Current -> PlanetScale)
This keeps the same logical entities from `docs/data-model.md`, with Postgres-native types.

### users
- `user_id` (PK, UUID)
- `email` (string, nullable)
- `created_at` (timestamp)
- `timezone` (string)
- `persona_name` (string, nullable)
- `persona_style` (string, nullable)
- `diary_cadence` (enum: daily|weekly|off)
- `settings` (jsonb)

### charts
- `chart_id` (PK, UUID)
- `user_id` (FK -> users.user_id)
- `birth_date` (date)
- `birth_time` (time, nullable)
- `birth_time_precision` (enum: exact|approximate|unknown)
- `birth_location` (string, nullable)
- `sun_sign` (string)
- `moon_sign` (string, nullable)
- `rising_sign` (string, nullable)
- `raw_chart_payload` (jsonb, nullable)
- `created_at` (timestamp)

### relationships
- `relationship_id` (PK, UUID)
- `user_id` (FK -> users.user_id)
- `label` (string)
- `type` (enum: boyfriend|best_friend|situationship|custom)
- `person_name` (string)
- `chart_id` (FK -> charts.chart_id, nullable)
- `sun_sign` (string, nullable)
- `created_at` (timestamp)

### chat_threads
- `thread_id` (PK, UUID)
- `user_id` (FK -> users.user_id)
- `title` (string, nullable)
- `created_at` (timestamp)
- `updated_at` (timestamp)
- `memory_enabled` (boolean)
- `summary` (text, nullable)

### chat_messages
- `message_id` (PK, UUID)
- `thread_id` (FK -> chat_threads.thread_id)
- `user_id` (FK -> users.user_id)
- `role` (enum: user|assistant)
- `content` (text)
- `created_at` (timestamp)

### diary_entries
- `entry_id` (PK, UUID)
- `user_id` (FK -> users.user_id)
- `title` (string, nullable)
- `body` (text)
- `mood` (string, nullable)
- `prompt_id` (FK -> prompts.prompt_id, nullable)
- `astro_tags` (jsonb, nullable)
- `created_at` (timestamp)

### feed_items
- `feed_id` (PK, UUID)
- `type` (enum: personal|tea|prompt|celebrity)
- `title` (string)
- `body` (text)
- `tags` (jsonb)
- `created_at` (timestamp)
- `expires_at` (timestamp)
- `source` (enum: human|ai)

### feed_saves
- `save_id` (PK, UUID)
- `user_id` (FK -> users.user_id)
- `feed_id` (FK -> feed_items.feed_id)
- `created_at` (timestamp)

### tarot_pulls
- `pull_id` (PK, UUID)
- `user_id` (FK -> users.user_id)
- `card_id` (string)
- `interpretation` (text)
- `created_at` (timestamp)

### prompts
- `prompt_id` (PK, UUID)
- `type` (enum: daily|weekly)
- `text` (text)
- `created_at` (timestamp)

### memories
- `memory_id` (PK, UUID)
- `user_id` (FK -> users.user_id)
- `summary` (text)
- `created_at` (timestamp)

## Indexing (minimum)
- `chat_messages` on (`thread_id`, `created_at`)
- `diary_entries` on (`user_id`, `created_at`)
- `feed_items` on (`created_at`, `type`)
- `relationships` on (`user_id`)
- `feed_saves` on (`user_id`, `created_at`)

## API / Data Access Changes
- Replace existing queries and mutations with Hono API routes backed by PlanetScale.
- Introduce a DB layer package (e.g., `packages/db`) to centralize schema and queries.
- Use server-side generated IDs and timestamps; clients never write raw IDs.
- Add pagination patterns (cursor or offset) to replace live query subscriptions.

## Environment Variables
- `DATABASE_URL` (PlanetScale connection string)
- Optional: `DATABASE_URL_READONLY` for read replicas

## Migration Approach (high level)
1) Add DB layer + schema migrations.
2) Implement read/write endpoints for each feature domain.
3) Update web client to call new endpoints.
4) Backfill seed data (KB, tarot deck, prompts) via scripts.
5) Remove legacy datastore dependencies and config.
6) If migrating existing data, use PlanetScale Postgres migration guides.

## Open Decisions
- **Embeddings storage:** PlanetScale JSON table vs external vector store.
- **ORM choice:** Prisma vs Drizzle vs Kysely (lean toward Prisma for tooling).
- **ID strategy:** UUID vs ULID (needs consensus).

## Files to Update During Implementation
- `README.md` (tech stack: Data -> PlanetScale)
- `docs/privacy-architecture.md` (primary store)
- `docs/ai-chat-spec.md` (data note)
- `docs/ai-rag-architecture.md` (KB storage)
- `docs/onboarding-spec.md`, `docs/rolling-diary-spec.md`, `docs/daily-feed-spec.md` (data notes)
- `docs/data-model.md` (keep updated with schema changes)
