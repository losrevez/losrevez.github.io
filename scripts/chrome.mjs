// Locates a local Chrome for puppeteer-core (set CHROME_PATH to override).
import { existsSync } from 'node:fs';

const CANDIDATES = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
];
export const chromePath = CANDIDATES.find((p) => p && existsSync(p));
if (!chromePath) throw new Error('Chrome not found. Set CHROME_PATH=/path/to/chrome');
