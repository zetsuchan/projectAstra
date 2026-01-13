# Daily Feed Spec

## Goal
Make the app feel alive every day with a skimmable feed that blends personalized transits, cultural astrology takes, and optional prompts.

## Feed Sections (P0)
1) **Personal Transits**
   - 1–2 items per day
   - Short, direct, chart-aware
2) **The Tea** (culture / celebrity)
   - 1–2 items per day
   - Shareable, witty, short
3) **Prompt Card**
   - Weekly prompt default, daily if enabled

## Item Types
- Transit insight
- Compatibility nudge
- Celebrity astro take
- Prompt / reflection card

## Ranking (Simple)
1) Personal transits
2) Prompt card
3) Tea items

## Curation
- Mixed: human-curated + AI-generated.
- Keep item length short (2–4 lines).
- Daily batch updated overnight (local timezone).

## Actions
- Save
- Share
- “Ask in chat” deep-link

## Data Model
- `id`
- `type`
- `title`
- `body`
- `tags` (transit, celebrity, prompt)
- `created_at`
- `expires_at`

## Implementation Notes
- Web: Next.js 16.1 + shadcn/ui cards.
- API: Hono feed endpoints.
- Data: Convex collections for feed items + user saves.
