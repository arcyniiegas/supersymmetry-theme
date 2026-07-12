const { test, expect } = require('@playwright/test');

// The burger only shows where the header collapses to mobile chrome. Runs on
// every project; self-skips on the wider ones where the mega-menu is used.
test('mobile menu: burger opens the drawer + inerts background, Escape closes', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  const burger = page.locator('[data-drawer-open="ssMenu"]');
  test.skip(!(await burger.isVisible()), 'burger hidden at this width (mega-menu shown instead)');
  await burger.click();

  const menu = page.locator('#ssMenu');
  await expect(menu).toHaveClass(/is-open/);
  await expect(page.locator('.mobilemenu__panel[role="dialog"]')).toBeVisible();
  await expect.poll(() => page.locator('body > [inert]').count()).toBeGreaterThan(0);

  await page.keyboard.press('Escape');
  await expect(menu).not.toHaveClass(/is-open/);
  await expect.poll(() => page.locator('body > [inert]').count()).toBe(0);
});
