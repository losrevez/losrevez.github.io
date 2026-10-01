// Visual + structural checks. Writes full-page screenshots to test/screens/ and prints a JSON report.
// Run: npm run check   (starts its own server)
import puppeteer from 'puppeteer-core';
import sharp from 'sharp';
import { mkdir, readFile } from 'node:fs/promises';
import { chromePath } from './chrome.mjs';
import { serve } from './serve.mjs';

const PORT = 8792;
const WIDTHS = [360, 390, 768, 1280, 1920, 2560];
await mkdir('test/screens', { recursive: true });
const content = JSON.parse(await readFile('content.json', 'utf8'));

const server = await serve(PORT);
const browser = await puppeteer.launch({ executablePath: chromePath, headless: true });
const report = {};

for (const w of WIDTHS) {
  const page = await browser.newPage();
  const requests = [];
  page.on('request', (r) => requests.push(r.url()));
  await page.setViewport({ width: w, height: w < 768 ? 800 : w >= 2560 ? 1440 : w >= 1920 ? 1080 : 900, deviceScaleFactor: w < 768 ? 2 : 1, isMobile: w < 768, hasTouch: w < 768 });
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle0' });
  await page.evaluate(() => document.fonts.ready);
  report[w] = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const overflow = [...document.querySelectorAll('body *')]
      .filter((el) => el.getBoundingClientRect().right > vw + 0.5)
      .map((el) => el.tagName + '.' + el.className);
    const smallTargets = [...document.querySelectorAll('a, button')]
      .map((el) => ({ el, r: el.getBoundingClientRect() }))
      .filter(({ r }) => r.height < 44 || r.width < 44)
      .map(({ el, r }) => `${el.textContent.trim().slice(0, 30)} ${Math.round(r.width)}x${Math.round(r.height)}`);
    return {
      scrollWidth: document.documentElement.scrollWidth, clientWidth: vw,
      horizontalScroll: document.documentElement.scrollWidth > vw,
      overflowingElements: overflow.slice(0, 5),
      smallTouchTargets: smallTargets,
      fontsLoaded: [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family),
      h1: document.querySelector('h1 img')?.alt,
      h2: [...document.querySelectorAll('h2')].map((h) => h.textContent),
    };
  });
  report[w].thirdPartyRequests = requests.filter((u) => !u.startsWith(`http://localhost:${PORT}`) && !u.startsWith('data:'));
  // Load lazy images (as scrolling would for a visitor), with a time limit per image.
  await page.evaluate(async () => {
    document.querySelectorAll('img[loading=lazy]').forEach((i) => { i.loading = 'eager'; });
    await Promise.all([...document.images].map((i) => i.complete ? null
      : new Promise((r) => { i.addEventListener('load', r); i.addEventListener('error', r); setTimeout(r, 8000); })));
  });
  report[w].brokenImages = await page.evaluate(() => [...document.images].filter((i) => !i.naturalWidth).map((i) => i.currentSrc || i.src));
  // Capture screen by screen and stitch: headless full-page capture can skip painting off-screen images.
  const vp = page.viewport();
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  const shots = [];
  for (let y = 0; y < total; y += vp.height) {
    await page.evaluate((y) => window.scrollTo(0, y), y);
    await new Promise((r) => setTimeout(r, 120));
    const actualY = await page.evaluate(() => window.scrollY);
    shots.push({ input: await page.screenshot(), top: Math.round(actualY * vp.deviceScaleFactor), left: 0 });
  }
  await sharp({ create: { width: vp.width * vp.deviceScaleFactor, height: Math.round(total * vp.deviceScaleFactor), channels: 3, background: '#1B1919' } })
    .composite(shots).png().toFile(`test/screens/home-${w}.png`);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.close();
}

// Copy integrity: every approved string must appear verbatim in the rendered text.
const page = await browser.newPage();
await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle0' });
const text = await page.evaluate(() => document.body.innerText.replace(/\s+/g, ' '));
const title = await page.title();
const desc = await page.$eval('meta[name=description]', (m) => m.content);
const c = content;
const expected = [
  c.hero.tagline, c.hero.lead, c.hero.secondary.label,
  c.banda.heading, c.banda.lead, c.banda.detail, ...c.banda.members.flatMap((m) => [m.name, m.role]),
  c.historia.heading, ...c.historia.items.flatMap((i) => [i.date, i.text]),
  c.escucha.heading, c.escucha.followLabel, c.hero.eyebrow, ...c.escucha.follow.map((l) => l.label),
  c.contratar.heading, c.contratar.before + c.contratar.email, c.footer.copyright, c.footer.location,
];
const norm = (s) => s.toUpperCase();
report.copy = {
  missing: expected.filter((s) => !norm(text).includes(norm(s))),
  titleOk: title === c.site.title,
  descriptionOk: desc === c.site.description,
  placeholderLeak: /PLACEHOLDER/.test(text),
};
const ariaLabels = await page.$$eval('.song__links a', (as) => as.map((a) => a.getAttribute('aria-label')));
report.copy.songLinkLabelsExact = JSON.stringify([...ariaLabels].sort()) === JSON.stringify(c.escucha.links.map((l) => l.label).sort());
report.copy.hiddenSectionsRendered = await page.evaluate(() => ['en-vivo', 'diego-saenz', 'empresas'].filter((id) => document.getElementById(id)));

await browser.close();
server.close();
console.log(JSON.stringify(report, null, 2));
