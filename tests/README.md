# E2E tests (Playwright)

End-to-end tests that drive a **real Shopify render** of the theme. They target
a running `shopify theme dev` server (which serves the *local* theme files), so
they catch regressions in the actual storefront, not a mock.

## Run

```bash
# 1. serve the local theme (in one terminal) — needs Shopify CLI auth
shopify theme dev --store <your-store>.myshopify.com   # → http://127.0.0.1:9292

# 2. run the suite (in another terminal)
npm test                 # headless
npm run test:headed      # watch it in a browser
npm run test:report      # open the last HTML report
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
| `drawers.spec.js` | Cart + filter drawers open as modals, make the background `inert`, and restore on close (a11y) |
| `mobile-menu.spec.js` | Burger opens the mobile drawer + inerts background (mobile viewport) |
| `reduced-motion.spec.js` | Looping dot halos resolve to `animation: none` under `prefers-reduced-motion` |

Config: [`playwright.config.js`](../playwright.config.js) — chromium, one worker,
`baseURL` = `http://127.0.0.1:9292`.
