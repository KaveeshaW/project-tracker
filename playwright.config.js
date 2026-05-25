const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:5173',
    headless: true,
  },
  webServer: [
    {
      command: 'npm start',
      cwd: './server',
      port: 3001,
      reuseExistingServer: true,
    },
    {
      command: 'npm run dev',
      cwd: './client',
      port: 5173,
      reuseExistingServer: true,
    },
  ],
});
