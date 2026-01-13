# Project Astra

![Astra cover](assets/cover.png)

![GitHub top language](https://img.shields.io/github/languages/top/zetsuchan/projectAstra)
![GitHub language count](https://img.shields.io/github/languages/count/zetsuchan/projectAstra)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Swift](https://img.shields.io/badge/Swift-FA7343?logo=swift&logoColor=white)
![SwiftUI](https://img.shields.io/badge/SwiftUI-0D96F6?logo=swift&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?logo=nextdotjs&logoColor=white)
![Hono](https://img.shields.io/badge/Hono-111111?logo=cloudflare&logoColor=F38020)

Astrology companion designed as a chat-first, memory-rich bestie. It combines personalized readings, a rolling diary, and a daily cultural feed so users can get perspective, track patterns, and feel seen over time.

## Core experience
- Chat-first AI astrologer that adapts to user knowledge level.
- Rolling diary with prompts, mood tags, and optional AI reflection.
- Daily feed with personalized transits and culture/celebrity astrology.
- Relationship reads (boyfriend, best friend, situationship).
- Tarot pulls for quick daily insight.
- Prediction markets (later phase) for cultural forecasting and monetization.

## Product principles
- Progressive disclosure: start with sun sign, deepen as users opt in.
- Memory-first: chats and diary build a long-term personal archive.
- Aesthetic polish: typography-forward, editorial feel.
- Privacy-aware: on-device options for iOS when possible.

## Tech stack (planned)
- Web: Next.js 16.1 + TypeScript + shadcn/ui
- API: Hono (TypeScript)
- Data: Convex
- iOS: Swift 6.2.3 + SwiftUI
- Models: provider-agnostic (OpenAI/OpenRouter + Apple Intelligence on-device)

## Docs
- `docs/product-foundation.md` — North star, positioning, tone
- `docs/retention-loops.md` — Retention loop design
- `docs/mvp-roadmap.md` — MVP scope and phased roadmap
- `docs/onboarding-spec.md` — Onboarding flow + data capture
- `docs/birth-time-fallback.md` — Birth time requirement + fallback logic
- `docs/ai-chat-spec.md` — AI chat behavior + memory model
- `docs/rolling-diary-spec.md` — Diary structure + AI reflection
- `docs/diary-cadence.md` — Prompt cadence settings
- `docs/content-policy.md` — Tone guardrails + content safety
- `docs/privacy-architecture.md` — Privacy model + data handling
- `docs/daily-feed-spec.md` — Daily feed format + ranking
- `docs/relationship-module.md` — Relationship reads + compatibility
- `docs/tarot-spec.md` — Tarot pull scope + data model
- `docs/convex-data-model.md` — Convex collections outline
- `docs/ai-rag-architecture.md` — AI/RAG content architecture
- `docs/legal-privacy-checklist.md` — Legal/privacy safety checklist
- `docs/branding-naming.md` — Branding directions + name shortlist

## Local workflow notes
Beads is used locally for issue tracking. The `.beads/` directory should stay untracked.

## Common commands
```bash
# Check git status

git status -sb

# Stage docs only

git add README.md docs
```

## Editing conventions
- Keep docs concise and skimmable.
- Use clear headings and short paragraphs.
- Prefer bullet lists for requirements and scope.
