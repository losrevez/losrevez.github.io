---
name: Los Revéz
description: Cyber-Vintage rock band microsite — 90s analog grit meeting 2026 digital precision
colors:
  ink-black: "#1B1919"
  brass-gold: "#A89360"
  bone: "#D2CEC3"
  paper-white: "#F3F4F2"
typography:
  display:
    fontFamily: "Pilat Wide, ui-sans-serif, sans-serif"
    fontSize: "clamp(44px, 10vw, 88px)"
    fontWeight: 800
    lineHeight: 0.9
    letterSpacing: "0.5px"
  label:
    fontFamily: "Khand, ui-sans-serif, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: "normal"
    letterSpacing: "2.5px"
  body:
    fontFamily: "Whitney Cond, ui-sans-serif, sans-serif"
    fontSize: "16px"
    fontWeight: 500
    lineHeight: 1.6
    letterSpacing: "normal"
  meta:
    fontFamily: "Pilat Wide, ui-sans-serif, sans-serif"
    fontSize: "clamp(16px, 3vw, 22px)"
    fontWeight: 600
    lineHeight: "normal"
    letterSpacing: "2px"
rounded:
  sm: "2px"
  glow: "6px"
spacing:
  sm: "14px"
  md: "32px"
  lg: "56px"
components:
  button-primary:
    backgroundColor: "{colors.ink-black}"
    textColor: "{colors.paper-white}"
    rounded: "{rounded.sm}"
    padding: "16px 34px"
  button-primary-hover:
    backgroundColor: "#332F2F"
---

# Design System: Los Revéz

## Overview

**Creative North Star: "The Desgastada Press"**

The system reads as a print run that has already lived a little — a worn-ink lockup, film-grain paper — set against crisp, exact geometric type and a single precise animated glow. Nothing here is soft or app-like; corners are sharp, and the one piece of true digital polish (the ember glow, now bleeding from the hero art into the page background) is deliberately the only thing in motion, so the "2026 precision" half of the brief reads as restraint rather than decoration layered onto a vintage shell.

Brass Gold is treated as a scarce material, not a UI color: a rule, a corner, a crown, a glow — never a surface large enough to need to be read as text. The two grounds (Ink Black, Bone) each carry their own state of the same wordmark — a worn "Desgastada" ink mark and a clean knockout — so the system already speaks in exactly the vocabulary its own logo files established, rather than inventing a separate UI language.

**Key Characteristics:**
- Flat, hairline-and-grain depth — no shadows anywhere
- Sharp, near-square geometry (2px radius ceiling)
- One scarce accent color, ornament-only
- Exactly one animated element at a time (restraint over decoration)
- Type roles are fixed and load-bearing: the wordmark face never does headline duty

## Colors

Six colors total, four load-bearing; sourced directly from the band's own design-system file, not invented for this build.

### Primary
- **Brass Gold** (`#A89360`): the only chromatic color in the system. Ornament exclusively — the eyebrow rule, the pulsing ember glow behind hero art. Documented failing contrast (1.9:1) as body text or a button fill against Bone; never used that way.

### Neutral
- **Ink Black** (`#1B1919`): dark-mode ground and the default text/button-fill color on light grounds. A warm off-black, not pure `#000`.
- **Bone** (`#D2CEC3`): the current page ground — sampled from the band's own cover art, not from the logo file itself.
- **Paper White** (`#F3F4F2`): the mark's knockout white and the button label color on Ink Black; a fraction green, deliberately not pure `#FFFFFF`.

### Named Rules
**The Ornament-Only Gold Rule.** Brass Gold never carries body text or a button fill on the Bone ground — confirmed failing at 1.9:1 contrast. It appears only as a rule, a corner accent, or a glow.

## Typography

**Display Font:** Pilat Wide (with ui-sans-serif fallback)
**Body Font:** Whitney Condensed (with ui-sans-serif fallback)
**Label Font:** Khand (with ui-sans-serif fallback)
**Wordmark-only Font:** Sporty Pro — reserved for the literal band name, never used as a general headline face.

