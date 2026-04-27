# ADR-002: TypeScript Adoption in v1
## Status: Accepted
## Date: 2026-04-24
## Author: Jerome
## Supersedes: ADR-001 § "No TypeScript in v1"

---

## Context

ADR-001 specified `.jsx` (no TypeScript) for v1. During implementation, the `useReducer` + discriminated union pattern for `AppAction`, `FundingMixResult`, and `RunwayResult` required exhaustive type narrowing that is impractical to enforce with JSDoc alone. Attempting to model `UPDATE_SOURCE` with two variants (`field: 'type'` vs `field: 'amount'`) and runtime-correct dispatch types without TypeScript produced silent bugs in tests.

## Decision

TypeScript strict mode is adopted for v1. All implementation files use `.tsx` (components) and `.ts` (utilities, lib). No runtime behavior changes.

## Rationale

- Discriminated unions on `AppAction` prevent the entire class of "wrong field type dispatched to reducer" bugs at compile time, not runtime
- `FundingMixResult | { error: 'NO_PRE_MONEY' }` narrows cleanly in JSX — no runtime guard needed in components
- TypeScript is already in the `devDependencies` via Next.js; the incremental cost is zero
- The build step (`tsc`) was already present via `next build`

## Rejected Alternatives

- **JSDoc types only:** Cannot enforce discriminated union exhaustiveness; IDE hints exist but compiler does not reject incorrect dispatch calls
- **Runtime validation (Zod):** Adds bundle size and latency for a purely internal state shape; not justified for a static client-only calculator

## Consequences

**Positive:**
- Discriminated union types on `AppAction`, `FundingMixResult`, `RunwayResult`, `AwardScenario` are compiler-enforced
- `tsc --noEmit` as a standalone `typecheck` script catches regressions before build
- IDE completions across all component files

**Negative / Accepted tradeoffs:**
- ADR-001's "no TypeScript" constraint is overridden; future engineers must read ADR-002 to understand the actual stack
- `.tsx` extension throughout (not `.jsx`) — any scripts or tools referencing `.jsx` must be updated

## V2 Upgrade Path

No action needed — TypeScript is already the production baseline.
