$ARGUMENTS

Handle the argument as follows:

**No argument:** List all files in docs/adr/. For each ADR, read its Status and first sentence of Context, then output a table:

| # | Title | Status | Summary |
|---|-------|--------|---------|
| 001 | Tech Stack | Accepted | ... |

Remind at the end: ADR status lifecycle is **Proposed → Accepted → Deprecated → Superseded**.

---

**Argument is a number (e.g. `1`, `01`, `001`):** Read and display the full content of that ADR from docs/adr/.

---

**Argument starts with `new` (e.g. `new Caching Strategy`):** Determine the next sequential ADR number by listing docs/adr/. Create a new file at `docs/adr/ADR-<NNN>-<kebab-slug>.md` using this template exactly:

```
# ADR-NNN: <Title>
## Status: Proposed
## Date: <today YYYY-MM-DD>
## Author: Jerome

---

## Context

[What situation or problem prompted this decision? What constraints exist?]

## Decision

[What was decided? Be specific — name the library, pattern, or approach chosen.]

## Rationale

[Why this option over the alternatives? Reference build spec or ADR-001 constraints where applicable.]

## Rejected Alternatives

- **[Option A]:** [Why rejected — be specific]
- **[Option B]:** [Why rejected]

## Consequences

**Positive:**
-

**Negative / Accepted tradeoffs:**
-

## V2 Upgrade Path

[How to evolve this decision in v2 without rework. If no upgrade path is needed, write "N/A".]
```

After creating the file, confirm the path and remind Jerome to update Status to Accepted once the decision is locked.

---

**Argument is `deprecate <number>`:** Read that ADR, change its Status line from `Accepted` to `Deprecated`, and add a note `## Deprecated: <today> — [reason if provided]` before the Context section.

**Argument is `supersede <old-number> <new-title>`:** Mark the old ADR as Superseded and create the new ADR with a `Supersedes: ADR-<NNN>` line in its header.
