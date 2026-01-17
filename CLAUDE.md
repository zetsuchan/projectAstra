# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Project Astra is an astrology companion app with chat-first AI, rolling diary, daily feed, relationship reads, tarot pulls, and prediction markets. The codebase is a Turborepo monorepo with a Next.js web app.

## Commands

**Use `bun` instead of `npm` for all commands.**

```bash
# Development
bun run dev              # Run all apps in dev mode (from root)
bun run build            # Build all apps
bun run lint             # Lint all apps
bun run format           # Format with Prettier

# Web app (run from apps/web/)
bun run dev              # Next.js dev server at localhost:3000

# Database (run from apps/web/)
bun run db:generate      # Generate Drizzle migrations
bun run db:migrate       # Run migrations
bun run db:push          # Push schema directly (dev only)
bun run db:studio        # Open Drizzle Studio GUI
bun run db:seed          # Seed database with sample data

# Install dependencies
bun install              # Faster than npm install

# Issue tracking (beads)
bd ready                 # Find available work
bd show <id>             # View issue details
bd update <id> --status in_progress
bd close <id>            # Complete work
bd sync                  # Sync with git
```

## Architecture

### Monorepo Structure
- `apps/web/` - Next.js 16.1 web application (only current app)
- `packages/` - Shared packages (not yet created)
- `docs/` - Product specs and architecture docs

### Web App (`apps/web/src/`)
- `app/` - Next.js App Router pages
  - `api/[[...route]]/route.ts` - Hono API catch-all route
  - `chat/`, `feed/`, `markets/` - Feature pages
- `db/` - Drizzle ORM setup
  - `schema.ts` - All database tables
  - `index.ts` - Lazy-initialized DB connection via proxy
- `lib/` - Shared utilities
  - `api-types.ts` - TypeScript types for API responses
  - `api-client.ts` - Frontend API fetch helpers
- `components/` - React components organized by feature

### API Layer
The API uses Hono mounted at `/api` via Next.js catch-all route. Endpoints:
- `GET /api/health` - Health check
- `GET /api/feed` - Daily feed items
- `GET /api/feed/trending` - Trending topics from feed tags
- `GET /api/markets/overview` - Prediction markets data
- `GET/POST /api/chat/threads/:threadId/messages` - Chat messages

AI chat uses OpenRouter (configured via `OPENROUTER_API_KEY` env var).

### Database
PostgreSQL with Drizzle ORM. Key tables: users, charts, relationships, chat_threads, chat_messages, diary_entries, feed_items, tarot_pulls, prediction_markets, memories.

The DB connection is lazy-initialized to avoid build-time errors when `DATABASE_URL` isn't available.

## Environment Variables

Required in `apps/web/.env.local`:
- `DATABASE_URL` - PostgreSQL connection string
- `OPENROUTER_API_KEY` - For AI chat functionality
- `OPENROUTER_MODEL` - Optional, defaults to nvidia/nemotron-3-nano-30b-a3b:free

## Session Completion Protocol

When ending a work session, always:
1. Create issues for remaining work with `bd create`
2. Run quality gates if code changed
3. Update issue status with `bd update` or `bd close`
4. Push to remote: `git pull --rebase && bd sync && git push`
