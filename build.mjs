// Builds index.html (web) and dist/print.html (A4 / PDF) from content.json.
// Both come from the same render() so web and PDF cannot drift.
// Run: npm run build
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { readdirSync } from 'node:fs';

const content = JSON.parse(await readFile('content.json', 'utf8'));
const siteCss = await readFile('src/site.css', 'utf8');
const printCss = await readFile('src/print.css', 'utf8');

// Fallback-font metrics (see scripts/font-metrics.mjs). They keep the font swap from shifting layout.
const METRICS = {
  PILAT_ADJUST: 105.2, PILAT_ASC: 102.7, PILAT_DESC: 20,
  WHITNEY_ADJUST: 86.4, WHITNEY_ASC: 106.5, WHITNEY_DESC: 23.2,
};
const css = siteCss.replace(/__([A-Z_]+)__/g, (_, k) => METRICS[k]);

const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const IMG = '/assets/img';
const srcset = (name, ext, widths) => widths.map((w) => `${IMG}/${name}-${w}.${ext} ${w}w`).join(', ');
const SQUARE = [480, 640, 800, 1080, 1440, 1920];
const WIDE = [1024, 1280, 1600];
// Hero art direction: square crop on phones and in the desktop split (photo column ≈ 54vw);
// wide crop only for tablets (768–1023px), where the photo spans the full width above the text.
const SPLIT_MQ = '(min-width: 1024px)';
const TABLET_MQ = '(min-width: 768px) and (max-width: 1023px)';
const PHONE_MQ = '(max-width: 767px)';

const icon = {
  image: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="3" y="5" width="18" height="14" rx="1" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="9" cy="10" r="1.6" fill="currentColor"/><path d="M4 17l5-5 4 4 3-3 4 4" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>',
  ext: '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M5 3h8v8M13 3L3 13" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>',
};

const ext = (href) => /^https?:/.test(href) ? ' target="_blank" rel="noopener"' : '';
const picture = (name, widths, sizes, alt, w, h, cls = '') => `<picture>
        <source type="image/avif" srcset="${srcset(name, 'avif', widths)}" sizes="${sizes}">
        <source type="image/webp" srcset="${srcset(name, 'webp', widths)}" sizes="${sizes}">
        <img${cls} src="${IMG}/${name}-${widths[0]}.jpg" srcset="${srcset(name, 'jpg', widths)}" sizes="${sizes}" width="${w}" height="${h}" alt="${esc(alt)}" loading="lazy" decoding="async">
      </picture>`;

// Sections are numbered in the order they render, so enabling a hidden section renumbers the rest.
function sectionOpen(s, n, tone) {
  // Design-system page header (number, Pilat title, full-width hairline) on both grounds.
  return `<section class="section section--${tone}" id="${esc(s.id)}" aria-labelledby="${esc(s.id)}-t">
  <div class="wrap">
    <div class="section-head"><span class="section-head__num" aria-hidden="true">${String(n).padStart(2, '0')}</span><h2 id="${esc(s.id)}-t">${esc(s.heading)}</h2></div>`;
}
const sectionClose = '  </div>\n</section>';

const prose = (s, n, tone) => `${sectionOpen(s, n, tone)}
${s.paragraphs.map((p, i) => `    <p class="${i === 0 ? 'lead' : 'body'}">${esc(p)}</p>`).join('\n')}
${sectionClose}`;

