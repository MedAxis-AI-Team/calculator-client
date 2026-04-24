@AGENTS.md

# MedAxis Funding Mix Calculator

Standalone Next.js 16 calculator at calculator.medaxisai.org.
Two tabs: Funding Mix and Runway. All math is client-side, no backend.

## Stack (locked — see docs/adr/ADR-001-tech-stack.md)
- Framework: Next.js 16 + React 19, `output: 'export'` (static)
- Files: `.jsx` not `.tsx` — no TypeScript in v1
- Styling: Plain CSS + CSS custom properties — no Tailwind in implementation
- State: single `useReducer` in app/page.jsx
- Runtime deps: posthog-js, @posthog/react, react-number-format (only additions)

## Key References
- Build spec: context/001/FINAL-funding-mix-calculator-build-spec.md
- Calculations reference: context/001/calculations.js
- Brand tokens: context/001/branding.md
- ADR: docs/adr/ADR-001-tech-stack.md

## Slash Commands
- `/tasks` — build progress checklist (Phase 0–8)
- `/adr` — list, view, or create Architecture Decision Records

## Env Vars (Vercel dashboard + .env.local)
- `NEXT_PUBLIC_POSTHOG_KEY`
- `NEXT_PUBLIC_POSTHOG_HOST`

## Vercel
- Team: team_x0oXPcGcruiBSXuzeq18CL5v
- Domain: calculator.medaxisai.org (DNS live)
- PostHog project 374629, dashboard 1473999, 8 events pre-configured
