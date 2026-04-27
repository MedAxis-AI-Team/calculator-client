---
name: TSX + CSS Style — Funding Mix Calculator
description: Project-specific coding conventions for .tsx and plain CSS files (ADR-001 + ADR-002)
type: project
---

# TSX + CSS Style

## File extensions
- All implementation files: `.tsx` for components, `.ts` for utilities — TypeScript strict mode (ADR-002)
- Styling: plain CSS files (`.css`) with CSS custom properties — no Tailwind, no CSS modules
- All types defined in `app/lib/types.ts`

## Component style
- Functional components only — no class components
- Props passed explicitly — no React Context for app state (useReducer at root, props down)
- One component per file; file name matches component name (PascalCase)
- Default exports for components; named exports for utilities

## CSS conventions
- Brand tokens must use custom properties — never hardcode hex values:
  ```css
  /* WRONG */
  color: #0281AC;
  /* CORRECT */
  color: var(--color-teal);
  ```
- Custom properties defined in `app/globals.css` `:root`:
  ```css
  --color-teal:        #0281AC;
  --color-dark:        #0A2543;
  --color-light:       #F4F7FA;
  --color-amber:       #FFBC08;
  --color-amber-light: #FAC775;
  --color-text:        #6A7381;
  --color-gray-light:  #EFF2F5;
  --color-yellow-light:#F6EFDC;
  --color-teal-light:  #E6F1F4;
  --font-heading:      'Prata', serif;
  --font-body:         'Inter', sans-serif;
  ```
- BEM-style class names (`.funding-source-row`, `.funding-source-row__amount`)
- Stacked bar widths set via inline `style={{ width: \`${pct}%\` }}` — not utility classes
- Mobile breakpoint: `@media (max-width: 480px)` for stacked bar legend fallback

## Numeric inputs
- Always use `NumericFormat` from `react-number-format` — never roll a custom formatter
- Currency inputs: `thousandSeparator={true}`, `prefix` from `getCurrencySymbol(currency)`, `decimalScale={0}`
- Percentage inputs: `suffix="%"`, `decimalScale={1}`
- Clamp on blur: ownership → [0, 100], amounts → [0, ∞]

## State
- Single `useReducer` in `app/page.tsx` — no `useState` for app-level fields
- Action types: `SET_CURRENCY`, `SET_COMPANY_FIELD`, `ADD_SOURCE`, `REMOVE_SOURCE`,
  `UPDATE_SOURCE`, `LOAD_EXAMPLE`, `HYDRATE_FROM_URL`, `SET_RUNWAY_FIELD`
- Reducer must be pure — no side effects inside the reducer function

## No console.log in committed code
- Use `process.env.NODE_ENV === 'development'` guard if temporary debug logging is necessary
- PostHog captures all user interactions — no need for console instrumentation in production
