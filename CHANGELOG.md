# Changelog

## 2026-09-30: head meta tags (requested by Gonzalo)

Only the `<head>` meta tags changed. No other copy, layout or file was touched.

| Tag | Before | After |
|---|---|---|
| `<title>`, `og:title`, `twitter:title` | Los Revéz \| Rock desde Latinoamérica | **Los Revéz \| Rock desde Bogotá** |
| `og:description`, `twitter:description` | Banda de rock de Bogotá. Abrimos el cierre de la Maratón de El Gallo de Radioacktiva junto a Kraken y Doctor Krápula. | **Abrimos el cierre de la Maratón de El Gallo de Radioacktiva con Kraken y Doctor Krápula.** |
| `meta name="description"` | (same as the old og:description) | **Abrimos el cierre de la Maratón de El Gallo de Radioacktiva con Kraken y Doctor Krápula. Dos sencillos en 2026.** |

Verified present:
- `og:type` website, `og:url` https://losrevez.com/, `og:locale` es_CO.
- `og:image` and `twitter:image`: absolute URL https://losrevez.com/assets/img/og-losrevez-1200x630.jpg, 1200×630, **58,700 bytes (57 KB)**. That's under the 300 KB limit, so it wasn't recompressed.
- `twitter:card` summary_large_image.
- All `og:` and `twitter:` tags moved to just under `<title>`, near the top of `<head>`.

Notes:
- "Doctor Krápula" (no accent on "Doctor") is Gonzalo's decision and is **unverified**.
- The JSON-LD `description` (structured data, not a meta tag) keeps the previous text, because this request covered meta tags only.
- `print.html` gets the same head from the same build. The PDF is unaffected.
