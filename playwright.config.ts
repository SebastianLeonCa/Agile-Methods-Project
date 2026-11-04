import { defineConfig, devices } from "@playwright/test";

// Load E2E_TEST_EMAIL / E2E_TEST_PASSWORD etc. from .env.local when it exists (not in CI).
try {
  process.loadEnvFile(".env.local");
} catch {}

const PORT = 3000;

export default defineConfig({
  testDir: "./tests/e2e",
  forbidOnly: !!process.env.CI,
  // One at a time: logged-in tests share a single test user, so parallel runs would overwrite each other.
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "on-first-retry",
  },
  // Chromium only, to keep CI fast.
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Desktop Chrome"], viewport: { width: 375, height: 812 } } },
  ],
  // Tests run against the production build (run `npm run build` first).
  webServer: {
    command: `npm run start -- -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
