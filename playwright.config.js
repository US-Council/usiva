// Playwright config for FocusTrack frontend tests
// Serves the site locally with python3 http.server or npx http-server
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 30000,
  retries: 1,
  workers: 1,
  reporter: [['line'], ['html', { open: 'never' }]],

  use: {
    baseURL: process.env.TEST_BASE_URL || 'http://localhost:8765',
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },

  webServer: {
    command: 'python3 -m http.server 8765',
    cwd: __dirname,
    port: 8765,
    reuseExistingServer: !process.env.CI,
    timeout: 15000,
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
  ],
});
