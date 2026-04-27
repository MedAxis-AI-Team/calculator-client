Run all 7 QA sanity checks from build spec v3 against the current calculations implementation.

Step 1: Read `context/001/calculations.js` (reference) and `src/lib/calculations.js` (implementation, if it exists). If the implementation file doesn't exist yet, run the checks against the reference.

Step 2: Execute each scenario by tracing through the pure functions with exact arithmetic. Do not approximate intermediate values.

Step 3: Report results in this format:

```
QA Results — calculator-client
────────────────────────────────────────
A  [PASS|FAIL]  actualDilutionPct=XX.X%     expected: 20.0%
B  [PASS|FAIL]  preservedPts=X.X pts        expected: 2.5 pts
                illustrative=$XXX,XXX        expected: $230,000
C  [PASS|FAIL]  runway=X.X mo               expected: 8.9 mo
D  [PASS|FAIL]  totalRunwayWithAward=XX.X   expected: 15.0 mo
E  [PASS|FAIL]  awardScenario.type=…        expected: CASH_OUT_BEFORE_AWARD
F  [PASS|FAIL]  error=…                     expected: NET_BURN_NOT_POSITIVE
G  [PASS|FAIL]  error=…                     expected: NO_PRE_MONEY
────────────────────────────────────────
X / 7 passed
```

For any FAIL: show the intermediate values that diverge and the exact line number in the file that produces the wrong result.

Scenarios (from spec section "QA SANITY CHECKS"):
- A: preMoney=8M, founder=100%, equity=2M → dilution=20.0%, ownership=80.0%
- B: preMoney=8M, founder=75%, equity=1.2M, grants=375K → preserved=2.5pts, illustrative=$230K
- C: cash=400K, burn=45K → runway=8.9mo
- D: C + award=275K, timing=3-6 → total=15.0mo
- E: cash=150K, burn=45K, award=275K, timing=6-12 → CASH_OUT_BEFORE_AWARD
- F: burn≤inflows → NET_BURN_NOT_POSITIVE
- G: preMoney=0 → NO_PRE_MONEY
