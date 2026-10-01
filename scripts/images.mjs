// Generates responsive hero images and the 1200x630 og:image from the hi-res band photo.
// Run: npm run images   (only needed when the source photo or logo changes)
import sharp from 'sharp';
import { mkdir, readFile } from 'node:fs/promises';

const SRC = 'assets/LosRevez_02_Monstruo_BandPhoto_ALTA_5801x3585_sRGB.jpg';
const LOGO = 'assets/img/losrevez-lockup.svg';
const OUT = 'assets/img';
const INK = { r: 27, g: 25, b: 25 };

await mkdir(OUT, { recursive: true });
const meta = await sharp(SRC).metadata();
const W = meta.width, H = meta.height;

// Design-system photo treatment: slight desaturation is moot (B&W source); small contrast boost.
const base = () => sharp(SRC).greyscale().linear(1.06, -6);

async function variants(name, region, widths) {
  for (const w of widths) {
    const img = () => base().extract(region).resize({ width: w });
    await img().avif({ quality: 44, effort: 6 }).toFile(`${OUT}/${name}-${w}.avif`);
    await img().webp({ quality: 72 }).toFile(`${OUT}/${name}-${w}.webp`);
    await img().jpeg({ quality: 74, mozjpeg: true, progressive: true }).toFile(`${OUT}/${name}-${w}.jpg`);
  }
}

// Square crop: centred, keeps all three faces (x ≈ 34%, 49%, 68%). Used on phones and in the desktop split hero.
const phone = { left: Math.round(W * 0.19), top: 0, width: Math.round(W * 0.62), height: H };
await variants('hero-square', phone, [480, 640, 800, 1080, 1440, 1920]);

// Wide crop: full width, trim a little floor.
const wide = { left: 0, top: 0, width: W, height: Math.round(H * 0.92) };
await variants('hero-wide', wide, [1024, 1280, 1600]);

// og:image 1200x630 — photo on top, fading to an Ink plate carrying the lockup.
const OGW = 1200, OGH = 630;
const photo = await base()
  .extract({ left: 0, top: Math.round(H * 0.02), width: W, height: Math.round(W * OGH / OGW) })
  .resize(OGW, OGH)
  .toBuffer();
const fade = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${OGW}" height="${OGH}">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0.38" stop-color="#1B1919" stop-opacity="0"/>
    <stop offset="0.72" stop-color="#1B1919" stop-opacity="0.88"/>
    <stop offset="1" stop-color="#1B1919" stop-opacity="1"/>
  </linearGradient></defs>
  <rect width="100%" height="100%" fill="url(#g)"/></svg>`);
const logoW = 440;
const logo = await sharp(await readFile(LOGO), { density: 600 }).resize({ width: logoW }).png().toBuffer();
const logoH = (await sharp(logo).metadata()).height;
await sharp({ create: { width: OGW, height: OGH, channels: 3, background: INK } })
  .composite([
    { input: photo, top: 0, left: 0 },
    { input: fade, top: 0, left: 0 },
    { input: logo, top: OGH - logoH - 36, left: Math.round((OGW - logoW) / 2) },
  ])
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile(`${OUT}/og-losrevez-1200x630.jpg`);

console.log('images done');

// Cover art for the Escucha / Mira panels.
const COVERS = {
  'cover-qqv': 'assets/Los_Revez_Quiero_Que_Vengas_Cover_1600.jpg',
  'cover-monstruo': 'assets/LosRevez_02_Monstruo_SingleArt_3000x3000_sRGB_v1.jpg',
};
for (const [name, src] of Object.entries(COVERS)) {
  for (const w of [480, 640, 800]) {
    const img = () => sharp(src).resize({ width: w });
    await img().avif({ quality: 50, effort: 6 }).toFile(`${OUT}/${name}-${w}.avif`);
    await img().webp({ quality: 74 }).toFile(`${OUT}/${name}-${w}.webp`);
    await img().jpeg({ quality: 78, mozjpeg: true, progressive: true }).toFile(`${OUT}/${name}-${w}.jpg`);
  }
}

console.log('covers done');
