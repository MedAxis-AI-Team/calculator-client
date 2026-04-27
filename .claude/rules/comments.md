# Comments

## Rules

- **No dividers.** Never use visual separator comments (`# ── Section ──`, `// ─────`, `/* === */`, etc.). They add noise and rot as code moves.
- **No fluff.** No comments that restate the code, label a function, or describe what a block obviously does.
- **Only explain the non-obvious.** A comment is justified when it answers *why* — a hidden constraint, a subtle invariant, a workaround for a specific bug, or behavior that would surprise a reader.

## Test before adding a comment

Ask: if this comment were removed, would a competent reader be confused?
- Yes → keep it.
- No → delete it.

## Examples

```ts
// WRONG — divider
// ── Runway calculations ───────────────────────────────────

// WRONG — restates the code
// Calculate net burn
const netBurn = monthlyBurn - monthlyInflows

// WRONG — labels a section
// Helpers

// CORRECT — explains a non-obvious constraint
// operating_cash excluded from totalCapitalRaised per spec §3.2
// (it is not "raised" capital — it is existing revenue)
buckets.totalCapitalRaised = buckets.priced_equity + buckets.safe_note_estimate + buckets.grant_like

// CORRECT — explains a subtle guard
// Fire at most once: IntersectionObserver can re-trigger on scroll
if (hasTrackedResultsViewRef.current) return
```
