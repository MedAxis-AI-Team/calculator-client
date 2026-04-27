# ADR-001: Tech Stack — MedAxis AI Funding Mix Calculator
## Status: Superseded (partially) by ADR-002
## Date: April 24, 2026
## Author: Jerome
## Reviewed against: Build Spec v3, Gap Analysis (April 24, 2026)
## Decisions locked: April 24, 2026 (Jerome confirmed answers)

---

## Context

We are building a standalone, free, no-login funding calculator at
`calculator.medaxisai.org` that models blended life sciences fundraising
(equity + grants + tax credits). The tool has two tabs: Funding Mix and Runway.

Infrastructure confirmed: Vercel (deployment), PostHog (analytics).
Supabase is available but explicitly out of v1 scope.
The tool is a standalone Vercel project — not a route on the main
medaxisai.org Lovable app.

This ADR documents every architectural decision made for v1 and the explicit
reasoning for each choice, including what was rejected and why.

**Confirmed answers from Jerome (April 24, 2026):**
- Framework: Next.js on Vercel (new project)
- Charts: None — stacked bar CSS only (per spec)
- Supabase: None in v1 — purely client-side, no persistence
- Dependency tolerance: Strict — only the Build Spec v3 allowed list

---

## Decisions

---

### 1. UI Framework: Next.js (App Router) + React (JSX)

**Decision:** `npx create-next-app@latest funding-calculator --no-typescript --no-tailwind --app`

**Rationale:**
- Jerome explicitly chose Next.js over Vite. The Build Spec v3 specified Vite,
  but Jerome's answer overrides it — the ADR records the actual decision, not
  the spec default.
- Next.js on Vercel is the natural pairing: zero-config deployment, automatic
  static export for a purely client-side page, and first-class Vercel integration
  (preview URLs per branch, instant rollbacks, env var management in dashboard).
- This calculator has no SSR requirements — every calculation is synchronous
  client-side math. The chosen deployment mode is `output: 'export'` (static HTML)
  or a single client component page (`'use client'`) under the App Router. Either
  eliminates server cold-starts entirely.
- Next.js gives Jerome a familiar monorepo-compatible structure if this calculator
  is ever absorbed into the main medaxisai.org project in a future consolidation.
  Vite would require a migration; Next.js would not.
- No TypeScript: the build is time-boxed to 6.5–7.5 hours. TypeScript adds
  tsconfig setup and type declaration overhead for posthog-js and
  react-number-format that is not justified at v1 scope. The pure function
  architecture in `src/lib/calculations.js` provides a clean seam for TS
  migration in V2 without incurring the cost now.

**Key Next.js configuration for this project:**
```js
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // fully static — no Node.js server needed on Vercel
}
module.exports = nextConfig
```

Page entry: `app/page.jsx` with `'use client'` directive (all interactivity
is client-side; no async server components needed).

**Rejected:**
- Vite: Build Spec v3 default; overridden by Jerome's explicit preference.
  Vite is technically lighter for this use case but Next.js/Vercel integration
  gives better DX and future flexibility.
- CRA (Create React App): deprecated, no path forward
- TypeScript: time cost vs. payoff asymmetry at v1 scope; V2 migration is clean

---

### 2. Styling: Plain CSS + CSS Custom Properties

**Decision:** Plain CSS with CSS custom properties for brand tokens. No Tailwind,
no CSS-in-JS.

**Rationale:**
- Build Spec v3 explicitly calls out "plain CSS flexbox for the stacked bar — no
  charting library." Tailwind would be a natural choice on any other Jerome project,
  but the stacked bar is the most complex layout component in this UI and it requires
  fine-grained flexbox control: three segments, percentage-based widths, conditional
  segment hiding when amounts are $0, and a mobile fallback at < 480px where labels
  drop to a vertical legend. Tailwind's utility classes can express this, but they
  make the conditional segment logic harder to read and test than direct CSS
  `width: ${pct}%` bindings.
- CSS custom properties handle the brand token system cleanly:
  ```css
  :root {
    --color-teal:   #0281AC;
    --color-dark:   #0A2543;
    --color-amber:  #FFBC08;
    --color-amber-light: #FAC775;
    --font-heading: 'Prata', serif;
    --font-body:    'Inter', sans-serif;
  }
  ```
- This keeps the dependency count at zero for styling. One fewer thing to configure,
  one fewer thing to break on Vercel.

**Rejected:**
- Tailwind CSS: excellent in general; wrong fit for this specific stacked-bar
  component and adds a build step (PostCSS) that plain CSS avoids
