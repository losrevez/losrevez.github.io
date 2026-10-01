// Checks that each print page (one per section) fits A4 without clipping. No PDF is written.
import puppeteer from 'puppeteer-core';
import { chromePath } from './chrome.mjs';
import { serve } from './serve.mjs';
const server = await serve(8807);
const b = await puppeteer.launch({ executablePath: chromePath, headless: true });
const p = await b.newPage();
await p.setViewport({ width: 794, height: 1123 });
await p.emulateMediaType('print');
await p.goto('http://localhost:8807/dist/print.html', { waitUntil: 'networkidle0' });
await p.evaluate(async () => {
  document.querySelectorAll('img[loading=lazy]').forEach((i) => { i.loading = 'eager'; });
  await document.fonts.ready;
  await Promise.all([...document.images].map((i) => i.complete ? 0 : new Promise((r) => { i.onload = i.onerror = r; })));
});
const pages = await p.evaluate(() => [...document.querySelectorAll('body > .hero, main > .section')].map((s) => {
  const inner = s.querySelector('.wrap') || s;
  const sr = s.getBoundingClientRect();
  const contentBottom = Math.max(...[...s.querySelectorAll('*')].map((e) => e.getBoundingClientRect().bottom));
  return { id: s.id || 'hero', pageH: Math.round(sr.height), contentH: Math.round(contentBottom - sr.top), overflow: contentBottom > sr.bottom + 1 };
}));
console.table(pages);
await b.close(); server.close();
