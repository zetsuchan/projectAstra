# AI / RAG Content Architecture

## Goals
- Deliver chart-aware, memory-rich responses that feel personal and smart.
- Keep responses consistent with Lumi's tone.
- Make content modular so we can improve depth over time.

## Content Layers
1) **Static Knowledge Base**
   - Astrology concepts (signs, houses, aspects, transits)
   - Compatibility frameworks (sun/moon/rising combos)
   - Tarot meanings (card descriptions + upright summaries)
   - Glossary + tone examples

2) **User Context**
   - Chart data (sun/moon/rising, birth time if known)
   - Relationship profiles (people + labels)
   - Diary entries (user consent only)
   - Chat memory summary

3) **Live Context**
   - Daily feed items
   - Current date/time and user timezone

## Retrieval Strategy
- **Tier 1:** Chart data + user memory (always included)
- **Tier 2:** Top 3 relevant KB chunks (sign/house/aspect)
- **Tier 3:** Optional diary snippets if user allows

## Memory System
- Per-thread summary updated after each session
- Global summary (optional, user toggle)
- Hard delete should remove summaries + raw messages

## Prompt Assembly (high-level)
1) System prompt (tone + guardrails)
2) User profile + chart snapshot
3) Relationship context (if relevant)
4) Memory summary
5) Retrieved KB chunks
6) User message

## Content Sources (initial)
- Internal curated astrology knowledge base
- Internal tarot deck JSON
- Lumi voice examples

## Output Shape
- Short answer first (2–4 lines)
- Optional "why" explanation
- Optional follow-up question

## Future Enhancements
- Fine-grained memory tagging (topics, people)
- Auto-generated monthly recaps
- Reranker for KB retrieval

## Implementation Notes
- Use Convex for storage of KB chunks + embeddings.
- Retrieval pipeline lives in Hono API layer.
- iOS on-device model uses a lighter prompt + local memory.