function render(c, mode) {
  const { site, hero, banda, historia, escucha, hidden, footer } = c;
  // The PDF keeps the original heading (CONTRATAR); the web shows CONTACTO.
  const contratar = mode === 'print' && c.contratar.printHeading ? { ...c.contratar, heading: c.contratar.printHeading } : c.contratar;

  const heroHtml = `<header class="hero">
  <figure class="hero__photo">
    <picture>
      <source media="${SPLIT_MQ}" type="image/avif" srcset="${srcset('hero-square', 'avif', SQUARE)}" sizes="54vw">
      <source media="${SPLIT_MQ}" type="image/webp" srcset="${srcset('hero-square', 'webp', SQUARE)}" sizes="54vw">
      <source media="${SPLIT_MQ}" srcset="${srcset('hero-square', 'jpg', SQUARE)}" sizes="54vw">
      <source media="${TABLET_MQ}" type="image/avif" srcset="${srcset('hero-wide', 'avif', WIDE)}" sizes="100vw">
      <source media="${TABLET_MQ}" type="image/webp" srcset="${srcset('hero-wide', 'webp', WIDE)}" sizes="100vw">
      <source media="${TABLET_MQ}" srcset="${srcset('hero-wide', 'jpg', WIDE)}" sizes="100vw">
      <source type="image/avif" srcset="${srcset('hero-square', 'avif', SQUARE)}" sizes="100vw">
      <source type="image/webp" srcset="${srcset('hero-square', 'webp', SQUARE)}" sizes="100vw">
      <img src="${IMG}/hero-square-800.jpg" srcset="${srcset('hero-square', 'jpg', SQUARE)}" sizes="100vw"
           width="1080" height="1076" alt="${esc(c.a11y.heroPhotoAlt)}" fetchpriority="high" decoding="async">
    </picture>
  </figure>
  <div class="hero__plate">
    <div class="hero__inner">
      <p class="eyebrow">${esc(hero.eyebrow)}</p>
      <h1 class="hero__name"><img src="${IMG}/losrevez-lockup.svg" width="898" height="410" alt="${esc(hero.name)}"></h1>
      <p class="hero__dateline">${esc(hero.tagline)}</p>
      <p class="hero__lead">${esc(hero.lead)}</p>
      <div class="actions">
        <a class="btn btn--gold" href="${esc(hero.secondary.href)}">${esc(hero.secondary.label)}</a>
      </div>
    </div>
  </div>
</header>`;

  const bandaHtml = (n) => `${sectionOpen(banda, n, 'light')}
    <div class="banda">
      <p class="banda__lead">${banda.lead.split(/(?<=\.)\s+/).map((x) => `<span>${esc(x)}</span>`).join(' ')}</p>
      <div>
        <ul class="members">
${banda.members.map((m) => `          <li><span class="members__name">${esc(m.name)}</span> ${esc(m.role)}</li>`).join('\n')}
        </ul>
        <p class="banda__detail">${esc(banda.detail)}</p>
      </div>
    </div>
${sectionClose}`;

  // Image slot for a timeline date: the image if content.json has one, otherwise a placeholder.
  // Widths available for a timeline image, read from the files on disk.
  const historiaWidths = (name) => readdirSync('assets/img/historia')
    .map((f) => f.match(new RegExp(`^${name}-(\\d+)\\.jpg$`))).filter(Boolean).map((m) => +m[1]).sort((a, b) => a - b);
  const shot = (item, sizes) => {
    if (!item.image) return `<figure class="shot shot--empty" aria-hidden="true">${icon.image}</figure>`;
    const w = historiaWidths(item.image);
    if (!w.length) throw new Error(`no images for ${item.image} in assets/img/historia`);
    const set = (ext) => w.map((x) => `/assets/img/historia/${item.image}-${x}.${ext} ${x}w`).join(', ');
    return `<figure class="shot shot--img"><picture>
        <source type="image/avif" srcset="${set('avif')}" sizes="${sizes}">
        <source type="image/webp" srcset="${set('webp')}" sizes="${sizes}">
        <img src="/assets/img/historia/${item.image}-${w[0]}.jpg" srcset="${set('jpg')}" sizes="${sizes}" alt="${esc(item.imageAlt || '')}" loading="lazy" decoding="async">
      </picture></figure>`;
  };
  const dated = (i, cls) => `<time class="${cls}" datetime="${esc(i.datetime)}">${esc(i.date)}:</time>`;
  const regular = historia.items.filter((i) => !i.featured);
  const featured = historia.items.find((i) => i.featured);
  const historiaHtml = (n) => `${sectionOpen(historia, n, 'light')}
    <ol class="timeline">
${regular.map((i) => `      <li>${shot(i, '(min-width: 1024px) 300px, (min-width: 640px) 50vw, 100vw')}<p>${dated(i, 'timeline__date')} ${esc(i.text)}</p></li>`).join('\n')}
    </ol>
${featured ? `    <article class="featured">
      ${shot(featured, '(min-width: 860px) 640px, 100vw')}
      <div class="featured__body"><p>${dated(featured, 'featured__date')} ${esc(featured.text)}</p></div>
    </article>` : ''}
${sectionClose}`;

  // Group the four links by song, keeping content order. The meta is the label without the song name.
  const songs = [];
  for (const l of escucha.links) {
    let s = songs.find((x) => x.song === l.song);
    if (!s) songs.push((s = { song: l.song, links: [] }));
    s.links.push({ ...l, meta: l.label.slice(l.song.length).replace(/^,?\s+/, '') });
  }
  const escuchaHtml = (n) => `${sectionOpen(escucha, n, 'dark')}
    <div class="songs">
${songs.map((s) => {
    const cover = escucha.covers[s.song];
    return `      <article class="song">
        <figure class="song__cover">
      ${picture(cover.name, [480, 640, 800], '(min-width: 1000px) 260px, (min-width: 760px) 45vw, calc(100vw - 40px)', cover.alt, 800, 800)}
        </figure>
        <div class="song__body">
          <h3 class="song__title">${esc(s.song)}</h3>
          <ul class="song__links">
${s.links.map((l) => `            <li><a href="${esc(l.href)}"${ext(l.href)} aria-label="${esc(l.label)}">${esc(l.meta)}${icon.ext}</a></li>`).join('\n')}
          </ul>
        </div>
      </article>`;
  }).join('\n')}
    </div>
    <ul class="follow" aria-label="${esc(escucha.followLabel)}">
      <li class="follow__label eyebrow" aria-hidden="true">${esc(escucha.followLabel)}</li>
${escucha.follow.map((l) => `      <li><a href="${esc(l.href)}"${ext(l.href)}>${esc(l.label)}</a></li>`).join('\n')}
    </ul>
${sectionClose}`;

  const contratarHtml = (n) => `${sectionOpen(contratar, n, 'light')}
    <p class="contact__line">${esc(contratar.before)}<br><a class="contact__email" href="mailto:${esc(contratar.email)}">${esc(contratar.email)}</a></p>
${sectionClose}`;

  // Order and ground of every section; hidden ones only when enabled.
  const plan = [
    [bandaHtml, true],
    [(n) => prose(hidden.diego, n, 'light'), hidden.diego.enabled],
    [historiaHtml, true],
    [(n) => prose(hidden.enVivo, n, 'dark'), hidden.enVivo.enabled],
    [escuchaHtml, true],
    [(n) => prose(hidden.empresas, n, 'dark'), hidden.empresas.enabled],
    [contratarHtml, true],
  ].filter(([, on]) => on);
  const sectionsHtml = plan.map(([fn], i) => fn(i + 1)).join('\n\n');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MusicGroup',
    name: hero.name,
    url: site.url,
    description: site.jsonLdDescription || site.description,
    genre: 'Rock',
    email: site.email,
    image: site.url + site.ogImage,
    logo: site.url + 'assets/img/losrevez-lockup.svg',
    location: { '@type': 'Place', name: 'Bogotá' },
    member: ['Diego Sáenz', 'Diego Correa', 'Gonzalo Pizarro'].map((name) => ({ '@type': 'Person', name })),
    track: [
      { '@type': 'MusicRecording', name: 'Quiero Que Vengas', datePublished: '2026-02-27', url: escucha.links[2].href },
      { '@type': 'MusicRecording', name: 'Monstruo', datePublished: '2026-08-14', url: escucha.links[3].href },
    ],
    sameAs: escucha.follow.map((l) => l.href),
  };

  const styles = mode === 'print'
    ? `<style>${css}\n${printCss}</style>`
    : `<style>${css}\n@media print{${printCss}}</style>`;

  const robots = mode === 'print' ? 'noindex, nofollow' : 'index, follow';
  const ogImage = site.url + site.ogImage;

  return `<!DOCTYPE html>
<html lang="${site.lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(site.title)}</title>
<meta property="og:type" content="website">
<meta property="og:url" content="${site.url}">
<meta property="og:locale" content="${site.ogLocale}">
<meta property="og:site_name" content="${esc(hero.name)}">
<meta property="og:title" content="${esc(site.title)}">
<meta property="og:description" content="${esc(site.ogDescription)}">
<meta property="og:image" content="${ogImage}">
<meta property="og:image:secure_url" content="${ogImage}">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(c.a11y.heroPhotoAlt)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(site.title)}">
<meta name="twitter:description" content="${esc(site.ogDescription)}">
<meta name="twitter:image" content="${ogImage}">
<meta name="description" content="${esc(site.description)}">
<meta name="robots" content="${robots}">
<meta name="theme-color" content="#1B1919">
<meta name="color-scheme" content="dark">
<link rel="canonical" href="${site.url}">

<link rel="preload" href="/assets/fonts/PilatWide.otf" as="font" type="font/otf" crossorigin>
<link rel="preload" href="/assets/fonts/WhitneyCond.otf" as="font" type="font/otf" crossorigin>
<link rel="preload" as="image" type="image/avif" media="${PHONE_MQ}" imagesrcset="${srcset('hero-square', 'avif', SQUARE)}" imagesizes="100vw" fetchpriority="high">
<link rel="preload" as="image" type="image/avif" media="${TABLET_MQ}" imagesrcset="${srcset('hero-wide', 'avif', WIDE)}" imagesizes="100vw" fetchpriority="high">
<link rel="preload" as="image" type="image/avif" media="${SPLIT_MQ}" imagesrcset="${srcset('hero-square', 'avif', SQUARE)}" imagesizes="54vw" fetchpriority="high">

<link rel="icon" href="/assets/favicon.ico" sizes="any">
<link rel="icon" href="/assets/favicon-32.png" type="image/png" sizes="32x32">
<link rel="icon" href="/assets/favicon-16.png" type="image/png" sizes="16x16">
<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">


<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
${styles}
</head>
<body>
${heroHtml}
<main id="main">
${sectionsHtml}
</main>
${mode === 'print' ? '' : `<footer class="footer">
  <div class="wrap">
    <img src="${IMG}/losrevez-lockup.svg" width="88" height="40" alt="" loading="lazy">
    <ul class="footer__social" aria-label="${esc(escucha.followLabel)}">
