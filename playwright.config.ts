import { defineConfig } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
dotenv.config();

// Check if session file exists
const sessionExists = fs.existsSync('./session.json');

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
    channel: 'msedge',
    headless: true,
    // If session.json exists, all tests start already logged in!
    storageState: sessionExists ? 'session.json' : undefined,
  },

  projects: [
    {
      name: 'begenuin',
      use: {
        baseURL: 'https://begenuin.com',
      },
    },
    {
      name: 'carlist',
      use: {
        baseURL: 'https://community.carlist.my',
      },
    },
  ],

  outputDir: 'test-results/',
});
