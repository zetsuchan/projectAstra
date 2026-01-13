# Relationship Module Spec

## Goal
Give users fast, nuanced compatibility reads for people in their orbit (boyfriend, best friend, situationship).

## Relationship Types
- Boyfriend / partner
- Best friend
- Situationship
- Custom label

## Input Options
- Sun sign (minimum)
- Optional: birth date, time, location

## Output (P0)
1) Quick compatibility snapshot (2–4 lines)
2) “What to watch” for the week (short transit note)
3) AI chat follow-up prompt

## UX Flow
1) Add person -> select relationship type
2) Enter data (sun sign or full)
3) Return compatibility + save to relationship thread

## Data Model
- `relationship_id`
- `user_id`
- `label`
- `type`
- `person_name`
- `chart_data`
- `created_at`

## Guardrails
- Avoid deterministic “this will fail” statements.
- Encourage consent + communication.

## Implementation Notes
- Web + iOS share logic; differences only in UI.
- Deeper synastry deferred to P1.