${escucha.follow.map((l) => `      <li><a href="${esc(l.href)}"${ext(l.href)}>${esc(l.label)}</a></li>`).join('\n')}
    </ul>
    <p class="footer__meta"><span>${esc(footer.location)}</span><span aria-hidden="true">·</span><span>${esc(footer.copyright)}</span></p>
  </div>
</footer>`}
</body>
</html>
`;
}

// Guard rails: fail the build on anything the brief forbids.
const FORBIDDEN = [
  /\bReyes\b/i, /\bReves\b/i, /wa\.me/i, /whatsapp/i, /api\.whatsapp/i,
  /#C0272D/i, /#B8972A/i, /Pre-guardar/i, /te avisamos/i, /autoplay/i,
  /<script(?![^>]*application\/ld\+json)/i,
];
// index.html is the site. The print version is only an input for the PDF, so it goes to dist/ (gitignored, never deployed).
await mkdir('dist', { recursive: true });
for (const [file, mode] of [['index.html', 'web'], ['dist/print.html', 'print']]) {
  const html = render(content, mode);
  const hit = FORBIDDEN.find((re) => re.test(html));
  if (hit) throw new Error(`${file}: forbidden pattern ${hit}`);
  await writeFile(file, html);
  console.log(`wrote ${file} (${(Buffer.byteLength(html) / 1024).toFixed(1)} KB)`);
}
