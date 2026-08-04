# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary users are fans and prospective fans of Los Revéz who arrive via social media, shared links, or word of mouth. Their immediate job on this surface: learn about the "Monstruo" single (releasing 2026-08-14) and act on it — pre-save it, follow the band on Spotify, or follow on Instagram/TikTok/YouTube. A secondary future audience (Phase 2) includes fans wanting bio/contact info and press/media contacts.

## Product Purpose

A single-band artist website for Los Revéz, a Bogotá rock band. Current phase: convert visitors into presaves/follows for "Monstruo" ahead of its 2026-08-14 release. Planned Phase 2: a full landing page (bio, contact form, streaming links for released tracks, socials). Success today is measured by presave/follow actions; later, by contact-form submissions and streaming clicks.

## Positioning

For a single-artist microsite, positioning is the band's own identity rather than a generic mechanism claim: Los Revéz is a Bogotá rock band making "rock comercial hecho con criterio, profesionalismo y sinceridad," evolved from a prior project (Pirañas), with a documented visual brand direction ("Cyber-Vintage": friction between 90s analog grit and 2026 digital precision) that a neighboring band's page could not truthfully reuse.

## Operating Context

Static site hosted on GitHub Pages under a custom domain (losrevez.com via CNAME) — no server-side computation available; any dynamic behavior must be client-side JS or nothing. Two-phase build: Phase 1 coming-soon/presave page (current, live at `index.html`); Phase 2 full landing page planned next. A separate press-release page already exists at `/prensa/monstruo/`, currently marked `noindex` — its copy is a draft, not yet approved for public/general reuse.

## Capabilities and Constraints

- Static HTML/CSS/JS only, no build step, no framework.
- Real band assets already in the repo: band photography, single artwork, self-hosted webfonts (Pilat Wide, Sporty Pro, Khand, Whitney Condensed, Panchang, Technor), and a documented design-system reference (`assets/LosRevez_DesignSystem.html`) with confirmed color tokens — Ink Black `#1B1919`, Brass Gold `#A89360`, Bone `#D2CEC3`, Paper White `#F3F4F2` — and typographic roles (Sporty Pro = wordmark only, Pilat Wide = headlines/titles, Khand = labels/eyebrows, Whitney Condensed = body/UI).
- Confirmed public links: DistroKid presave (hyperfollow), Spotify artist profile, Instagram/TikTok/YouTube. Twitter/X handle is reserved but explicitly must not be published.
- The design system's red accent (`#C0272D`) is marked unresolved/not sourced from official brand files — use cautiously, ornament only if at all.
- Whitney Condensed has only one weight (Medium) supplied; no bold weight exists yet for body-copy emphasis.

## Brand Commitments

- Name: Los Revéz. Tagline: "No llegamos como se esperaba. Llegamos como somos."
- Voice: mature but warm, not pretentious, self-aware, willing to laugh at itself, vulnerable without being weak, speaks directly to its audience rather than from a pedestal.
- Recurring symbols: a three-pointed crown (the three band members, unity not individual power) and a torch/fire (creative drive that doesn't go out).
- Structural (not visual-copying) references the user pointed to: foofighters.com (homepage simplicity), ca7rielypacoamoroso.com (single-focus coming-soon layout), dontetto.com (visual-first with a contact link), muse.mu (contact form with a phone/email toggle).

## Evidence on Hand

- Confirmed public short bio: "Los Revéz is a Bogotá rock band that makes music for people who kept dreaming even when the path wasn't straight. Grown out of a previous project, Pirañas, the band writes about what you think but don't always say — with heart, self-aware humor, and no interest in following a straight line to get there."
- Contact: losrevez@gmail.com. Spotify artist profile: https://open.spotify.com/artist/6fYQDQ6qRVZGsMLmicPu2P. YouTube: https://www.youtube.com/@LosRevezMusic ("Quiero Que Vengas" video is live; Spotify/Apple Music versions of that track are still pending). Presave: https://distrokid.com/hyperfollow/losrevz/monstruo, releasing 2026-08-14.
- Explicit absence future work must not fabricate: no approved marketing copy/story for "Monstruo" beyond the still-noindexed press-release draft; no confirmed testimonials, press coverage, or tour dates exist yet.

## Product Principles

1. The brand doc's tokens and contrast rules are binding: gold is ornament only, never body text or a button fill on light (Bone) grounds.
2. Static-only hosting is a hard constraint — no feature may require server-side logic.
3. Presave/follow conversion is the current single measure of success; don't dilute the one primary action with competing CTAs.
4. Preserve the band's real voice (self-aware, warm, direct) in copy instead of defaulting to generic hyperfollow-page language.
5. Ship Phase 1 minimal and correct before expanding scope into Phase 2.

## Accessibility & Inclusion

No product-specific requirement beyond standard web accessibility. The current presave page's focus states, aria-labels, and landmark structure were independently verified (via `/impeccable critique`) to exceed typical norms for this kind of page.
