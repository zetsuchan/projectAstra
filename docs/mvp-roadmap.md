# MVP Scope + Phased Roadmap

## Launch Window
Target: ~2 months (web + iOS). MVP prioritizes core loops: onboarding -> chat -> diary -> feed -> memory.

## P0 (MVP) — Launch Build
**Goal:** Ship a polished, memory-rich astrology companion with a daily feed, diary, and saved chat.

### Core Features
1) **Onboarding (progressive disclosure)**
   - Required: sun sign + birth date + location
   - Optional: birth time, moon/rising, relationship add
   - Fallback: unknown birth time flow

2) **AI Chat (astro bestie)**
   - Personalized to known chart data
   - Memory summaries stored and surfaced
   - User can delete memory or threads

3) **Rolling Diary**
   - Free-form entry
   - Weekly prompt default (user can set daily/off)
   - Mood tagging (lightweight)
   - Optional AI reflection

4) **Daily Feed**
   - 1–2 personalized transit items
   - 2–3 general items (tea/culture)
   - Save/share actions

5) **Relationships (light)**
   - Add 1–2 people by sun sign (min)
   - Basic compatibility read
   - Short relationship transit note

6) **Tarot (light)**
   - Single-card daily pull
   - Brief interpretation

7) **Privacy + Safety**
   - Clear delete controls
   - Entertainment disclaimer
   - Local/on-device AI plan for iOS (documented, partial implementation ok)

### Non-Goals for P0
- Prediction markets
- Full natal chart calculations (Swiss Ephemeris)
- Deep compatibility + synastry
- Community features / social graph
- Crypto or payments

## P1 (Post-Launch Stabilization)
**Goal:** Deepen chart precision, expand personalization, and test monetization.

- Full natal chart calculation support
- Rich compatibility/synastry views
- Monthly recap of diary + chats
- Expanded feed cadence + theme collections
- Subscription tiering (more content, deeper reads)

## P2 (Growth + Monetization)
**Goal:** Increase social virality and revenue per user.

- Prediction markets (virtual credits -> optional stablecoin later)
- Community polls + leaderboards
- Creator/curator tools for feed
- Additional tarot spreads

## Delivery Notes
- Web + iOS ship together, but web can be the source of truth for UX patterns.
- Use AI provider-agnostic layer: OpenAI / OpenRouter / on-device models.
- Keep content system modular so human curation can be added later.
