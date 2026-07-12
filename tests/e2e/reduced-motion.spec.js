const { test, expect } = require('@playwright/test');

// Validates this session's reduced-motion repair: the looping halo animations
// on the stock / gantt / fit dots must resolve to `animation-name: none` when
// the user prefers reduced motion. Before the fix the override was ordered
// before its base rule and silently never applied.
test('reduced-motion: looping dot halos are disabled on the PDP', async ({ page }) => {
  // emulate explicitly on the page — reliable regardless of option precedence
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/collections/all', { waitUntil: 'domcontentloaded' });
  await page.locator('a.card').first().click();
  await page.waitForLoadState('domcontentloaded');

  // check whichever animated pseudo-element the product renders
  const result = await page.evaluate(() => {
    const targets = [
      ['.stock__dot', '::before'],
      ['.gantt__row.now .gantt__node', '::after'],
      ['.fit__dot', '::after'],
    ];
    const checked = [];
    for (const [sel, pseudo] of targets) {
      const el = document.querySelector(sel);
      if (!el) continue;
      const name = getComputedStyle(el, pseudo).animationName;
      checked.push({ sel, animationName: name });
    }
    return checked;
  });

  test.skip(result.length === 0, 'no animated dot rendered on this product');

  for (const { sel, animationName } of result) {
    expect(animationName, `${sel} animation under reduced-motion`).toBe('none');
  }
});
