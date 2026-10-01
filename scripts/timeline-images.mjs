// Processes the raw uploads in in/ (gitignored) into web images for the timeline.
// Output: assets/img/historia/<name>-<w>.{avif,webp,jpg}. Run: node scripts/timeline-images.mjs
// Each entry: source file, output name, crop (fractions of the source), output aspect, widths.
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const OUT = 'assets/img/historia';
const JOBS = [
  // 27 Feb — still from the «Quiero Que Vengas» video; 4:3 centred on singer + guitarist.
  { src: 'in/QQV_videoImage.png', name: 'qqv-video', aspect: 4 / 3, focus: [0.5, 0.5], widths: [480, 640, 960] },
  // Mar–Apr — the «Quiero Que Vengas» release on TV (portrait phone capture; 4:3 from head to knee).
  { src: 'in/Los_Revez_lanzamiento_Quiero_Que_Vengas_en_television.png', name: 'tv', aspect: 4 / 3, focus: [0.5, 0.47], widths: [480, 640, 960] },
  // 14 Aug — «Monstruo» lyric-video thumbnail; 4:3 centred on the face.
  { src: 'in/LosRevez_Monstruo_LyricVideo_Thumbnail1.png', name: 'monstruo', aspect: 4 / 3, focus: [0.5, 0.45], widths: [480, 640, 960] },
  // 3 Sep — booth visit at Radioacktiva; the band member is in the lower half of the split screen.
  { src: 'in/LosRevez en Radioacktiva promoviendo Monstruo.png', name: 'radioacktiva', aspect: 4 / 3, focus: [0.5, 0.775], widths: [480, 640, 960] },
  // 18–19 Sep — Maratón flyer, kept whole (square).
  { src: 'in/Flyer_LosRevéz_Maraton_del Gallo_Radioacktiva.jpg', name: 'maraton-flyer', aspect: 1, focus: [0.5, 0.5], widths: [480, 800, 1200] },
];

await mkdir(OUT, { recursive: true });
for (const j of JOBS) {
  const { width: W, height: H } = await sharp(j.src).metadata();
  // Largest crop of the requested aspect, positioned at the focus point.
  let cw = W, ch = Math.round(W / j.aspect);
  if (ch > H) { ch = H; cw = Math.round(H * j.aspect); }
  const left = Math.min(Math.max(0, Math.round(W * j.focus[0] - cw / 2)), W - cw);
  const top = Math.min(Math.max(0, Math.round(H * j.focus[1] - ch / 2)), H - ch);
  for (const w of j.widths.filter((x) => x <= cw)) {
    const img = () => sharp(j.src).extract({ left, top, width: cw, height: ch }).resize({ width: w });
    await img().avif({ quality: 52, effort: 6 }).toFile(`${OUT}/${j.name}-${w}.avif`);
    await img().webp({ quality: 76 }).toFile(`${OUT}/${j.name}-${w}.webp`);
    await img().jpeg({ quality: 80, mozjpeg: true, progressive: true }).toFile(`${OUT}/${j.name}-${w}.jpg`);
  }
  console.log(j.name, `${cw}x${ch} crop`, j.widths.filter((x) => x <= cw).join('/'));
}