- Styled-components / Emotion: runtime CSS-in-JS has no payoff for a static
  single-page tool and adds bundle weight
- CSS Modules: reasonable alternative; rejected only because component count is
  small enough that plain CSS with BEM-style naming is sufficient

---

### 3. Graphs / Visualization: None (v1)

**Decision:** No charting library. Stacked bar is CSS flexbox only.

**Rationale:**
- Build Spec v3 is explicit: "Use plain CSS flexbox for the stacked bar (no charting
  library)." The gap analysis confirmed that the Flowlie-style projection graph
  (Recharts / Chart.js) was a mistaken carry-over from the reference tool — it is
  not in the MedAxis spec.
- The stacked bar communicates the single most important insight: what proportion
  of the raise is dilutive vs. non-dilutive. A CSS bar does this with zero runtime
  overhead and full accessibility control (color alone does not carry meaning;
  text labels are always present).
- Charting libraries (Recharts ~180kB, Chart.js ~200kB) would nearly double the
  bundle size of this tool for a feature that does not exist in the spec.

**V2 note:** If PostHog data shows founders spending significant time on the Runway
tab and requesting a visual projection, a lightweight SVG-based runway chart
(no library, hand-rolled) is the preferred V2 path before reaching for Recharts.

**Rejected:**
- Recharts: not in spec, bundle weight unjustified
- Chart.js: same
- D3: severe overkill
- Hand-rolled SVG chart (v1): not in spec; time budget does not allow it

---

### 4. Calculations: Pure Functions in `src/lib/calculations.js`

**Decision:** All math lives in one file as pure, exported functions. No class
instances, no closures over state, no side effects.

**Rationale:**
- The calculation model in Build Spec v3 has precisely defined source buckets,
  two distinct dilution paths (actual vs. all-equity comparison), and 7 QA sanity
  checks with exact expected outputs. Pure functions are the only architecture that
  makes all 7 of those checks independently testable without mounting a React tree.
- The build spec's formulas map directly to function signatures:
  ```js
  // examples
  computeActualDilution(preMoney, pricedEquityAmount)
  computeOwnershipPreserved(founderPct, preMoney, pricedEquityAmount, grantLikeAmount)
  computeRunway(cashOnHand, monthlyBurn, monthlyInflows)
  computeRunwayWithAward(cashOnHand, monthlyBurn, monthlyInflows, awardAmount, timingMidpoint)
  ```
- Keeping calculations isolated from React state also makes the Share URL feature
  safe: the encoded URL state is raw data, and re-hydrating it just means passing
  the parsed object back into the same pure functions — no risk of stale closures
  or derived state mismatches.
- `src/lib/formatters.js` is kept separate from `calculations.js` so formatting
  logic (currency symbol swapping, toFixed, toLocaleString, $1.5M shorthand) never
  contaminates the math.

**Structure:**
```
src/lib/
  calculations.js   # all math, source bucket derivations, runway, dilution
  formatters.js     # display formatting only — getCurrencySymbol, formatCurrency,
                    # formatPct, formatRunway, formatLargeNumber
```

**Rejected:**
- Class-based calculation engine: no benefit over pure functions at this scale,
  harder to test
- Calculations inside React components: untestable, couples display to math

---

### 5. Schema Handler / Validation: Manual — No External Library

**Decision:** Plain manual validation functions in `src/lib/validators.js`.
No Zod, no Yup. Jerome confirmed strict dependency adherence to the Build
Spec v3 allowed list, which includes no validation library.

**Rationale:**
- Jerome's explicit answer: strict deps only. Zod is off the table.
- The validation surface in v1 is well-bounded and does not require a schema
  library to implement correctly:
  - Numeric inputs: `react-number-format` handles NaN prevention, cursor
    position, and format-on-blur. Amounts are clamped to ≥ 0 on blur.
  - Ownership: clamped to [0, 100] on blur. No cross-field sum validation
    needed because the spec does not enforce a strict 100% total — it only
    validates that no single founder exceeds 100%.
  - Source type: constrained by a closed dropdown — invalid values cannot
    be entered by the user.
  - Pending timing: same — dropdown only.
