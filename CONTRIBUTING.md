# Contributing

## Prerequisites

Install dependencies and Playwright browsers once:

```bash
make install
# or: npm ci && npx playwright install --with-deps chromium
```

Copy `.env.example` to `.env.local` and fill in your PostHog key before running the dev server.

## Branch naming

```
feat/<phase>-<description>    feat/phase6-runway-tab
fix/<description>              fix/cash-out-before-award-edge-case
chore/<description>            chore/upgrade-vitest
test/<description>             test/generateCopySummary-branches
docs/<description>             docs/adr-url-encoding
refactor/<description>         refactor/extract-formatters
```

## Commit messages

```
<type>(<scope>): <description>
```

Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`, `ci`

Scope is the file or component changed: `calculations`, `FundingResults`, `RunwayTab`, `posthog`, `phase1`.

## Quality gate

Run the full gate before opening a PR — it must pass clean:

```bash
make test-all
```

This runs: lint → typecheck → unit tests → coverage (≥90% lines) → build → smoke checks.

## Pull request format

Every PR must use the template in `.claude/rules/git-workflow.md`. Required sections: Problem, Solution, Build spec reference, QA checklist.

## Test requirements

- New math logic → add to `app/lib/__tests__/calculations.test.ts`
- New reducer action → add to `app/lib/__tests__/reducer.test.ts`
- New component render path → add to `app/components/__tests__/`
- Coverage must not regress below 90% lines after your change (`make test-coverage`)
