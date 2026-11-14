import { defineConfig } from '@playwright/test';

const fixture = process.env.CONSUMER || 'angular-15';
export default defineConfig({
  testDir: '.',
  testMatch: 'library.spec.mjs',
  workers: 1,
  timeout: 15000,
  expect: { timeout: 2000 },
  reporter: [['list'], ['json', { outputFile: `../../artifacts/${fixture}.json` }]],
  use: {
    baseURL: 'http://127.0.0.1:61235',
    headless: true,
    channel: process.env.CI ? undefined : 'chrome',
  },
  webServer: {
    command: `python3 -m http.server 61235 --bind 127.0.0.1 --directory compat/${fixture}/dist`,
    cwd: '../..',
    url: 'http://127.0.0.1:61235',
    reuseExistingServer: false,
  },
});
