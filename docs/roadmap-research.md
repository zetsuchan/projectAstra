# Roadmap & Research

Last updated: Jan 16, 2026

---

## Research Findings

### Authentication + Wallet (Recommendation: Privy)

**Why Privy over Auth.js + separate wallet:**
- Unified auth + wallet solution (no need for Auth.js AND wallet adapter)
- Free tier: 10K MAU (vs Clerk's 10K, Dynamic's 1K)
- Acquired by Stripe (June 2025) - fiat onramps coming
- Transaction-based pricing suits prediction markets (occasional bets, not high-frequency)
- Embedded wallet auto-creation on social login
- Explicitly built for prediction market use cases

**Pricing at scale:**
- 10K MAU: Free
- 50K MAU: ~$750/mo (transaction-based)
- 100K MAU: ~$2,000/mo

**vs Dynamic:**
- Dynamic: 500+ wallets, pre-built UI, $499/mo at 10K MAU
- Privy: Better free tier, Stripe backing, auth-first philosophy
- Choose Dynamic if you need extensive multi-chain beyond Solana

**Implementation notes:**
- Privy replaces Auth.js entirely (handles social login + wallets)
- Auto-create embedded wallet for social login users
- Keep point system as primary, crypto as optional upgrade
- Use devnet until regulatory clarity

**Packages:** `@privy-io/react-auth`

---

### LLM Memory System (Recommendation: Hybrid 3-Tier)

**Tier 1 - Structured Context (Zero cost):**
- Load birth chart, relationships, preferences from DB on every request
- Format into system prompt - no embeddings needed

**Tier 2 - Thread Summaries (Low cost):**
- Keep last 10 messages raw, summarize older ones
- Update summary every 10 messages via LLM call
- Already have `summary` field in `chat_threads` table

**Tier 3 - Diary Embeddings (Selective):**
- Only embed diary entries (not full conversations)
- Use free model: `all-MiniLM-L6-v2` via `@xenova/transformers`
- Requires pgvector extension: `CREATE EXTENSION vector;`
- 384 dimensions, ~1.5KB per entry

**Packages:** `@xenova/transformers pgvector`

---

### Database Migrations (Production Strategy)

**Critical rules:**
- Never use `db:push` in production - only for local dev
- Always: `db:generate` → review SQL → `db:migrate`
- Run migrations as separate CI/CD step BEFORE deploying app code
- Use `CREATE INDEX CONCURRENTLY` for zero-downtime

**Expand-Contract Pattern for breaking changes:**
1. Add new column alongside old
2. Deploy app that writes to both, reads from new
3. Drop old column after verification

**Rollback strategy:**
- Create paired rollback SQL for each migration
- Not all migrations are reversible - document which ones

**PlanetScale note:** Uses MySQL/Vitess, NOT PostgreSQL. Your Drizzle config uses `dialect: 'postgresql'`. Consider Neon, Supabase, or Railway for true Postgres.

---

### Solana Integration (via Privy)

**Architecture:**
- Point system as PRIMARY (lower friction, no wallet needed)
- Solana as OPTIONAL enhancement (for crypto-native users)
- Keep pools completely separate (legal/securities reasons)
- Privy handles wallet connection + embedded wallets

**Tech stack:**
```
@privy-io/react-auth          # Handles auth + wallets
@solana/web3.js ^1.95.0       # For transaction building
```

**Key considerations:**
- Use devnet only until you have regulatory clarity
- Never use public RPC in production (rate limited) - use Helius/QuickNode
- New users get free points (e.g., 1000) to start
- Optional: Allow SOL → points conversion (one-way only)
- Privy auto-creates embedded Solana wallet on social login

**Security:**
- Privy handles key management (no private keys in frontend)
- Always verify transactions server-side before updating balances
- Use Privy's wallet hooks, not raw `window.solana`

---

## Implementation Tasks

### Database & Schema
- [ ] Revisit and redesign data schema with proper relationships
- [ ] Set up local Postgres option for dev/simulation data (separate from PlanetScale prod)
- [ ] Practice and document database migration workflow (for live updates with paying users)

### Auth & Users
- [ ] Add user authentication
- [ ] Build onboarding flow to populate user data (birth info, preferences)
- [ ] Scope chat messages and other data per user

### Chat & Memory
- [ ] Persist chat messages to database (requires auth)
- [ ] Design LLM memory system (needs deeper thinking on approach)
- [ ] Write system prompt (deep, comprehensive)
- [ ] Set up tool calling and MCP servers for external data

### Prediction Markets
- [ ] Connect to Solana testnet for fake SOL trading
- [ ] Design point system for non-crypto users
- [ ] Build market interaction logic

### Tarot
- [ ] Research image models for generating tarot cards
- [ ] Design prompts for card generation
- [ ] Build pull logic and UI

### UI/UX
- [ ] Transit sidebar showing current transits
- [ ] Diary entry UI
- [ ] Toggle for including transits in AI context
- [ ] Mobile performance optimization (page is slow)

### Observability & Analytics
- [ ] Add PostHog for website analytics
- [ ] Add Pydantic + Logfire for tracing
- [ ] Evaluate free Sentry tier for error tracking

### CI/CD & Infrastructure
- [ ] Set up cleaner CI/CD strategy for pushing updates
- [ ] Add rollback mechanism for deployments
- [ ] Document and test database migration process for production

---

## Research Needed

### AI Models
- Which OpenRouter models to try beyond Nemotron (GLM, Minimax are expensive)
- Image model for tarot card generation

### Memory Architecture
- How to structure LLM memory (summarization? RAG? hybrid?)

### Prediction Markets
- Solana testnet integration approach
- Point system design for non-crypto path

### Database Operations
- Safe migration strategies with live users/paying customers

---

## Notes

- Current setup: Single PlanetScale database for both local dev and Vercel production
- Target: Have core features testable with auth by next Sunday
- Priority: Database schema and relationships need most thinking
