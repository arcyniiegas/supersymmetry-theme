const { test, expect } = require('@playwright/test');

// Validates that componentizing section-product.css (gallery / buy / delivery /
// reviews / related) did NOT break the PDP layout — the sections still render.
test('PDP renders the componentized sections', async ({ page }) => {
  await page.goto('/collections/all', { waitUntil: 'domcontentloaded' });

  const firstCard = page.locator('a.card').first();
  await expect(firstCard).toBeVisible();
  await firstCard.click();
  await page.waitForLoadState('domcontentloaded');

  // component-gallery.css + component-buy.css surfaces
  await expect(page.locator('.gallery').first()).toBeVisible();
  await expect(page.locator('.info').first()).toBeVisible();
  await expect(page.locator('.price').first()).toBeVisible();
  await expect(page.locator('.sizes .size').first()).toBeVisible();

  // sticky buy bar exists in the DOM (portaled to <body>, hidden until scroll)
  await expect(page.locator('.buybar')).toHaveCount(1);
});

// The sticky buy bar (component-buy.css) reveals once the main CTA scrolls away.
test('PDP sticky buy bar appears on scroll', async ({ page }) => {
  await page.goto('/collections/all', { waitUntil: 'domcontentloaded' });
  await page.locator('a.card').first().click();
  await page.waitForLoadState('domcontentloaded');

  const buybar = page.locator('.buybar');
  await expect(buybar).toHaveCount(1);

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  // is-visible is toggled by the buy-bar observer once the CTA is out of view
  await expect(buybar).toHaveClass(/is-visible/, { timeout: 10_000 });
});
