const { test, expect } = require('@playwright/test');

// Key pages must return OK, render their landmark section, and throw no
// uncaught JS errors. [path, a selector that must be visible].
const PAGES = [
  ['/', 'header'],
  ['/collections/all', '.grid'],
  ['/cart', 'main, .cart, [class*="cart"]'],
  ['/pages/duk', '.shell, .phead'],
];

for (const [path, sel] of PAGES) {
  test(`smoke: ${path} loads, renders "${sel}", no console errors`, async ({ page }) => {
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));

    const resp = await page.goto(path, { waitUntil: 'domcontentloaded' });
    expect(resp, `no response for ${path}`).toBeTruthy();
    expect(resp.status(), `HTTP status for ${path}`).toBeLessThan(400);

    await expect(page.locator(sel).first()).toBeVisible();
    expect(errors, `uncaught JS errors on ${path}`).toEqual([]);
  });
}
