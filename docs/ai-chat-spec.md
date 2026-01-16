# AI Chat Spec

## Goals
- Feel like an astro bestie: sharp, playful, warm, sex-positive.
- Personalize based on chart + history.
- Memory is user-controlled (delete anytime).

## Core Capabilities (P0)
- Multi-thread chat (new, rename, archive).
- Saved messages and summaries.
- Uses known chart data to tailor responses.
- Can explain astrology concepts in plain language.

## Memory Model
- Per-thread rolling summary.
- Optional global memory summary (user can opt out).
- "Forget" control at thread level and global level.

## Context Pack (per response)
- User chart data (sun/moon/rising; full chart if present).
- Recent chat history (last N messages).
- Memory summary (if enabled).
- 1-3 recent diary entries (if user allows).

## Prompting Style
- Direct, candid, and modern.
- Avoid clinical or mystical overexplanations.
- Offer both vibe + reason ("what" + "why").

## Privacy + Data Handling
- User can delete messages and memory.
- iOS uses on-device model where possible.
- Cloud calls only when user opts in or when required by feature.

## Implementation Notes
- Web: Next.js 16.1 + TypeScript.
- API: Hono for AI routing and model abstraction.
- Models: OpenAI / OpenRouter (cloud), Apple Intelligence + local models (iOS).
- Data: PlanetScale for Postgres stores chat threads, messages, and summaries.
- iOS: Swift 6.2.3 + SwiftUI.
