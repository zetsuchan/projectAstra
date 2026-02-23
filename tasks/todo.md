# Project Astra - Task Tracking

> Current tasks and progress for the development session

## Active Tasks

_No active tasks_

## Completed

- [x] Phase 1: Install deps (ai, @openrouter/ai-sdk-provider, vitest, playwright, pglite, testing-library) and update schema (relationships moon/rising/compat, tarotPulls spread/cards, HNSW indexes)
- [x] Phase 2: Chat persistence + streaming (AI SDK with OpenRouter, DB persistence, streaming responses, auto thread creation, thread title generation)
- [x] Phase 3: Diary CRUD (GET list w/ cursor pagination, POST create, GET single, PATCH update, DELETE, fire-and-forget AI reflections, page wired to real API)
- [x] Phase 4: Relationships feature (CRUD endpoints, AI compatibility reads cached in JSONB, 7-day cache invalidation, relationships page with card grid + detail sheet + add flow)
- [x] Phase 5: Tarot feature (78-card deck data, crypto-secure Fisher-Yates shuffle, single/three-card spreads, 1/day rate limit, AI interpretations, CSS 3D flip cards, tarot page)
- [x] Phase 6: Vector indexes + search utilities (HNSW indexes in schema, generateEmbedding via OpenAI, searchMemories + searchKnowledgeBase with cosine similarity)
- [x] Phase 7: Test infrastructure (vitest config, test setup, privy mocks, 10 passing API tests, playwright config, E2E test stubs)

## Blocked

_None_

## Remaining (not in current MVP scope)

- [ ] Run `bun run db:push` when database is available
- [ ] Add `OPENAI_API_KEY` to `.env.local` for vector search
- [ ] Install Playwright browsers: `bunx playwright install`
- [ ] Manual E2E flow verification when DB is live

---

## Review Notes

### Session: MVP Completion (2026-02-22)
- All 7 phases of the MVP completion plan implemented
- TypeScript compiles cleanly, Next.js build succeeds
- 10/10 unit tests passing
- Core loop: onboard → chat (persistent + streaming) → diary (CRUD + AI reflections) → relationships (compat reads) → tarot (daily card ritual)
- Hono app extracted to `app.ts` for testability, `route.ts` is thin re-export
