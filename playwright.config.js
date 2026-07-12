// Playwright config for the Supersymmetry theme.
// Targets a running `shopify theme dev` server (serves LOCAL theme files
// rendered by Shopify) at 127.0.0.1:9292. Override with BASE_URL to point at a
// deployed preview instead.
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/e2e',
  // theme dev proxies to Shopify, so first paint can be slow — be generous.
  timeout: 90_000,
  expect: { timeout: 20_000 },
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  use: {
    baseURL: process.env.BASE_URL || 'http://127.0.0.1:9292',
    headless: true,
    navigationTimeout: 60_000,
    actionTimeout: 20_000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    // theme dev appends preview params itself; nothing extra needed here.
  },
  projects: [
    {
      name: 'desktop-chromium',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 900 } },
    },
  ],
});
