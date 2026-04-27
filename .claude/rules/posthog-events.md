---
name: PostHog Events
description: 8 custom events with exact payloads — do not add, rename, or modify without updating dashboard 1473999
type: project
---

# PostHog Events

PostHog project: 374629 | Dashboard: 1473999 | 8 actions pre-configured.

## Setup rule
Use `usePostHog()` from `posthog-js/react` inside components. **Never** import `posthog` directly in component files — it breaks SSR safety and mocks in tests.

```jsx
// CORRECT
import { usePostHog } from 'posthog-js/react'
const posthog = usePostHog()
posthog.capture('event_name', { prop: value })

// WRONG
import posthog from './lib/posthog'
posthog.capture(...)
```

Do **not** send a custom `page_load` or `calculator_loaded` event. PostHog's built-in `$pageview` covers this automatically via `capture_pageview: true`.

## Event catalog

### tab_switch
```js
posthog.capture('tab_switch', {
  tab: 'funding_mix' | 'runway'   // the tab switched TO
})
```
Fire: every time the active tab changes.

### load_example_click
```js
posthog.capture('load_example_click', {
  example: 'typical_early_stage'
})
```
Fire: when the button is clicked (fire even if user cancels the window.confirm).

### share_click
```js
posthog.capture('share_click', {
  active_tab: 'funding_mix' | 'runway',
  source_count: number,
  has_safe_note: boolean,
  has_pending_award: boolean
})
```
Fire: after clipboard.writeText resolves successfully.

### copy_summary_click
```js
posthog.capture('copy_summary_click', {
  active_tab: 'funding_mix' | 'runway',
  includes_runway: boolean,     // true if runway result is non-null and non-error
  has_safe_note: boolean
})
```
Fire: after clipboard.writeText resolves successfully.

### cta_click
```js
posthog.capture('cta_click', {
  destination: 'ii_landing'
})
```
Fire: on click of the static CTA link (footer and/or inline). Always `destination: 'ii_landing'`.

### results_viewed
```js
posthog.capture('results_viewed', {
  active_tab: 'funding_mix' | 'runway',
  source_count: number,
  priced_equity_amount: number,
  grant_like_amount: number
})
```
Fire: **once per page load**, when the results section enters viewport by ≥ 50% AND the state is non-default (user has changed at least one input).
Implementation: IntersectionObserver with threshold 0.5 + a `hasTrackedResultsView` ref.

### time_on_page
```js
posthog.capture('time_on_page', {
  seconds_on_page: number  // Math.round(Date.now() - loadTime) / 1000
})
```
Fire: on `document.addEventListener('visibilitychange', ...)` when `document.visibilityState === 'hidden'`, AND on `window.addEventListener('beforeunload', ...)`. Guard with a `hasFiredTimeOnPage` ref so it fires at most once.

### calculator_interaction
```js
posthog.capture('calculator_interaction', {
  active_tab: 'funding_mix' | 'runway',
  input_field: string,   // e.g. 'pre_money', 'founder_pct', 'source_amount', 'monthly_burn'
  source_count: number
})
```
Fire: on every input change **after the first change**, debounced 800ms.
This is the primary lead scoring signal — founders spending 4+ minutes modeling = high intent.

## Never fire
- `page_load` / `calculator_loaded` — PostHog `$pageview` handles this
- Any event not in the catalog above — dashboard actions are pre-mapped to these exact names