**Character:** A tall, athletic display face against a tightly tracked, all-caps utility face — the pairing already used on the band's own single covers, carried over exactly rather than reinterpreted for the web.

### Hierarchy
- **Display** (800, `clamp(44px, 10vw, 88px)`, 0.9): release/song titles and every headline except the band name itself.
- **Meta** (600, `clamp(16px, 3vw, 22px)`, tracked 2px): the release/date line directly under a Display title — sits between Display and Label in weight of attention, set in the display face but at label-adjacent size.
- **Label** (600, 12px, tracked 2.5px, uppercase): eyebrows, meta text, tags.
- **Body** (500, 16px, 1.6): running copy, CTA labels, secondary links.

### Named Rules
**The Wordmark Exception Rule.** Sporty Pro is reserved for the band name itself — as logotype or the rare headline whose content is literally "Los Revéz." Every other headline is Pilat Wide.

## Layout

Single centered column on mobile; a two-column grid (art column weighted `1.2fr` against a `1fr` info column) above 760px, capped at a 1120px measure, gaps scaling from 32px to 56px. Content is vertically centered in the viewport rather than pinned to the top — the page is short by design, one screen's worth of decision.

## Elevation & Depth

Flat by default; no `box-shadow` anywhere in the implementation. Depth and texture come from two non-shadow devices instead: a body-wide film-grain overlay (`feTurbulence`, 5% opacity, multiply blend); and a slow pulsing radial gold glow bleeding from behind the hero art into the surrounding page.

### Named Rules
**The No-Shadow Rule.** Depth is conveyed through grain and glow — never `box-shadow`.

## Shapes

Sharp, print-adjacent geometry throughout: the one button caps at a 2px radius, and every hard-edged surface — the album art, the layout grid — is square-cornered. One exception, deliberately distinct from the hard-surface ceiling: the ember glow's soft radial shape carries a 6px radius (`{rounded.glow}`) on its own bounding box — it has no visible hard edge to round, so the value governs falloff softness, not a corner a viewer can perceive as "rounded."

## Components

### Buttons
- **Shape:** near-square, 2px radius
- **Primary:** Ink Black background, Paper White label, 16px/34px padding. Hover → `#332F2F` (a lighter near-black) — never gold, since a gold fill fails contrast on the Bone ground.
- **Secondary:** no button chrome at all — a plain underlined text link (Ink at 72% opacity), used for the one secondary action on a view.

### Navigation
No nav bar. The header carries only the wordmark mark (the Ink/"Desgastada" version on light grounds, the Paper White knockout version on dark) — no link list exists yet.

### Signature Component: The Ember Glow
A radial Brass Gold gradient centered behind the hero album art, sized to bleed well past the art into the surrounding page background rather than staying confined to a tight halo. Animates on a slow 7-second ease-in-out pulse (opacity 0.55→1, scale 0.97→1.05), disabled under `prefers-reduced-motion`. The one deliberate motion on the page, tied directly to the brand's torch/fire symbol ("creative drive that doesn't go out") rather than a generic hover flourish. Now doubles as the page's ambient background treatment — the site no longer uses a separate framing device, so the glow carries that job alone.

## Do's and Don'ts

### Do:
- **Do** keep Brass Gold to ornament only — rules, corners, the ember glow.
- **Do** use Pilat Wide for every headline except the literal band name (Sporty Pro's exclusive job).
- **Do** keep the page flat — grain and glow carry texture, never shadows.

### Don't:
- **Don't** set Brass Gold as a button fill or body text on the Bone ground — confirmed failing at 1.9:1 contrast.
- **Don't** add a second animated element without removing the ember glow first; the system commits to one signature motion at a time.
- **Don't** round any hard-edged surface (buttons, cards, imagery) past the 2px ceiling — the form language is sharp, not app-soft. The ember glow's 6px falloff radius is the one named exception, since it has no hard edge to perceive as rounded.