- The one genuinely risky validation surface is Share URL decode. Without Zod,
  the correct pattern is a defensive `parseSharedState()` function in
  `src/lib/validators.js` that wraps JSON.parse in try/catch and explicitly
  checks each required field before dispatching `HYDRATE_FROM_URL`:

  ```js
  // src/lib/validators.js
  const VALID_TABS      = ['funding_mix', 'runway']
  const VALID_CURRENCIES = ['USD', 'CAD', 'EUR', 'GBP']
  const VALID_TIMINGS   = ['1-3', '3-6', '6-12', 'uncertain']
  const VALID_TYPES     = [
    'equity', 'safe', 'convertible_note', 'public_grant',
    'rd_tax_credit', 'foundation_award', 'operating_revenue'
  ]

  export function parseSharedState(raw) {
    try {
      const s = JSON.parse(atob(raw))
      if (s.version !== 1) return null
      if (!VALID_TABS.includes(s.activeTab)) return null
      if (!VALID_CURRENCIES.includes(s.currency)) return null
      if (typeof s.company?.preMoney !== 'number') return null
      if (typeof s.company?.founderOwnershipPct !== 'number') return null
      if (!Array.isArray(s.fundingSources)) return null
      for (const src of s.fundingSources) {
        if (!VALID_TYPES.includes(src.type)) return null
        if (typeof src.amount !== 'number' || src.amount < 0) return null
      }
      if (!VALID_TIMINGS.includes(s.runway?.pendingTiming)) return null
      return s   // passes all checks — safe to hydrate
    } catch {
      return null  // malformed base64 or JSON — fall back to defaults
    }
  }
  ```

- This is ~40 lines of code that covers every untrusted-input case explicitly.
  It is more verbose than `AppStateSchema.safeParse()` but requires zero
  additional dependencies.

**Accepted tradeoff:** The manual approach will drift from the state shape if
new fields are added in V2 and `parseSharedState` is not updated in sync.
Zod would prevent this automatically. Jerome accepts this risk at v1 scope.
When V2 adds fields, update `parseSharedState` at the same commit.

**Rejected:**
- Zod: correct choice technically; rejected by Jerome's strict dependency rule
- Yup: same
- No URL validation at all: unacceptable — malformed shared URLs must not
  silently produce wrong financial outputs

---

### 6. State Management: Single `useReducer` at App Root

**Decision:** One `useReducer` with `AppStateSchema`-shaped state, passed down
via props to tab components. No context API, no Zustand, no Redux.

**Rationale:**
- Build Spec v3 specifies exactly this: "Use plain React with one top-level
  useReducer for app state." The state shape is small (< 20 fields), mutations
  are well-defined (add source, remove source, update field, load example, hydrate
  from URL), and the component tree is shallow (3 levels max). Context API adds
  nothing over prop-passing at this depth.
- The reducer's action types map directly to the spec's user interactions:
  `SET_CURRENCY`, `SET_COMPANY_FIELD`, `ADD_SOURCE`, `REMOVE_SOURCE`,
  `UPDATE_SOURCE`, `LOAD_EXAMPLE`, `HYDRATE_FROM_URL`, `SET_RUNWAY_FIELD`.
- Having all state in one place makes the Share URL encoding trivial:
  `btoa(JSON.stringify(state))` → encode → write to URL param. Decoding:
  parse → `AppStateSchema.safeParse()` → dispatch `HYDRATE_FROM_URL`.

**Rejected:**
- Zustand: justified at larger scale; overkill for a 2-tab calculator with 8
  action types
