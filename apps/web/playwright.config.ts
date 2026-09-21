import { defineConfig, devices } from "@playwright/test";

/**
 * Thin E2E layer per TDD section 4.1 - only the critical user journeys
 * (auth, receipt upload -> points credited, wallet pass issuance), run against
 * a preview deployment on merges to develop/staging, not on every PR.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],

  // Local runs have nothing listening on :3000, so start the app here. CI sets
  // E2E_BASE_URL to a deployed preview and must not start a server at all -
  // hence the undefined rather than a `!process.env.CI` guard.
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: "pnpm run dev --port 3000",
        url: "http://localhost:3000",
        reuseExistingServer: !process.env.CI,
        // A cold .next cache makes the first compile slow on Windows.
        timeout: 180_000,
      },
});
