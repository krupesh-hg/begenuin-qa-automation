import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
dotenv.config();

export default defineConfig({
  testDir: './',
  testMatch: '*.spec.ts',
  timeout: 40_000,
  retries: 1,
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'],
  ],
  use: {
    headless: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'begenuin',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'https://begenuin.com',
      },
    },
    {
      name: 'carlist',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'https://carlist.begenuin.com',
      },
    },
  ],
  outputDir: 'test-results/',
});
