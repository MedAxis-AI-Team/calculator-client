Read context/001/FINAL-funding-mix-calculator-build-spec.md (full document).
Read CLAUDE.md for current stack conventions.
Inspect the actual file state to determine done vs. not-done — mark [x] only if the file exists AND contains real implementation (not placeholder or stub content):

Files to check:
- app/lib/calculations.ts, formatters.ts, validators.ts, types.ts, posthog.ts
- app/components/shared/ (CurrencyInput, PercentInput, ResultCard, Tabs, CurrencySelector)
- app/components/funding/ (FundingMixTab, CompanyBasics, FundingSourceRow, FundingSourcesList, FundingResults, StackedBar)
- app/components/runway/ (RunwayTab, RunwayInputs, RunwayResults)
- app/components/layout/ (PostHogProvider, FooterCTA)
- app/page.tsx, app/layout.tsx, app/globals.css, app/page.css
- next.config.js, vercel.json, .env.example, .nvmrc, .npmrc, Dockerfile
- app/lib/__tests__/ (calculations, formatters, validators, reducer, smoke)
- app/components/__tests__/ (FundingResults, RunwayResults)
- e2e/ (funding-mix.spec.ts, url-roundtrip.spec.ts)
- scripts/smoke-build.sh

Output a Markdown task checklist organized by phase:

## Phase 0 — Project Setup
- [ ] posthog-js, @posthog/react, react-number-format installed
- [ ] .env.local exists with NEXT_PUBLIC_POSTHOG_KEY and NEXT_PUBLIC_POSTHOG_HOST
- [ ] next.config.js has `output: 'export'`, trailingSlash: true, images.unoptimized: true
- [ ] .nvmrc (node 20), .npmrc (engine-strict=true), .env.example present

## Phase 1 — Layout + Branding
- [ ] app/globals.css has all brand tokens (--color-teal, --color-dark, --color-amber, etc.)
- [ ] Prata + Inter loaded in app/layout.tsx
- [ ] Site header with wordmark and nav tabs
- [ ] FooterCTA component with cta_click event

## Phase 2 — Funding Sources UI
- [ ] FundingSourceRow with type dropdown (7 options) + amount input + remove button
- [ ] FundingSourcesList renders list + "Add funding source" button
- [ ] ADD_SOURCE, REMOVE_SOURCE, UPDATE_SOURCE dispatches wired
- [ ] LOAD_EXAMPLE with window.confirm guard

## Phase 3 — Company Basics
- [ ] preMoney input (NumericFormat, default $8M)
- [ ] founderOwnershipPct input (NumericFormat, 0-100 clamped, default 75%)
- [ ] CurrencySelector [USD | CAD | EUR | GBP] with SET_CURRENCY dispatch

## Phase 4 — Share URL + Copy Summary
- [ ] encodeState encodes state to base64 on every change
- [ ] parseSharedState validates and decodes URL param
- [ ] Share button copies URL to clipboard, fires share_click event
- [ ] Copy Summary button calls generateCopySummary(), fires copy_summary_click event

## Phase 5 — Stacked Bar + Result Cards
- [ ] StackedBar 3-segment CSS flex (amber / amber-light / teal), hides $0 segments
- [ ] Founder ownership card (post-round % + dilution sub)
- [ ] Ownership preserved card (pts + illustrativeValuePreserved)
- [ ] Non-dilutive share % card
- [ ] SAFE/note secondary card (shown only when hasSafeNote true)
- [ ] NO_PRE_MONEY empty state handled
- [ ] No-sources empty state handled

## Phase 6 — Runway Tab
- [ ] Cash on hand, monthly burn, monthly inflows inputs (NumericFormat)
- [ ] Pending award amount + timing dropdown (1-3, 3-6, 6-12, uncertain)
- [ ] Primary runway: currentRunwayMonths + cashOutDate
- [ ] Capital to 18 months and 24 months cards
- [ ] AWARD_ON_SCHEDULE scenario card
- [ ] CASH_OUT_BEFORE_AWARD warning card with bridgeNeeded
- [ ] TIMING_UNCERTAIN card
- [ ] NET_BURN_NOT_POSITIVE: "Runway not limited" message

## Phase 7 — PostHog Events (8 events)
- [ ] tab_switch — fires on tab change, payload: { tab }
- [ ] load_example_click — fires on button click (before confirm), payload: { example }
- [ ] share_click — fires after clipboard write, payload: { active_tab, source_count, has_safe_note, has_pending_award }
- [ ] copy_summary_click — fires after clipboard write, payload: { active_tab, includes_runway, has_safe_note }
- [ ] cta_click — fires on FooterCTA click, payload: { destination: 'ii_landing' }
- [ ] results_viewed — IntersectionObserver ≥50% + first interaction, payload: { active_tab, source_count, priced_equity_amount, grant_like_amount }
- [ ] time_on_page — visibilitychange + beforeunload, payload: { seconds_on_page }, fires once
- [ ] calculator_interaction — debounced 800ms after first change, payload: { active_tab, input_field, source_count }

## Phase 8 — Polish + Deploy
- [ ] All 7 QA sanity checks pass (npm run test covers scenarios A-G)
- [ ] npm run build completes without TypeScript errors
- [ ] npm run smoke passes all 7 build output checks
- [ ] vercel.json configured (no framework field, headers set)
- [ ] Dockerfile + docker-compose.yml present

## Phase 9 — Tests
- [ ] Unit: calculations.test.ts (7 QA scenarios + edge cases)
- [ ] Unit: formatters.test.ts
- [ ] Unit: validators.test.ts (URL round-trip)
- [ ] Unit: reducer.test.ts (all action types)
- [ ] Integration: smoke.test.ts (4 cross-module scenarios)
- [ ] Component: FundingResults.test.tsx (NO_PRE_MONEY, valid mix, no SAFE card)
- [ ] Component: RunwayResults.test.tsx (NET_BURN_NOT_POSITIVE, valid result, CASH_OUT_BEFORE_AWARD)
- [ ] E2E: e2e/funding-mix.spec.ts (Playwright)
- [ ] E2E: e2e/url-roundtrip.spec.ts (Playwright)
- [ ] Coverage: npm run test:coverage ≥ 90% lines in app/lib/

---

After the checklist: show **X / Y tasks complete** and the **next recommended task** (first unchecked item in the lowest incomplete phase).
