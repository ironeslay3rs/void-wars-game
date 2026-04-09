import { defineConfig, devices } from "@playwright/test";

/**
 * Smoke tests: no auth secrets — hits public routes and /api/health only.
 * Run: `npx playwright install chromium` once, then `npm run test:e2e`.
 * Set PLAYWRIGHT_BASE_URL to target a deployed preview (skip webServer).
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000",
    trace: "on-first-retry",
  },
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: "npm run dev",
        url: "http://127.0.0.1:3000",
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        stdout: "pipe",
        stderr: "pipe",
      },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
