const { test, expect } = require('@playwright/test');

// Mobile viewport — the burger opens the left-side glass menu drawer.
test.use({ viewport: { width: 390, height: 844 } });

test('mobile menu: burger opens the drawer + inerts background, Escape closes', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  const burger = page.locator('[data-drawer-open="ssMenu"]');
  await expect(burger).toBeVisible();
  await burger.click();

  const menu = page.locator('#ssMenu');
  await expect(menu).toHaveClass(/is-open/);
  await expect(page.locator('.mobilemenu__panel[role="dialog"]')).toBeVisible();
  await expect.poll(() => page.locator('body > [inert]').count()).toBeGreaterThan(0);

  await page.keyboard.press('Escape');
  await expect(menu).not.toHaveClass(/is-open/);
  await expect.poll(() => page.locator('body > [inert]').count()).toBe(0);
});
