# Lessons Learned

> Patterns, mistakes, and corrections to avoid repeating errors

## Patterns to Remember

- **vi.mock hoisting**: When using `vi.mock` factory in vitest, don't reference variables declared in the same scope — vi.mock is hoisted above variable declarations. Use inline values or declare mocks inside the factory.
- **@privy-io/server-auth in jsdom**: This package throws "cannot be used in browser environment" in jsdom tests. Always mock it: `vi.mock('@privy-io/server-auth', () => ({ PrivyClient: vi.fn() }))`.
- **Hono app testability**: Extract the Hono `app` into a separate `app.ts` file, keep `route.ts` as a thin re-export. This allows testing with `app.request()` without Next.js.
- **AI SDK streaming pattern**: Use `streamText` from `ai` package with `createOpenRouter`. Save assistant message in `onFinish` callback. Call `result.consumeStream()` for disconnect safety. Return `result.toTextStreamResponse()`.
- **Drizzle HNSW indexes**: Can define natively in schema with `.using('hnsw', table.embedding.op('vector_cosine_ops')).with({ m: 16, ef_construction: 100 })`.
- **Cursor pagination**: Encode cursor as base64url JSON with `{ d: createdAt, id: entryId }`. Use `(createdAt, entryId) DESC` for stable ordering.

---

## Bug Hunting War Stories

_Notable bugs and how they were resolved_

---

## Anti-Patterns to Avoid

_Things that seemed like good ideas but weren't_
