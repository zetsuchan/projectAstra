# Birth Time Requirement + Fallback Flow

## Principle
Birth time is required for full chart features (houses, ascendant, precise placements). Users who do not know their birth time can still use the app with reduced precision.

## Capture Flow
Prompt: "Do you know your exact birth time?"
- **Yes, exact time** -> collect time + timezone + location.
- **Approximate** -> collect time range or "morning / afternoon / evening".
- **I don't know** -> skip and proceed with sun/moon/rising if available.

## Fallback Behavior
If birth time is unknown:
- Use sun sign and any known moon/rising.
- Disable features requiring houses.
- Show a gentle CTA: "Add birth time to unlock full chart." (no hard block)

## Data Model Fields
- `birth_time` (string or null)
- `birth_time_precision` (exact | approximate | unknown)
- `birth_time_range` (optional)
- `birth_location` (optional)

## UX Copy Notes
- "No time? You can still get solid reads. We just skip house-level precision."
- "You can update this later in Settings."

## Implementation Notes
- P0 stores inputs only. Chart calculation can be added later via Astro API.
- Web: Next.js 16.1 + TypeScript + shadcn/ui.
- iOS: Swift 6.2.3 + SwiftUI.
