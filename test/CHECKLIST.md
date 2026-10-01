# Test checklist: 2026-09-30 (v10: La banda statement, all five timeline photos)

Evidence: `test/check-report.json` (from `npm run check`), `test/lighthouse/mobile.report.html` (from `npm run lighthouse`), screenshots in `test/screens/` and `dist/LosRevez.pdf`. Tested on the local preview server with gzip on, as GitHub Pages serves it.

| # | Requirement | Result | Evidence |
|---|---|---|---|
| 1 | Copy matches content.json verbatim | PASS | check.mjs `copy.missing: []`; title and description exact; song link labels exact in `aria-label` (`songLinkLabelsExact: true`) |
| 2 | No claims/numbers/testimonials beyond CONTENT | PASS | Page text = content.json only, plus approved additions: hero label "Banda de rock de Bogotá" (from the meta description), section numbers 01–04, second Contratar button. Alt text "Los Revéz" pending approval |
| 3 | Band name "Los Revéz"; no "Reves"/"Reyes" | PASS | build guard; `grep` finds 0 matches |
| 4 | 3 hidden sections built, not rendered | PASS | flags on → 3 sections rendered; flags off → 0; `hiddenSectionsRendered: []` |
| 5 | No WhatsApp; only contact is losrevez@gmail.com | PASS | build guard; `whatsapp: false` |
| 6 | No push/merge/deploy/DNS/CNAME change | PASS | nothing committed; CNAME untouched |
| 7 | No new font files committed | PASS | no new font files; `*.woff2` gitignored; existing fonts left as-is per your instruction |
| 8 | No horizontal scroll at 360 | PASS | scrollWidth = clientWidth at 360/390/768/1280/1920/2560 |
| 9 | Screenshots at 360, 390, 768, 1280 (+1920, 2560) | PASS | `test/screens/home-{360,390,768,1280,1920,2560}.png` |
| 10 | No autoplay; no third-party scripts | PASS | 0 `<script>` besides JSON-LD, 0 iframes, 0 third-party requests at every width; 0 broken images |
| 11 | OG + Twitter tags, og:image 1200×630, og:locale es_CO, lang es-CO | PASS | tags verified in index.html |
| 12 | JSON-LD MusicGroup, facts from CONTENT only | PASS | parses; name, members, 2 tracks with release dates, sameAs, email |
| 13 | Favicon from crown, canonical, robots allow | PASS | existing crown favicons reused; canonical https://losrevez.com/; robots.txt Allow; sitemap.xml |
| 14 | Semantic headings, alt text, focus states | PASS | 1 h1 (lockup, alt "Los Revéz") + 4 h2; `:focus-visible` 2px outline (Paper on Ink, Ink on Bone) |
| 15 | Contrast AA | PASS | Lighthouse accessibility 100 (Paper/Ink 15.9:1, Ink/Gold 5.8:1) |
| 16 | Touch targets ≥ 44px | PASS | `smallTouchTargets: []` at all widths |
| 17 | Lighthouse mobile ≥ 90 perf / a11y / SEO | PASS | Perf **94**, A11y **100**, Best Practices **100**, SEO **100** |
| 18 | No layout shift | PASS | CLS **0** |
| 19 | Fonts preloaded, images compressed | PASS | Pilat + Whitney preloaded; hero AVIF square/wide sets by layout; covers responsive AVIF, lazy-loaded |
| 20 | Print stylesheet + A4 PDF, one page per section | PASS | `dist/LosRevez.pdf`: 5 pages, A4. Fonts embedded as CID TrueType with real names (no Type 3); images 2480 px hero (~280 ppi), 1600 px covers (~475 ppi); live, extractable text |
| 21 | "Pre-guardar" and "te avisamos apenas salga" removed | PASS | build guard; old presave page replaced |
| 22 | Colour rules from the design system | PASS | Dark (Ink) for photo sections, Bone for text-dense ones (approved change from "dark only"). Gold only as the hero button, rules, eyebrows, section numbers on dark, and link arrows; never body text; no gold on Bone except rules. Buttons on Bone are Ink fill. No #C0272D / #B8972A |
| 24 | Large screens (2K) | PASS | Split hero fills 100svh with the full band photo and centred text; root size steps at 1600/2200/3000px; container grows with it |
| 23 | Typography and containers match the design system | PASS | Measured at 1280px against the design system: content 1184px (min(1200, screen − 96)); two-column 1.35fr/1fr gap 40 (657+487); cells auto-fit min 230px (295px ×4); header gap 26px. Lead 19/1.5 Ink; body 16/1.68 Ink 78%; dateline Khand 14 600 +1.5 caps inline; meta Khand 12 +2 caps; date line Pilat 26 +2 caps; release title Pilat caps LH 1 tracking 0 #EDEAE2, 28–40px sized to its panel (no guillemets shown; full title for screen readers); email Whitney 26/1.35; song links meta #A9A59B; section title Pilat 32 +0.5; eyebrow Khand 12 +2.5 |

Lighthouse 13.5.0, mobile, simulated throttling, local server with gzip (as GitHub Pages serves):

```
performance      96
accessibility    100
best-practices   100
seo              100
first-contentful-paint     1.1 s
largest-contentful-paint   2.7 s   (hero photo; shares bandwidth with the 136 KB Pilat OTF)
total-blocking-time        0 ms
cumulative-layout-shift    0
speed-index                1.1 s
total-byte-weight          367 KiB (includes lazy-loaded covers)
```

Screenshots are stitched from viewport-by-viewport captures (headless full-page capture skipped painting off-screen images).
