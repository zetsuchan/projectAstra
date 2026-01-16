# Persona Customization Spec

## Goal
Let users personalize the assistant while keeping Lumi as the default and maintaining safe tone boundaries.

## Default
- Assistant name: **Lumi**
- Default voice style: Sharp / playful / warm

## Customization Options (P0)
- **Name override**: user can rename the assistant.
- **Voice style**: choose from preset styles.

### Voice Style Presets
1) **Soft & Warm** (gentle, supportive)
2) **Sharp & Direct** (short, blunt, witty)
3) **Playful & Flirty** (fun, teasing, sex-positive)
4) **Teacher Mode** (explain astrology step-by-step)

## Where It Appears
- Chat header and greeting
- Daily feed prompt card
- Diary reflection responses

## Guardrails
- Style changes do not override safety rules.
- Explicit tone only in private chat and when user initiates.

## Data Model
- `persona_name` (string)
- `persona_style` (enum)
- `persona_pronouns` (optional, future)

## UX Flow
1) Settings -> "Your Astro Bestie"
2) Name field + style picker
3) Save -> confirmation toast

## Implementation Notes
- Store on user profile in PlanetScale for Postgres.
- iOS and web should share the same style IDs.
- The system prompt should include style tags, not raw user text.
