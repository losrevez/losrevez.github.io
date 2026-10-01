// Exports dist/print.html to an A4 PDF, one page per section, using a local Chrome.
// Run: npm run pdf   ->  dist/LosRevez.pdf
//
// Made to be edited in Affinity:
// - Fonts: uses the static TrueType copies in fonts-local/ (made by scripts/pdf-fonts.py),
//   so Chrome embeds real TrueType fonts with their names instead of "Type 3" glyphs,
//   and Affinity can keep the text editable with the installed fonts.
// - Images: full-resolution photo and covers (≥300 ppi at their printed size), not the web sizes.
import puppeteer from 'puppeteer-core';
import sharp from 'sharp';
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { chromePath } from './scripts/chrome.mjs';
import { serve } from './scripts/serve.mjs';

const PORT = 8793;
const OUT = 'dist/LosRevez.pdf';
const PRINT_IMG = 'dist/print-img';

const FONTS = ['PilatWide.ttf', 'WhitneyCond.ttf', 'Khand-400.ttf', 'Khand-600.ttf'];
if (!FONTS.every((f) => existsSync(`fonts-local/${f}`))) {
  throw new Error('fonts-local/ is missing. Run: .venv-fonts/bin/python scripts/pdf-fonts.py (see README)');
}

await mkdir(PRINT_IMG, { recursive: true });

// Full-resolution images for print. A4 is 2480 px wide at 300 ppi.
const PHOTO = 'assets/LosRevez_02_Monstruo_BandPhoto_ALTA_5801x3585_sRGB.jpg';
const meta = await sharp(PHOTO).metadata();
await sharp(PHOTO).greyscale().linear(1.06, -6)
  .extract({ left: 0, top: 0, width: meta.width, height: Math.round(meta.height * 0.92) })
  .resize({ width: 2480 }).jpeg({ quality: 90, mozjpeg: true }).toFile(`${PRINT_IMG}/hero.jpg`);
await sharp('assets/Los_Revez_Quiero_Que_Vengas_Cover_1600.jpg').jpeg({ quality: 90 }).toFile(`${PRINT_IMG}/cover-qqv.jpg`);
await sharp('assets/LosRevez_02_Monstruo_SingleArt_3000x3000_sRGB_v1.jpg').resize({ width: 1600 })
  .jpeg({ quality: 90, mozjpeg: true }).toFile(`${PRINT_IMG}/cover-monstruo.jpg`);

// Print-only copy of dist/print.html: TrueType fonts, full-resolution images, no web preloads.
let html = await readFile('dist/print.html', 'utf8');
html = html
  .replace(/<link rel="preload"[^>]*>\n?/g, '')
  .replace(/@font-face\{font-family:'Pilat Wide';[^}]*\}/, "@font-face{font-family:'Pilat Wide';src:url(\"/fonts-local/PilatWide.ttf\") format(\"truetype\");font-weight:400 800;}")
  .replace(/@font-face\{font-family:'Whitney Cond';[^}]*\}/, "@font-face{font-family:'Whitney Cond';src:url(\"/fonts-local/WhitneyCond.ttf\") format(\"truetype\");font-weight:400 600;}")
  .replace(/@font-face\{font-family:'Khand';[^}]*\}/, "@font-face{font-family:'Khand';src:url(\"/fonts-local/Khand-400.ttf\") format(\"truetype\");font-weight:300 500;}@font-face{font-family:'Khand';src:url(\"/fonts-local/Khand-600.ttf\") format(\"truetype\");font-weight:501 700;}")
  .replace(/<picture>[\s\S]*?<\/picture>/g, (pic) => {
    const alt = (pic.match(/alt="([^"]*)"/) || [, ''])[1];
    // Timeline photos: the largest processed size.
    const hist = [...pic.matchAll(/(\/assets\/img\/historia\/[\w-]+?-(\d+)\.jpg) \d+w/g)];
    if (hist.length) return `<img src="${hist.sort((a, b) => b[2] - a[2])[0][1]}" alt="${alt}">`;
    const src = pic.includes('hero-') ? 'hero.jpg' : pic.includes('cover-qqv') ? 'cover-qqv.jpg' : pic.includes('cover-monstruo') ? 'cover-monstruo.jpg' : null;
    return src ? `<img src="/${PRINT_IMG}/${src}" alt="${alt}">` : pic;
  })
  .replace(/ loading="lazy"/g, '');  // every image must be loaded before printing
if (/\.otf|Khand\.ttf/.test(html)) throw new Error('print copy still references web font files');
await writeFile('dist/print-pdf.html', html);

const server = await serve(PORT);
const browser = await puppeteer.launch({ executablePath: chromePath, headless: true });
const page = await browser.newPage();
await page.goto(`http://localhost:${PORT}/dist/print-pdf.html`, { waitUntil: 'networkidle0' });
await page.evaluate(async () => {
  await document.fonts.ready;
  await Promise.all([...document.images].map((i) => i.complete ? 0 : new Promise((r) => { i.onload = i.onerror = r; })));
});
const broken = await page.evaluate(() => [...document.images].filter((i) => !i.naturalWidth).map((i) => i.src));
if (broken.length) throw new Error('images failed to load: ' + broken.join(', '));
await page.pdf({ path: OUT, format: 'A4', printBackground: true, preferCSSPageSize: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
await browser.close();
server.close();
console.log(`wrote ${OUT}`);
