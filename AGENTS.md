# Agent Instructions

This project uses **bun** instead of npm. Use `bun run` and `bun install` for all commands.

This project uses **bd** (beads) for issue tracking. Run `bd onboard` to get started.

## Quick Reference

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --status in_progress  # Claim work
bd close <id>         # Complete work
bd sync               # Sync with git
```

## Landing the Plane (Session Completion)

**When ending a work session**, you MUST complete ALL steps below. Work is NOT complete until `git push` succeeds.

**MANDATORY WORKFLOW:**

1. **File issues for remaining work** - Create issues for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **PUSH TO REMOTE** - This is MANDATORY:
   ```bash
   git pull --rebase
   bd sync
   git push
   git status  # MUST show "up to date with origin"
   ```
5. **Clean up** - Clear stashes, prune remote branches
6. **Verify** - All changes committed AND pushed
7. **Hand off** - Provide context for next session

**CRITICAL RULES:**
- Work is NOT complete until `git push` succeeds
- NEVER stop before pushing - that leaves work stranded locally
- NEVER say "ready to push when you are" - YOU must push
- If push fails, resolve and retry until it succeeds

## Cursor Cloud specific instructions

### Services overview

| Service | How to run | Notes |
|---------|-----------|-------|
| Next.js dev server | `bun run dev` (from `apps/web/`) | Serves web app + Hono API at `localhost:3000` |
| PostgreSQL | `sudo pg_ctlcluster 16 main start` | Must be running before dev server; uses pgvector extension |

### Key caveats

- **Bun is the package manager.** Despite `package.json` declaring `packageManager: npm@10.0.0`, the project uses bun. Always use `bun install` / `bun run`.
- **Privy auth blocks frontend page rendering** without a valid `NEXT_PUBLIC_PRIVY_APP_ID`. The API endpoints (all under `/api/*`) work without it. If you only have placeholder credentials, test via API endpoints (`/api/health`, `/api/feed`, `/api/markets/overview`, `/api/polls`).
- **`next build` fails with placeholder Privy credentials** because static page generation initializes the Privy provider. The dev server (`bun run dev`) works fine for development.
- **Environment file** lives at `apps/web/.env.local`. See `apps/web/.env.example` for the template. At minimum, `DATABASE_URL` must be set.
- **Database setup:** After starting PostgreSQL, run `bun run db:push` from `apps/web/` to push the Drizzle schema. Run `bun run db:seed` to populate sample data.
- **Lint has pre-existing errors** (19 errors, 8 warnings). These are in the existing codebase, not introduced by setup.
- Standard commands for dev/lint/build/format are documented in `CLAUDE.md`.
