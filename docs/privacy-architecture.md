# Privacy Architecture

## Principles
- Minimize data exposure by default.
- On-device where possible, especially on iOS.
- User controls memory and deletion.

## Data Classification
1) **Profile + chart data** (high sensitivity)
2) **Chat + diary content** (very high sensitivity)
3) **Feed interactions** (medium sensitivity)
4) **Analytics/telemetry** (low sensitivity, opt-in)

## Storage
- **Primary store:** PlanetScale for Postgres (encrypted at rest).
- **Client secrets:** iOS Keychain for local tokens and encryption keys.
- **Local-only mode (future):** optional for iOS when privacy-first.

## Processing
- **iOS:** prefer Apple Intelligence + local models for private content.
- **Web:** model calls via server (Hono) to provider (OpenAI/OpenRouter).
- **Fallback:** explicit opt-in if cloud is required on iOS.

## Retention + Deletion
- User can delete:
  - Single message
  - Full thread
  - Diary entry
  - Entire memory store
- Deletion should cascade across local cache and server.
- Limit logging of prompt/response content in observability tools.

## Consent + Settings
- Toggle: “Allow AI to use diary entries in chat.”
- Toggle: “Save chat history.”
- Toggle: “Cloud processing on iOS.”

## Compliance (US-only)
- US-only launch scope.
- Provide clear privacy policy + entertainment disclaimer.

## Implementation Notes
- API routes in Hono should strip PII from logs.
- Encrypt content fields before write (future enhancement).
- Consider E2EE for diary/chat as a Phase 2 option.
