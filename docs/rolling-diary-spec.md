# Rolling Diary Spec

## Goals
- Make journaling feel easy, not heavy.
- Create a long-term memory trail the AI can reference.
- Tie entries to astrology context without overwhelming users.

## Entry Types
- **Free-form**: user writes anything.
- **Prompted**: daily/weekly prompts tied to current transits.

## Entry Fields (P0)
- `title` (optional)
- `body` (required)
- `mood` (optional, simple tag)
- `created_at`
- `prompt_id` (optional)
- `astro_tags` (optional, placeholder for later)

## Mood Tracking
- Lightweight mood tags (5-8 options).
- Used for timeline visuals later.

## AI Reflection (Optional)
- After entry, user can tap "Reflect" to get a short response.
- No auto-response unless user opts in.

## Views (P0)
- List view (recent entries).
- Calendar view (optional if time allows).

## Implementation Notes
- Web: Next.js 16.1 + TypeScript + shadcn/ui.
- API: Hono for diary endpoints.
- Data: Convex stores entries and prompt settings.
- iOS: Swift 6.2.3 + SwiftUI.
