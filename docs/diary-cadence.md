# Diary Cadence Settings

## Default
- Weekly prompt cadence (default).

## User Options
- Daily
- Weekly
- Off

## Scheduling Rules
- One prompt per cadence window.
- If user skips, no penalty.
- User can change cadence anytime.

## Notifications (P0)
- Web: in-app reminders only.
- iOS: local notification if enabled.

## Data Fields
- `diary_cadence` (daily | weekly | off)
- `prompt_time` (optional)
- `notifications_enabled` (boolean)

## Implementation Notes
- Web: Next.js 16.1 + TypeScript.
- iOS: Swift 6.2.3 + SwiftUI.
