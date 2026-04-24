Read context/001/pacing.md and context/001/FINAL-funding-mix-calculator-build-spec.md (sections on component structure, PostHog events, and QA sanity checks). Then inspect the current state of the app/ directory to determine what exists vs. what is still a stub.

Output a Markdown task checklist organized by build phase. For each phase:
- Show the phase name, step number (from pacing.md), and estimated time
- List each sub-task as a checkbox: `[ ]` not started, `[x]` done
- Mark a task done only if the corresponding file/component exists and contains real implementation (not Create Next App default content)

---

## Phase 0 — Project Setup
- [ ] Install posthog-js, @posthog/react, react-number-format
- [ ] Create .env.local with NEXT_PUBLIC_POSTHOG_KEY and NEXT_PUBLIC_POSTHOG_HOST
- [ ] Set next.config.js to `output: 'export'` and remove reactCompiler (plain JS project)
- [ ] Create src/lib/posthog.js with PostHog init

## Phase 1 — Layout + Branding (30 min)
- [ ] Replace app/globals.css with brand CSS custom properties (--color-teal, --color-dark, --color-amber, etc.)
- [ ] Add Prata + Inter via Google Fonts in app/layout.jsx
- [ ] Create app/layout.jsx (replace layout.tsx stub) with header, footer, CTA link
- [ ] Confirm calculator.medaxisai.org header logo/wordmark matches branding.md

## Phase 2 — Funding Sources UI (60 min)
- [ ] Create src/lib/calculations.js (copy from context/001/calculations.js)
- [ ] Create src/lib/formatters.js (extract formatCurrency, formatPct, formatMonths, getCurrencySymbol)
- [ ] Create src/lib/validators.js with parseSharedState()
- [ ] Create app/page.jsx with useReducer + initial state + all action types
- [ ] Create FundingSourceRow component (type dropdown, amount input, remove button)
- [ ] Wire "Add funding source" button with ADD_SOURCE dispatch
- [ ] Wire "Load typical early-stage example" button with LOAD_EXAMPLE dispatch + window.confirm guard
- [ ] Add all 7 source type dropdown options with tooltips

## Phase 3 — Company Basics (30 min)
- [ ] Pre-money valuation input (NumericFormat, default $8M)
- [ ] Founder ownership % input (NumericFormat, default 75%, clamped [0,100])
- [ ] Currency selector [USD | CAD | EUR | GBP] — display only, SET_CURRENCY dispatch

## Phase 4 — Share URL + Copy Summary
- [ ] Encode state → base64url on every state change, write to ?model= param
- [ ] Decode ?model= on page load, run parseSharedState(), dispatch HYDRATE_FROM_URL
- [ ] Copy summary button → generateCopySummary() → clipboard
- [ ] Share button → copy current URL to clipboard

## Phase 5 — Stacked Bar + Result Cards (FundingMixTab complete, 90 min)
- [ ] CSS stacked bar: 3 segments (Amber priced equity / light Amber SAFE/note / Teal non-dilutive)
- [ ] Hide $0 segments; mobile legend fallback at <480px
- [ ] Primary ownership card: actual founder % after priced equity dilution only
- [ ] Ownership preserved card: pts saved vs. all-equity scenario + illustrative value
- [ ] SAFE/note secondary card (shown only when safe_note_estimate > 0)
- [ ] Non-dilutive share % card
- [ ] Handle NO_PRE_MONEY and no-sources edge cases with appropriate empty states

## Phase 6 — Runway Tab (90 min)
- [ ] Cash on hand input, monthly burn input, monthly inflows input (all NumericFormat)
- [ ] Pending award amount + timing dropdown (1-3 mo, 3-6 mo, 6-12 mo, uncertain)
- [ ] Primary runway display: currentRunwayMonths + cashOutDate
- [ ] Capital needed to 18 months and 24 months
- [ ] Award scenario card: AWARD_ON_SCHEDULE, TIMING_UNCERTAIN
- [ ] CASH_OUT_BEFORE_AWARD warning with bridgeNeeded amount
- [ ] NET_BURN_NOT_POSITIVE edge case: "Runway not limited" message

## Phase 7 — PostHog Events (8 events)
- [ ] calculator_loaded (on mount)
- [ ] tab_switched (activeTab)
- [ ] source_added (type)
- [ ] source_removed (type)
- [ ] load_example_click
- [ ] share_click
- [ ] copy_summary_click
- [ ] currency_changed (currency)

## Phase 8 — Polish + Deploy
- [ ] Run all 6 QA sanity checks from spec (exact expected outputs match)
- [ ] Mobile layout verified at 375px and 428px
- [ ] Static export builds without error (`npm run build`)
- [ ] Deployed to calculator.medaxisai.org (Vercel team_x0oXPcGcruiBSXuzeq18CL5v)
- [ ] PostHog dashboard 1473999 receiving events

---

After the checklist: show `X / Y tasks complete` and the **next recommended task** (the first unchecked item in the lowest incomplete phase).
