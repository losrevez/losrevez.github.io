// Screenshots of the first N screens at a given viewport: node scripts/shot.mjs 2560 1440 [screens]
import puppeteer from 'puppeteer-core';
import { chromePath } from './chrome.mjs';
import { serve } from './serve.mjs';
import { readdirSync, rmSync } from 'node:fs';
const [w, h, n = 1] = process.argv.slice(2).map(Number);
for (const f of readdirSync(process.env.TMPDIR)) if (f.startsWith(`v-${w}-`)) rmSync(`${process.env.TMPDIR}/${f}`);
const server = await serve(8796);
const b = await puppeteer.launch({ executablePath: chromePath, headless: true });
const p = await b.newPage();
await p.setViewport({ width: w, height: h });
await p.goto('http://localhost:8796/', { waitUntil: 'networkidle0' });
await p.evaluate(async () => {
  document.querySelectorAll('img[loading=lazy]').forEach((i) => { i.loading = 'eager'; });
  await document.fonts.ready;
  await Promise.all([...document.images].map((i) => i.complete ? 0 : new Promise((r) => { i.onload = i.onerror = r; setTimeout(r, 5000); })));
});
const H = await p.evaluate(() => document.documentElement.scrollHeight);
for (let i = 0; i < n && i * h < H; i++) {
  await p.evaluate((y) => scrollTo(0, y), i * h);
  await new Promise((r) => setTimeout(r, 150));
  await p.screenshot({ path: `${process.env.TMPDIR}/v-${w}-${i}.png` });
}
console.log(w, 'x', h, 'page height', H);
await b.close(); server.close();
