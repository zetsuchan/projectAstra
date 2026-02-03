# Project Astra - The Learning Guide

> Making the stars feel a little closer

## Project Story

Project Astra is an astrology companion app that puts AI conversation at the center of the experience. Instead of static horoscope readings, users get a chat-first interface where they can explore their birth chart, understand planetary transits, and get personalized insights through natural conversation.

The app combines several experiences:
- **AI Chat** - The heart of Astra. Ask questions about your chart, get relationship compatibility reads, explore what Mercury retrograde actually means for *you*
- **Rolling Diary** - Journal entries tied to your astrological moments
- **Daily Feed** - Personalized cosmic weather and insights
- **Tarot Pulls** - Digital card readings with AI interpretation
- **Prediction Markets** - Bet on astrological predictions (will this full moon bring chaos?)

## Technical Architecture

### The Mental Map

```
┌─────────────────────────────────────────────────────────────────┐
│                        Next.js App Router                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   /chat     │  │   /feed     │  │       /markets          │  │
│  │  AI convos  │  │ Daily items │  │  Prediction markets     │  │
│  └──────┬──────┘  └──────┬──────┘  └───────────┬─────────────┘  │
│         │                │                      │                │
│         └────────────────┼──────────────────────┘                │
│                          ▼                                       │
│              ┌───────────────────────┐                          │
│              │    Hono API Router    │  ← Catch-all at /api     │
│              │   /api/[[...route]]   │                          │
│              └───────────┬───────────┘                          │
│                          │                                       │
│         ┌────────────────┼────────────────┐                     │
│         ▼                ▼                ▼                     │
│   ┌──────────┐    ┌──────────┐    ┌──────────────┐             │
│   │ OpenRouter│    │ Drizzle  │    │   Postgres   │             │
│   │    AI    │    │   ORM    │───▶│   Database   │             │
│   └──────────┘    └──────────┘    └──────────────┘             │
└─────────────────────────────────────────────────────────────────┘
```

**Why Hono?** The API uses Hono mounted as a Next.js catch-all route. Think of it like having an Express server living inside your Next.js app - you get the routing flexibility of a dedicated API framework while keeping everything in one deployment. The catch-all route at `api/[[...route]]/route.ts` captures everything under `/api/*` and hands it to Hono to route.

**Why Drizzle?** Drizzle ORM gives us type-safe database queries that feel like writing SQL, not fighting an ORM. The schema lives in one file (`db/schema.ts`), and the lazy-initialization pattern means the app won't crash at build time if there's no database connection - crucial for Vercel deploys.

### How Data Flows

1. **Chat Flow**: User message → Hono API → OpenRouter → AI response → Stored in `chat_messages` → Streamed back to client
2. **Feed Flow**: Cron job or manual trigger → Generate items → Store in `feed_items` → Client fetches latest
3. **Markets Flow**: Create market → Users place bets → Resolution → Payout calculation

## Codebase Structure

```
projectAstra/
├── apps/web/src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/[[...route]]/   # The Hono API lives here
│   │   ├── chat/               # AI conversation UI
│   │   ├── feed/               # Daily cosmic weather
│   │   └── markets/            # Prediction markets
│   ├── components/             # React components by feature
│   ├── db/
│   │   ├── schema.ts          # ⭐ The source of truth for data
│   │   └── index.ts           # Lazy DB connection
│   └── lib/
│       ├── api-types.ts       # Shared TypeScript types
│       └── api-client.ts      # Frontend fetch helpers
├── docs/                       # Product specs
└── tasks/                      # Session tracking
    ├── todo.md                # Current work
    └── lessons.md             # What we've learned
```

## Technology Choices

| Tech | Why We Chose It |
|------|-----------------|
| **Next.js 16** | App Router with React Server Components. The future is here. |
| **Hono** | Fast, lightweight API framework. Works everywhere - edge, serverless, or traditional. |
| **Drizzle** | Type-safe SQL. No magic, no surprises. |
| **PostgreSQL** | Relational data (users, charts, relationships) needs a relational DB. |
| **OpenRouter** | Access to multiple AI models through one API. Easy to switch models. |
| **Turborepo** | Ready for when we need more packages. Currently overkill but future-proof. |

### What We Rejected

- **Prisma**: Great DX but the client generation step adds complexity. Drizzle is lighter.
- **tRPC**: Considered for end-to-end type safety, but Hono with explicit types felt more flexible.
- **MongoDB**: Astrology data is relational (users have charts, charts have relationships, etc.)

## War Stories & Lessons

_This section will grow as we build..._

### Lazy Database Initialization

**The Problem**: Vercel builds the app without database access. Standard Drizzle initialization crashes at build time.

**The Solution**: A JavaScript Proxy that lazily initializes the connection on first use:

```typescript
// db/index.ts - The connection only happens when you actually query
export const db = new Proxy({} as Database, {
  get(_, prop) {
    if (!_db) _db = drizzle(/* connection */);
    return _db[prop];
  }
});
```

**The Lesson**: Build-time vs runtime is a real distinction. Design for both.

## Engineering Wisdom

- **Start with the schema**: The database schema is your contract. Get it right early.
- **Lazy is smart**: Don't initialize things until you need them.
- **One file per concern**: The schema in one file, the connection in another, types in their own place.
- **Type the boundaries**: Strong types at API boundaries catch bugs before they ship.

---

*This document grows with the project. Check back for updates.*
