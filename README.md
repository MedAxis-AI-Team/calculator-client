# MedAxis AI — Funding Mix Calculator

A free, client-side calculator for life sciences founders modeling grants, tax credits, SAFE notes, and equity in a single raise. Live at [calculator.medaxisai.org](https://calculator.medaxisai.org).

**Funding Mix tab** — dilution from priced equity, founder ownership preserved by non-dilutive capital, SAFE/note secondary estimate, stacked bar breakdown.

**Runway tab** — cash-out date, capital needed to 18 and 24 months, pending award scenarios (on-schedule, cash-out-before-award, timing uncertain).

All math is client-side. No backend, no data collection beyond PostHog analytics.

## Prerequisites

- Node.js ≥ 20
- Docker (optional — for containerized local run)

## Local setup

```bash
cp .env.example .env.local
# Fill in your PostHog key — see Environment variables below
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

For E2E tests, install Playwright browsers once after `npm install`:

```bash
npx playwright install --with-deps chromium
```

Or use `make install` which does both steps.

## Commands

The `Makefile` is the primary interface. All targets are documented via `make help`.

| Make target | npm equivalent | What it does |
|---|---|---|
| `make dev` | `npm run dev` | Next.js dev server |
| `make build` | `npm run build` | Typecheck → static export to `out/` |
| `make serve` | `npm start` | Serve `out/` locally on port 3000 |
| `make lint` | `npm run lint` | ESLint |
| `make format` | — | ESLint with `--fix` |
| `make typecheck` | `npm run typecheck` | TypeScript check, no emit |
| `make test` | `npm run test` | Unit + component tests (Vitest) |
| `make test-watch` | `npm run test:watch` | Vitest interactive watch |
| `make test-coverage` | `npm run test:coverage` | Coverage report (≥90% lines required) |
| `make test-e2e` | `npm run test:e2e` | Playwright E2E (builds first) |
| `make test-all` | — | Full quality gate: lint → typecheck → test → coverage → smoke |
| `make smoke` | `npm run smoke` | Post-build output checks (builds first) |
| `make docker-build` | — | Build Docker image |
| `make docker-up` | — | Start container via Docker Compose |
| `make docker-run` | — | Build and run without Compose |
| `make clean` | — | Delete `out/`, `.next/`, `coverage/` |

## Stack

- **Next.js 16** + **React 19** — `output: 'export'` (fully static, no server)
- **TypeScript** strict mode — discriminated unions for all calculation results
- **Plain CSS** with custom properties — no Tailwind, all brand tokens in `app/globals.css`
- **Single `useReducer`** in `app/page.tsx` — no external state library
- **PostHog** — 8 analytics events pre-configured (project 374629)
- **Vitest** — unit and component tests; **Playwright** — E2E

## Project structure

```
app/
  components/
    shared/    CurrencyInput, PercentInput, ResultCard, Tabs, CurrencySelector
    funding/   FundingMixTab, CompanyBasics, FundingSourceRow, FundingSourcesList, FundingResults, StackedBar
    runway/    RunwayTab, RunwayInputs, RunwayResults
    layout/    PostHogProvider, FooterCTA
  lib/
    calculations.ts   Pure math — aggregateSources, calculateFundingMix, calculateRunway
    formatters.ts     Display formatting — currency, percent, months
    validators.ts     URL state encode/decode with full validation
    reducer.ts        useReducer actions and INITIAL_STATE
    types.ts          All shared TypeScript types
    __tests__/        Unit, integration, and component tests
  page.tsx            Root — useReducer, PostHog events, URL sync
  globals.css         Brand tokens and global styles
e2e/                  Playwright specs
scripts/
  smoke-build.sh      Post-build assertions (run via make smoke)
docs/adr/             Architecture Decision Records
```

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_POSTHOG_KEY` | Yes | PostHog project API key (public, safe to expose) |
| `NEXT_PUBLIC_POSTHOG_HOST` | Yes | PostHog ingest host — `https://us.i.posthog.com` for US region |

Set these in `.env.local` for local development. For Vercel, set them in the dashboard under the `team_x0oXPcGcruiBSXuzeq18CL5v` team.

## Deploy

Deployed on Vercel as a static site. `vercel.json` sets security headers and the output directory. No `framework` field — Vercel treats it as a plain static export.

```bash
# Manual deploy (Vercel CLI)
vercel --prod
```

DNS: `calculator.medaxisai.org` is live and pointing to the Vercel deployment.

## Docker (optional)

```bash
make docker-up          # build image + start on port 3000
make docker-run         # same without Compose
make docker-run PORT=8080
```

Pass PostHog credentials via `.env.local` or shell environment — Docker Compose reads them automatically.