- Redux Toolkit: same
- Multiple `useState` calls: creates split-state bugs when encoding share URLs
  (you'd need to collect state from multiple hooks and hope nothing is stale)
- React Context: unnecessary intermediary at this component depth

---

### 7. Supabase: Explicitly Out of v1 Scope

**Decision:** No Supabase integration of any kind in v1. No persistence, no
auth, no lead capture, no database writes.

**Rationale:**
- Jerome confirmed: purely client-side, no persistence.
- PostHog handles all behavioral analytics and lead scoring (time_on_page,
  calculator_interaction, share_click events are the primary lead signals).
  Supabase adds nothing to v1 analytics that PostHog does not already cover.
- The Share URL feature (`?v=1&model=<encoded>`) already solves "save and
  share my numbers" without any server-side storage. A founder who wants to
  return to their model pastes the URL. No database row needed.
- Adding even a minimal Supabase client (`@supabase/supabase-js`) violates
  Jerome's strict dependency rule and introduces two additional env vars
  (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) with no v1 consumer.

**V2 note:** If PostHog shows high share_click rates and return visits, V2
adds Supabase Auth + saved sessions. The state shape (version-tagged JSON
object) is already designed to be a persistence payload — no architectural
rework required when that time comes.

**Rejected:**
- Email opt-in lead capture via Supabase: PostHog event data is sufficient
  for v1 lead scoring; adding a form + DB write adds scope and a dependency
- Anonymous session storage: Share URL already covers this use case
- Any Supabase integration: explicitly rejected by Jerome

---

## Final Stack Summary

| Layer | Decision | Justification trigger |
|---|---|---|
| Framework | Next.js + React (JSX), static export | Jerome's explicit choice; Vercel DX; future portability |
| Styling | Plain CSS + CSS custom properties | Stacked bar fine-grained control; zero build step |
| Graphs | None — CSS stacked bar only | Spec-mandated; no charting library in allowed deps |
| Calculations | Pure functions in `src/lib/calculations.js` | Testability; QA sanity check coverage |
| Schema / Validation | Manual `parseSharedState()` in `src/lib/validators.js` | Strict dep rule; Share URL decode safety without Zod |
| State | Single `useReducer` at page root | Spec-mandated; Share URL encoding simplicity |
| Numeric inputs | react-number-format (NumericFormat) | Spec-mandated; avoids custom format-on-blur |
| Analytics | PostHog (`posthog-js`, `@posthog/react`) | Already provisioned; 8 events + dashboard pre-configured |
| Persistence | None (v1) | Jerome confirmed: purely client-side |
| Deployment | Vercel (new Next.js project, team_x0oXPcGcruiBSXuzeq18CL5v) | Already provisioned; calculator.medaxisai.org DNS confirmed |
| Typography | Prata (headings), Inter (body) via Google Fonts | Spec-mandated brand tokens |

**Allowed runtime dependencies (final — strict, no additions):**
```
react
react-dom
posthog-js
@posthog/react
react-number-format
```
Next.js itself (`next`) is a dev/build dependency, not a runtime addition.

**Vercel env vars required:**
```
NEXT_PUBLIC_POSTHOG_KEY     # phc_qToUfuT5np6TGvCf9CqmqvrHoHJR9A4mnNBhMhwCmEio
NEXT_PUBLIC_POSTHOG_HOST    # https://us.i.posthog.com
```

Note: Next.js uses `NEXT_PUBLIC_` prefix (not `VITE_`) for client-exposed
env vars. Update PostHog init accordingly:
```js
// src/lib/posthog.js
import posthog from 'posthog-js'

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
  api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  autocapture: true,
  capture_pageview: true,
})

export default posthog
```

---

## Consequences

**Positive:**
- Zero infrastructure complexity in v1: no SSR, no auth, no database queries
  on the hot path. Static export means every page load is a CDN hit.
- No dependency additions beyond the spec allowed list — zero approval friction.
- Share URL decode is safe: `parseSharedState()` guards all hydration without
  a library dependency.
- The calculation layer is independently testable without a browser or React tree.
- Next.js/Vercel pairing gives preview deployments per PR, rollbacks, and env
  var management out of the box.
- Component structure and state shape are directly derivable from this ADR +
  Build Spec v3 by Claude Code without ambiguity.

**Negative / Accepted tradeoffs:**
- Next.js over Vite adds a slightly heavier project scaffold for a tool that
  needs none of Next.js's SSR features. Mitigated by `output: 'export'` config
  which strips the Node server entirely at build time.
- No Zod means `parseSharedState()` will drift from state shape if V2 fields
  are added without updating validators. Accepted; mitigated by co-locating
  the validator update in the same commit as any state shape change.
- No charting in Runway tab — numbers only. Accepted per spec and Jerome's
  explicit confirmation. Revisit if PostHog shows demand.
- No Supabase means no lead email capture in v1. PostHog event data (especially
  `time_on_page` and `share_click`) is the v1 lead signal.

---

## V2 Upgrade Path (no architectural rework required)

1. Add Zod → replace `parseSharedState()` with `AppStateSchema.safeParse()`;
   migrate in one PR with no state shape changes
2. Add Supabase Auth → unlocks saved sessions; state payload is already the
   persistence shape
3. Add email opt-in lead capture → Supabase `calculator_leads` table;
   one form component, one DB write
4. Add hand-rolled SVG runway chart → no new library; pure SVG paths from
   runway calculation output
5. Add TypeScript → pure functions in `calculations.js` have clean signatures;
   migration is mechanical file-by-file (**done in v1 — see ADR-002**)
6. Add SAFE/note conversion drawer → new modal, new pure functions
7. Add option pool modeling → new fields in state, new calculations
