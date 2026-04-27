Pre-deploy and deployment checklist for calculator.medaxisai.org.

Work through each item in order. Check off items as you verify them.

---

## Pre-deploy: Code quality

- [ ] Run `/qa` — all 7 QA scenarios pass
- [ ] Run `grep -r "console\.log" app/ src/` — zero results
- [ ] Run `grep -rE "#0281AC|#0A2543|#FFBC08" app/` — zero hardcoded brand colors in CSS
- [ ] Run `find app/ src/ -name "*.tsx"` — zero .tsx files in implementation layer

## Pre-deploy: Build

- [ ] Run `npm run build` — exits 0, no errors, no warnings
- [ ] Confirm `next.config.js` has `output: 'export'` (static export mode)
- [ ] Confirm `.env.local` has `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST`

## Pre-deploy: Mobile

- [ ] Open dev server, resize browser to 375px — stacked bar shows vertical legend (not overflow)
- [ ] Resize to 428px — same check

## Deploy

- [ ] Branch is merged to `main` (or pushed directly to `main` if hotfix)
- [ ] Vercel auto-deploy triggered (check Vercel dashboard: team_x0oXPcGcruiBSXuzeq18CL5v)
- [ ] First: verify `*.vercel.app` URL loads and calculator works
- [ ] Then: verify `calculator.medaxisai.org` loads (DNS already live)

## Post-deploy: Verification

- [ ] Open calculator.medaxisai.org in an incognito window
- [ ] Tab switch → check PostHog Live Events for `tab_switch` event
- [ ] Enter a pre-money value → check for `calculator_interaction` within ~1 second
- [ ] Click "Load typical early-stage example" → check for `load_example_click`
- [ ] Click Share → check for `share_click`
- [ ] Run scenario B manually (equity=1.2M, grants=375K, preMoney=8M) → verify preserved=2.5pts displayed
- [ ] PostHog dashboard 1473999 shows events flowing

## Rollback

If the deploy breaks the site: go to Vercel → Deployments → click the previous successful deployment → "Promote to Production". Takes ~30 seconds.

Env var changes don't auto-rollback — if you changed an env var, revert it manually in Vercel Project Settings → Environment Variables.
