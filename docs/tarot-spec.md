# Tarot Feature Spec

## Goal
Offer a quick daily ritual that feels magical but lightweight.

## P0 Scope
- One-card daily pull
- Short interpretation (2–4 lines)
- Optional link to chat

## Card Data
- Standard 78-card deck
- Stored locally or in Convex (static data)

## UX Flow
1) User taps “Pull a card”
2) Card reveal animation
3) Interpretation shown + “Ask about this” CTA

## Data Model
- `tarot_pull_id`
- `user_id`
- `card_id`
- `interpretation`
- `created_at`

## Future (P1)
- 3-card and custom spreads
- Integration with chart context

## Implementation Notes
- Web: shadcn/ui + motion
- iOS: SwiftUI animation
