---
name: Git Workflow — Funding Mix Calculator
description: Branch naming, commit messages, and PR format for this project. Extends global git-workflow.md with calculator-specific phase prefixes.
type: project
---

# Git Workflow

`main` is always protected. Every change goes through a branch and a PR — no direct commits to main.

## Branch naming

```
<type>/<phase>-<short-description>
```

| Type | When |
|---|---|
| `feat` | New component or feature from build spec |
| `fix` | Bug fix — math error, edge case, UI regression |
| `chore` | Config, tooling, harness, deps |
| `refactor` | Internal restructure with no behavior change |
| `docs` | ADR, README, CLAUDE.md updates |
| `test` | QA scripts, test files |

Phase prefix (optional but preferred for feature work):
```
feat/phase1-layout-branding
feat/phase2-funding-sources-ui
feat/phase3-company-basics
feat/phase4-share-url
feat/phase5-stacked-bar-results
feat/phase6-runway-tab
feat/phase7-posthog-events
feat/phase8-deploy-polish
```

Non-phase branches (fixes, chores):
```
fix/cash-out-before-award-edge-case
fix/safe-note-excluded-from-primary
chore/install-posthog-react-number-format
refactor/extract-formatters-lib
```

## Commit messages

```
<type>(<scope>): <description>
```

Scope = component, file, or phase: `calculations`, `FundingResults`, `RunwayTab`, `posthog`, `phase1`, `deploy`.

```
feat(calculations): add aggregateSources and calculateFundingMix pure functions
feat(FundingMixTab): wire stacked bar with 3-segment CSS flex layout
fix(calculations): exclude operating_cash from ownership preserved comparison
fix(RunwayResults): trigger CASH_OUT_BEFORE_AWARD when cashAtArrival <= 0
chore(deps): install posthog-js @posthog/react react-number-format
feat(posthog): add results_viewed with IntersectionObserver guard
```

Rules:
- Imperative present tense ("add", not "added")
- Scope is the file/component/area changed
- One logical change per commit — do not batch unrelated changes
- No "WIP" commits on branches that will be PR'd

## PR description template

Every PR must use this format:

```
## Problem
-

## Solution
-

## Build spec reference
- Section: [section name, line range]

## QA
- [ ] /qa passes (all 7 scenarios)
- [ ] No console.log in modified files
- [ ] No hardcoded brand colors
- [ ] Mobile layout verified at 375px

## Screenshots (if UI change)

## Rollback
-
```

- **Problem**: what was missing or broken
- **Solution**: what you changed and why it matches the spec
- **Build spec reference**: cite the spec section so reviewers can cross-check
- **QA**: every PR touching math or display must run `/qa` and pass

## Workflow

```bash
git checkout main && git pull origin main
git checkout -b feat/phase2-funding-sources-ui
# ... make changes ...
git add <specific files>
git commit -m "feat(FundingSourceRow): add type dropdown with 7 source options"
git push -u origin feat/phase2-funding-sources-ui
gh pr create --title "feat: funding sources UI (phase 2)" --body "..."
```

Never: `git add .`, `git add -A`, `git push --force`, `git commit --amend` on pushed branches.
