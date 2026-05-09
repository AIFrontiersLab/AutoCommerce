import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright — use for real retailer automation in staging (not enabled in this demo UI).
 *
 * Browserbase / Steel.dev: set `use.connectOptions` or a custom fixture that acquires
 * remote CDP endpoints instead of local Chromium.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "https://127.0.0.1:443",
    ignoreHTTPSErrors: true,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev",
    url: "https://127.0.0.1:443",
    ignoreHTTPSErrors: true,
    reuseExistingServer: !process.env.CI,
  },
});
