const { test, expect } = require('@playwright/test');

// The skip link must be the first focusable element and must move focus to the
// <main> landmark when activated.
test('keyboard: skip-to-content link focuses first and jumps to main', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  await page.keyboard.press('Tab');
  const skip = page.locator('a.skip-link');
  await expect(skip).toBeFocused();

  await page.keyboard.press('Enter');
  await expect(page.locator('#MainContent')).toBeFocused();
});

// A drawer opened by keyboard must move focus inside, keep Tab from escaping to
// the (inert) background, and return focus to its trigger on Escape.
test('keyboard: cart drawer opens with Enter, traps focus, Escape restores', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  const opener = page.locator('[data-drawer-open="cartDrawer"]');
  await opener.focus();
  await expect(opener).toBeFocused();
  await page.keyboard.press('Enter');

  const drawer = page.locator('#cartDrawer');
  await expect(drawer).toHaveClass(/is-open/);

  const focusInDrawer = () =>
    page.evaluate(() => {
      const d = document.getElementById('cartDrawer');
      return !!(d && d.contains(document.activeElement));
    });

  await expect.poll(focusInDrawer, { message: 'focus should move into the drawer' }).toBe(true);

  // Tab repeatedly — focus must never escape into the inert background.
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press('Tab');
    expect(await focusInDrawer(), `focus escaped the drawer after ${i + 1} Tab(s)`).toBe(true);
  }

  await page.keyboard.press('Escape');
  await expect(drawer).not.toHaveClass(/is-open/);
  await expect(opener).toBeFocused();
});
