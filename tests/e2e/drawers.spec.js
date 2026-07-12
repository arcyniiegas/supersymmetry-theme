const { test, expect } = require('@playwright/test');

// These validate this session's a11y fix: <theme-drawer> makes everything
// outside the open panel `inert`, and lifts it (restoring focus) on close.

test('cart drawer: opens as a modal, inerts the background, Escape restores', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  const opener = page.locator('[data-drawer-open="cartDrawer"]');
  await expect(opener).toBeVisible();
  await opener.click();

  const drawer = page.locator('#cartDrawer');
  await expect(drawer).toHaveClass(/is-open/);
  await expect(page.locator('.cart-drawer__panel[role="dialog"][aria-modal="true"]')).toBeVisible();

  // the a11y fix: siblings of the portaled drawer are inert while it's open
  await expect
    .poll(() => page.locator('body > [inert]').count())
    .toBeGreaterThan(0);
  // the open panel itself must NOT be inert
  await expect(drawer).not.toHaveAttribute('inert', /.*/);

  await page.keyboard.press('Escape');
  await expect(drawer).not.toHaveClass(/is-open/);
  // inert lifted on close
  await expect.poll(() => page.locator('body > [inert]').count()).toBe(0);
});

// Validates the extracted component-filter-drawer.css renders correctly.
test('collection filter drawer: opens with facets, closes', async ({ page }) => {
  await page.goto('/collections/all', { waitUntil: 'domcontentloaded' });

  const opener = page.locator('#filterOpen');
  await expect(opener).toBeVisible();
  await opener.click();

  const drawer = page.locator('#filterDrawer');
  await expect(drawer).toHaveClass(/is-open/);
  await expect(page.locator('.fdrawer__panel')).toBeVisible();
  // .facet styling lives in component-filter-drawer.css now — must be present
  await expect(page.locator('.facet').first()).toBeVisible();
  await expect.poll(() => page.locator('body > [inert]').count()).toBeGreaterThan(0);

  await page.locator('.fdrawer__close').click();
  await expect(drawer).not.toHaveClass(/is-open/);
  await expect.poll(() => page.locator('body > [inert]').count()).toBe(0);
});
