---
name: Calculator Math Rules
description: Source buckets, dilution logic, edge case precedence — must match build spec v3 exactly
type: project
---

# Calculator Math Rules

Reference implementation: `context/001/calculations.js` (authoritative).
These rules prevent the most common misimplementations.

## Source bucket assignments

| Funding type | Bucket |
|---|---|
| `equity` | `priced_equity` |
| `safe`, `convertible_note` | `safe_note_estimate` |
| `public_grant`, `rd_tax_credit`, `foundation_award` | `grant_like` |
| `operating_revenue` | `operating_cash` |

- `operating_cash` is **excluded** from `totalCapitalRaised` and the ownership preserved comparison
- `totalDilutive = priced_equity + safe_note_estimate`
- `totalNonDilutive = grant_like + operating_cash`

## Primary dilution — priced equity ONLY

```
actualDilutionPct = priced_equity / (preMoney + priced_equity)
actualFounderOwnershipPct = founderOwnershipPct × (1 − actualDilutionPct)
```

SAFE/note is **never included** in the primary ownership metric. It appears only in the secondary "estimated combined dilution" card, which is shown only when `safe_note_estimate > 0`.

## Ownership preserved comparison

The hypothetical all-equity scenario uses `priced_equity + grant_like` (not SAFE/note, not operating revenue):
```
allEquityAmount = priced_equity + grant_like
allEquityDilutionPct = allEquityAmount / (preMoney + allEquityAmount)
allEquityFounderOwnershipPct = founderOwnershipPct × (1 − allEquityDilutionPct)
founderOwnershipPreservedPts = actualFounderOwnershipPct − allEquityFounderOwnershipPct
illustrativeValuePreserved = (founderOwnershipPreservedPts / 100) × (preMoney + priced_equity)
```

## Runway — timing midpoints

| Timing dropdown | Midpoint (months) |
|---|---|
| `1-3` | 2 |
| `3-6` | 4.5 |
| `6-12` | 9 |
| `uncertain` | null (excluded from projection) |

## Edge case precedence order (apply top to bottom, stop at first match)

1. **Net burn ≤ 0** (`monthlyBurn ≤ monthlyInflows`): return `NET_BURN_NOT_POSITIVE`, suppress cash-out date and all award scenarios
2. **Pre-money = 0**: return `NO_PRE_MONEY`, suppress all dilution/ownership outputs
3. **No inputs** (blank page): show placeholder / empty state — no calculation
4. **No funding sources**: show empty state in results section
5. **Cash out before award** (`cashAtAwardArrival ≤ 0`): show `CASH_OUT_BEFORE_AWARD` warning with `bridgeNeeded` amount; primary runway still shows
6. **Normal**: show all results

## Pending award is always secondary

The award scenario (`awardScenario`) is always a secondary card — it never replaces the primary runway number. A founder sees their actual runway first, then the award-adjusted scenario below it.

## QA expected outputs (verify before ship)

| Scenario | Input | Expected output |
|---|---|---|
| A | preMoney=8M, founder=100%, equity=2M | dilution=20.0%, ownership=80.0% |
| B | preMoney=8M, founder=75%, equity=1.2M, grant=275K+100K | dilution=13.04%, ownership=65.2%, preserved=2.5pts, illustrative=$230K |
| C | cash=400K, burn=45K, inflows=0 | runway=8.9 months |
| D | same as C + award=275K, timing=3-6mo | total runway=15.0 months |
| E | cash=150K, burn=45K, award=275K, timing=6-12mo | CASH_OUT_BEFORE_AWARD warning |
| F | burn≤inflows | NET_BURN_NOT_POSITIVE, "Runway not limited" message |
| G | preMoney=0 with equity | NO_PRE_MONEY, "Enter pre-money valuation" message |
