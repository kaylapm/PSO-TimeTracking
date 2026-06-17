import { defineConfig } from 'cypress';
import http from 'http';

const waitForServer = (
  url: string,
  maxAttempts = 15,
  intervalMs = 2000
): Promise<void> =>
  new Promise((resolve) => {
    const attempt = (attemptsLeft: number) => {
      const req = http.get(url, (res) => {
        res.resume();
        if (res.statusCode === 200) {
          resolve();
        } else if (attemptsLeft > 0) {
          setTimeout(() => attempt(attemptsLeft - 1), intervalMs);
        } else {
          resolve();
        }
      });
      req.on('error', () => {
        if (attemptsLeft > 0)
          setTimeout(() => attempt(attemptsLeft - 1), intervalMs);
        else resolve();
      });
      req.end();
    };
    attempt(maxAttempts);
  });

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: false,
    pageLoadTimeout: 30000,
    defaultCommandTimeout: 10000,
    retries: {
      runMode: 2,
      openMode: 1,
    },
    setupNodeEvents(on) {
      on('before:run', async () => {
        await waitForServer('http://localhost:3000/login');
      });
    },
  },
});
