@AGENTS.md

# MedAxis Funding Mix Calculator

Standalone Next.js 16 calculator at calculator.medaxisai.org.
Two tabs: Funding Mix and Runway. All math is client-side, no backend.

## Stack (see docs/adr/ADR-001-tech-stack.md + ADR-002)
- Framework: Next.js 16 + React 19, `output: 'export'` (static)
- Files: `.tsx` / `.ts` — TypeScript strict mode (ADR-002 overrides ADR-001's jsx-only constraint)
- Styling: Plain CSS + CSS custom properties — no Tailwind in implementation
- State: single `useReducer` in app/page.tsx
- Runtime deps: posthog-js, @posthog/react, react-number-format (only additions)
- Components: `app/components/shared/`, `funding/`, `runway/`, `layout/`

## Key References
- Build spec: context/001/FINAL-funding-mix-calculator-build-spec.md
- Calculations reference: context/001/calculations.js
- Brand tokens: context/001/branding.md
- ADR: docs/adr/ADR-001-tech-stack.md

## Scripts
- `npm run dev` — local dev server
- `npm run build` — static export to `out/`
- `npm run typecheck` — tsc --noEmit
- `npm run test` — Vitest (7 QA scenarios)

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
