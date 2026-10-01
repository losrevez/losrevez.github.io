# losrevez.com

Single-page booking site for **Los Revéz**. Static HTML/CSS, no JavaScript on the page, hosted on GitHub Pages.

The design follows `assets/LosRevez_DesignSystem.html`:
- Photo sections (hero, Escucha / Mira) are on Ink; text-heavy sections (La banda, Lo que ha pasado, Contratar) are full-width Bone, styled like the design system's light-mode section.
- Pilat Wide for titles and the hero date line, Whitney Condensed for text and buttons, Khand caps for labels.
- The band name is always the SVG lockup.

All on-page copy lives in `content.json`. `build.mjs` turns it into `index.html` (web) and `dist/print.html` (A4, used only to make the PDF), so the site and the PDF always say the same thing.

```
content.json          ← all copy (approved text only)
build.mjs             ← content.json → index.html (+ dist/print.html for the PDF)
pdf.mjs               ← dist/print.html → dist/LosRevez.pdf
src/site.css          ← screen styles (design-system tokens)
src/print.css         ← A4 print styles (one section per page)
scripts/images.mjs    ← band photo → hero crops + og:image
scripts/serve.mjs     ← local preview server
scripts/check.mjs     ← screenshots at 360/390/768/1280 + copy/overflow/touch checks
assets/img/           ← generated images + lockup SVG
assets/fonts/         ← fonts (already in repo; see "Fonts")
CNAME                 ← losrevez.com (do not delete)
```

## Setup (once)

Needs Node 20+ and Google Chrome.

```bash
npm install
```

## Edit copy

1. Edit the text in `content.json`. Keep the band name as **Los Revéz**.
2. Run `npm run build`.
3. Run `npm run pdf` if the PDF should match too.

The build fails on its own if the output contains forbidden strings: "Reyes"/"Reves", any WhatsApp link, the unresolved red `#C0272D`, the old gold `#B8972A`, "Pre-guardar", "te avisamos", autoplay, or any `<script>` other than the JSON-LD.

## Show or hide the extra sections

`content.json → hidden` holds three sections that are built but not shown:

| key | section | where it appears when enabled |
|---|---|---|
| `enVivo` | En vivo | after "Lo que ha pasado" (Ink) |
| `diego` | Diego Sáenz | after "La banda" (Bone) |
| `empresas` | Empresas y eventos | before "Contratar" (Ink) |

Set `"enabled": true`, replace the `[PLACEHOLDER…]` text with approved copy, then run `npm run build`. Section numbers (01, 02…) renumber automatically.

## Preview locally

```bash
npm run build && npm run preview
```

Open http://localhost:8080/ for the site and http://localhost:8080/dist/print.html for the print layout.

## Regenerate the PDF

One-time setup (makes TrueType copies of the fonts for the PDF only, in `fonts-local/`, gitignored):

```bash
python3 -m venv .venv-fonts && .venv-fonts/bin/pip install fonttools
.venv-fonts/bin/python scripts/pdf-fonts.py
```

Then:

```bash
npm run pdf
```

This writes `dist/LosRevez.pdf`: A4, five pages, one per section, with working links.

**Editing in Affinity:**
- Fonts are embedded as real TrueType fonts with their names (`PilatWide-Heavy`, `WhitneyCondensed-Medium`, `KhandVariable-Regular`, `KhandVariable-SemiBold`). Keep those fonts installed so Affinity keeps the text editable.
- Images are full resolution: the photo is about 280 ppi and the covers about 475 ppi on A4.
- Browser PDFs have no named layers. Affinity imports each element (text, shape, image) as its own object.

The PDF build uses a print-only copy of `dist/print.html` (`dist/print-pdf.html`) with the TrueType fonts and full-size images. The website keeps its web fonts and web image sizes.

## Images

Only needed if the band photo or logo changes:

```bash
npm run images
```

- **Hero:** a centred crop for phones and a wide crop for tablet/desktop, each in AVIF, WebP and JPG.
- **og:image:** `assets/img/og-losrevez-1200x630.jpg`.
- **Hero:** a square crop (phones, and the left half of the desktop split hero) and a wide crop (tablets).
- **Covers** (Escucha / Mira) from the single artworks.
- **Timeline photos:**
  1. Drop raw files into `in/` (gitignored).
  2. Map each file to a date in `scripts/timeline-images.mjs` (source file, crop focus, sizes) and run `node scripts/timeline-images.mjs`. Processed copies go to `assets/img/historia/`.
  3. In `content.json`, set the date's `"image"` to the base name, e.g. `"qqv-video"`. `null` shows a placeholder.
- **Lockup:** `assets/img/losrevez-lockup.svg` is the full "Los Revéz" Desgastada lockup. It was converted from the vector `LosRevéz_LogoLetraBlanca.pdf` with poppler and optimised with svgo. The older `assets/LosRevez_LogoBlanco.svg` doesn't include "LOS".

## Fonts

The site uses the font files already in `assets/fonts/` unchanged: `PilatWide.otf`, `WhitneyCond.otf` and `Khand.ttf`.

- Sporty Pro isn't loaded. The wordmark is the SVG lockup.
- Converting to WOFF2 would make the page faster (Pilat is 139 KB as OTF). Only do it after the web licences for Pilat Wide (General Type) and Whitney (Hoefler&Co) are confirmed.
- `*.woff2` is gitignored until then.
- Khand is SIL OFL, so it's free to embed.
- Fallback fonts are metric-matched (`scripts/font-metrics.mjs`), so the font swap causes no layout shift.

## Deploy (GitHub Pages)

The repo `losrevez/losrevez.github.io` deploys from branch `main`, root folder, with the custom domain set by `CNAME` (`losrevez.com`). Keep `CNAME` in the repo root; deleting it unbinds the domain.

```bash
npm run build
git add -A && git commit -m "Update site"
git push origin main
```

GitHub Pages publishes within a minute or two. Check under repo → Settings → Pages that "Enforce HTTPS" is on.

To refresh WhatsApp's cached preview after changing the og:image, rename the image file, because WhatsApp caches by URL.

`node_modules/`, `dist/` and `test/screens/` are not committed. GitHub Pages serves only the static files.
