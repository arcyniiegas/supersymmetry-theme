# E2E tests (Playwright)

End-to-end tests that drive a **real Shopify render** of the theme. They target
a running `shopify theme dev` server (which serves the *local* theme files), so
they catch regressions in the actual storefront, not a mock.

Every spec runs across **three viewports** — `desktop` (1280×900), `tablet`
(768×1024) and `mobile` (390×844) — defined as projects in the config.

## Run

```bash
# 1. serve the local theme (in one terminal) — needs Shopify CLI auth
shopify theme dev --store <your-store>.myshopify.com   # → http://127.0.0.1:9292

# 2. run the suite (in another terminal)
npm test                 # headless, all projects
npm run test:headed      # watch it in a browser
npm run test:report      # open the last HTML report

# run a subset
npx playwright test drawers                 # one spec, all viewports
npx playwright test --project=mobile        # one viewport, all specs
```

Point at a different URL (e.g. a deployed preview) with `BASE_URL`:

```bash
BASE_URL=https://example.myshopify.com npm test
```

## What's covered

| Spec | Validates |
|------|-----------|
| `smoke.spec.js` | Home / collection / cart / DUK load, render their landmark, throw no console errors |
| `product.spec.js` | PDP renders every componentized section (gallery / buy / …); sticky buy bar reveals on scroll |
| `drawers.spec.js` | Cart + filter drawers open as `aria-modal` dialogs, make the background `inert`, restore on close |
| `mobile-menu.spec.js` | Burger opens the mobile drawer + inerts background (self-skips where the mega-menu is shown) |
| `keyboard.spec.js` | Skip-to-content link focuses first and jumps to `<main>`; a keyboard-opened drawer traps focus and restores it on Escape |
| `reduced-motion.spec.js` | Looping dot halos resolve to `animation: none` under `prefers-reduced-motion` |
| `console-network.spec.js` | No theme JS console errors and no same-origin network failures (Shopify platform noise — analytics beacons, `origin_trials`, `shop.app` CSP — is filtered) |
| `visual.spec.js` | Full-page visual regression for home / collection / product / cart |

## Visual regression

Baselines live in `tests/e2e/__screenshots__/<project>/…` and were captured on
**darwin / headless chromium**. Animations are frozen and a 2% per-pixel budget
absorbs anti-aliasing, so the storefront's glass/grain/CDN imagery stays stable.

If a real, intended design change moves pixels, refresh the baselines:

```bash
npx playwright test visual --update-snapshots
```

> Baselines are environment-specific (OS + browser render fonts/AA differently).
> Regenerate them on a new machine or in CI rather than trusting a cross-OS diff.

Config: [`playwright.config.js`](../playwright.config.js) — chromium, one worker,
three viewport projects, `baseURL` = `http://127.0.0.1:9292`.
