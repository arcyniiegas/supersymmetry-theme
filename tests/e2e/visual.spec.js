const { test, expect } = require('@playwright/test');

// Visual regression. Runs on every project (desktop / tablet / mobile), so each
// page gets a per-viewport baseline under tests/e2e/__screenshots__/<project>/.
// Baselines capture the CURRENT (green) storefront; future diffs flag drift.
// Animations are frozen via the config's toHaveScreenshot defaults.

// Trigger lazy-loaded imagery, wait for fonts, then settle at the top.
async function settle(page) {
  await page.evaluate(() => (document.fonts ? document.fonts.ready : null));
  await page.evaluate(
    () =>
      new Promise((resolve) => {
        let y = 0;
        const step = () => {
          window.scrollBy(0, window.innerHeight);
          y += window.innerHeight;
          if (y < document.body.scrollHeight) setTimeout(step, 80);
          else {
            window.scrollTo(0, 0);
            setTimeout(resolve, 300);
          }
        };
        step();
      }),
  );
  // wait for every in-DOM image to finish (stable full-page shots) instead of
  // networkidle, which a live store never reaches. Each image is raced against
  // a timeout so a stalled/empty src can never hang the settle.
  await page.evaluate(
    () =>
      Promise.all(
        Array.from(document.images)
          .filter((img) => !img.complete)
          .map(
            (img) =>
              Promise.race([
                new Promise((res) => { img.onload = img.onerror = res; }),
                new Promise((res) => setTimeout(res, 3000)),
              ]),
          ),
      ),
  );
  await page.waitForTimeout(600);
}

const PAGES = [
  ['home', '/'],
  ['collection', '/collections/all'],
  ['cart', '/cart'],
];

for (const [name, path] of PAGES) {
  test(`visual: ${name}`, async ({ page }) => {
    await page.goto(path, { waitUntil: 'load' });
    await settle(page);
    await expect(page).toHaveScreenshot(`${name}.png`, { fullPage: true });
  });
}

test('visual: product', async ({ page }) => {
  await page.goto('/collections/all', { waitUntil: 'load' });
  await page.locator('a.card').first().click();
  await page.waitForLoadState('load');
  await settle(page);
  await expect(page).toHaveScreenshot('product.png', { fullPage: true });
});
