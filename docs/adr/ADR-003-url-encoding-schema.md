# ADR-003: URL encoding schema for shared calculator state

**Date:** 2026-04-27
**Status:** Accepted

## Decision

Encode the full `AppState` as `btoa(JSON.stringify({ version: 1, ...state }))` and store it in the `?model=` query parameter. Decode and validate on page load via `parseSharedState` in `app/lib/validators.ts`.

## Why `version: 1`

The version field enables future schema migrations without silently breaking existing shared URLs. When the schema changes, increment the version and add a migration path in `parseSharedState`. Any URL with an unrecognised version returns `null` and falls back to `INITIAL_STATE` rather than hydrating corrupt state.

## Why `btoa` + JSON over URLSearchParams

`AppState` is a nested object with arrays. Encoding it as flat query params would require field-by-field serialisation and fragile delimiter choices. Base64-encoding a single JSON blob keeps the URL a single opaque token, avoids delimiter collisions, and makes the schema self-describing.

## Validation in `parseSharedState`

Every enum field (tabs, currencies, source types, timing values) is checked against an explicit allowlist before the state is accepted. This prevents:
- Prototype pollution from crafted JSON
- Invalid enum values reaching the reducer
- Negative amounts or missing required fields causing runtime errors downstream

The function returns `null` on any validation failure — callers always fall back to `INITIAL_STATE`.

## Rejected alternatives

**localStorage** — not shareable across devices or users.

**Hash fragment (`#`)** — Next.js static export with `trailingSlash: true` uses the path; hash fragments conflict with standard anchor behaviour and are excluded from server-side request logs, making debugging harder.

**Compressed encoding (LZ-string, etc.)** — premature. `AppState` serialises to ~300 bytes uncompressed. Base64 overhead is ~33%, producing URLs well under browser limits. Compression adds a dependency and decoding complexity for negligible gain at this payload size.
