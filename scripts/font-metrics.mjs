// Measures the brand fonts against their local fallbacks and prints size-adjust / ascent / descent
// values for the METRICS block in build.mjs. Re-run only if the font files change.
import puppeteer from 'puppeteer-core';
import { chromePath } from './chrome.mjs';
import { serve } from './serve.mjs';

const SAMPLE = 'Somos Los Revéz. Hacemos rock desde Latinoamérica y cantamos sobre eso que piensas ABCDEFGHIJKLMNOPQRSTUVWXYZ 0123456789';
const server = await serve(8791);
const browser = await puppeteer.launch({ executablePath: chromePath, headless: true });
const page = await browser.newPage();
await page.goto('http://localhost:8791/index.html', { waitUntil: 'networkidle0' });
const out = await page.evaluate(async (SAMPLE) => {
  await document.fonts.ready;
  const measure = (family, weight) => {
    const c = document.createElement('canvas').getContext('2d');
    c.font = `${weight} 100px ${family}`;
    const m = c.measureText(SAMPLE);
    return { w: m.width, asc: m.fontBoundingBoxAscent, desc: m.fontBoundingBoxDescent };
  };
  return {
    pilat: measure("'Pilat Wide'", 800), pilatBase: measure("'Arial Black'", 800),
    whitney: measure("'Whitney Cond'", 500), whitneyBase: measure("'Arial Narrow'", 500),
  };
}, SAMPLE);
const calc = (real, base) => {
  const adj = real.w / base.w;
  return { size: +(adj * 100).toFixed(1), asc: +(real.asc / adj).toFixed(1), desc: +(real.desc / adj).toFixed(1) };
};
console.log({ pilat: calc(out.pilat, out.pilatBase), whitney: calc(out.whitney, out.whitneyBase) });
await browser.close();
server.close();
