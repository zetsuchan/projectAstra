# Onboarding Spec

## Goals
- Minimize friction while still collecting usable chart data.
- Progressive disclosure: start with sun sign, deepen if user wants.
- Make it feel like a conversation, not a form.

## Flow (P0)
1) **Welcome + value**
   - One screen: "Your astro bestie that remembers you." CTA: Start.

2) **Sun sign entry (required)**
   - Option A: Pick sun sign from grid.
   - Option B: Enter birthday to infer sun sign.

3) **Birth date + location (optional but encouraged)**
   - Needed later for accurate charts.
   - If skipped, store sun sign only.

4) **Birth time (required for full chart)**
   - Ask for exact time.
   - If unknown, offer fallback flow (see birth time spec).

5) **Moon + rising (optional)**
   - If user knows them, allow manual entry.

6) **Persona setup (optional in P0)**
   - Choose name for the AI and pick a voice style.

7) **Relationship add (optional)**
   - Add 1 person by sun sign.

8) **Diary cadence (required)**
   - Default weekly. User can choose daily or off.

9) **Finish**
   - Show first personalized feed tile + "Ask me anything".

## Data Captured
- Required: sun_sign
- Optional: birth_date, birth_time, birth_location
- Optional: moon_sign, rising_sign
- Optional: relationship_signs
- Required: diary_cadence

## Guardrails
- Keep steps skippable unless required.
- Do not block chat if user only has sun sign.
- Explain benefits of adding more data without guilt.

## Implementation Notes
- Web: Next.js 16.1 + TypeScript + shadcn/ui.
- API: Hono (TypeScript) for backend endpoints.
- Data: PlanetScale for Postgres for user profile + chart data.
- iOS: Swift 6.2.3 + SwiftUI.
