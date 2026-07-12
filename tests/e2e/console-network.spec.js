const { test, expect } = require('@playwright/test');

const BASE = process.env.BASE_URL || 'http://127.0.0.1:9292';
const BASE_HOST = new URL(BASE).host;

const PATHS = ['/', '/collections/all', '/cart', '/pages/duk'];

// Console noise from Shopify PLATFORM scripts / the theme-dev localhost proxy —
// not theme defects. These appear identically on any Shopify store:
//   • origin_trials-*.js CORS: Shopify injects cdn.shopify.com/shopifycloud/
//     storefront/origin_trials-*.js, which is cross-origin to the 127.0.0.1 dev
//     proxy and so CORS-blocked (loads cleanly on the real store origin).
//   • net::ERR_FAILED: the same blocked cross-origin script.
//   • shop.app frame CSP: Shop Pay tries to frame shop.app; Shopify's OWN CSP
//     frame-ancestors directive blocks it. Platform behaviour, harmless.
const BENIGN_CONSOLE = [
  /origin_trials/i,
  /shopifycloud\/storefront/i,
  /net::ERR_FAILED/i,
  /shop\.app/i,
  /frame-ancestors|Content Security Policy/i,
  /web-pixels/i,
  /\/favicon\./i,
];
const benign = (s = '') => BENIGN_CONSOLE.some((re) => re.test(s));

// A network failure is the theme's responsibility only when it's the theme's
// OWN (same-origin) resource — a broken asset path, a 404 template, etc.
// Third-party/platform hosts (shop.app, cross-origin CDN) are out of scope.
const sameOrigin = (u) => {
  try {
    return new URL(u).host === BASE_HOST;
  } catch {
    return false;
  }
};

for (const path of PATHS) {
  test(`no console errors or network failures: ${path}`, async ({ page }) => {
    const consoleErrors = [];
    const netFailures = [];

    page.on('console', (m) => {
      if (m.type() !== 'error') return;
      const loc = m.location?.().url || '';
      if (!benign(m.text()) && !benign(loc)) consoleErrors.push(m.text());
    });
    page.on('pageerror', (e) => {
      if (!benign(e.message)) consoleErrors.push(`pageerror: ${e.message}`);
    });
    // Shopify's own web-pixels analytics beacon (`/api/collect`) is fire-and-
    // forget and routinely shows net::ERR_ABORTED — that's *cancelled*, not
    // *failed*. A genuinely broken theme asset returns HTTP 4xx/5xx or
    // ERR_FAILED, both still caught below.
    const benignNet = (url) => /\/api\/collect|web-pixels|monorail/i.test(url);
    page.on('requestfailed', (r) => {
      const err = r.failure()?.errorText || 'failed';
      if (sameOrigin(r.url()) && !benignNet(r.url()) && err !== 'net::ERR_ABORTED') {
        netFailures.push(`${err} → ${r.url()}`);
      }
    });
    page.on('response', (r) => {
      if (r.status() >= 400 && sameOrigin(r.url()) && !benignNet(r.url())) {
        netFailures.push(`HTTP ${r.status()} → ${r.url()}`);
      }
    });

    await page.goto(path, { waitUntil: 'load' });
    // deferred scripts run after 'load'; a short fixed settle catches late
    // errors without waiting on networkidle (a live store never fully idles).
    await page.waitForTimeout(2500);

    expect(consoleErrors, `theme console errors on ${path}`).toEqual([]);
    expect(netFailures, `same-origin network failures on ${path}`).toEqual([]);
  });
}
