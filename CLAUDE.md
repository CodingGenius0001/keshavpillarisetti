# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal portfolio website for Keshav Pillarisetti. Pure vanilla HTML/CSS/JS — no build system, no package manager, no framework.

## Development

Serve with any static file server from the repo root. Example:

```bash
npx serve .
# or
python -m http.server 8080
```

There are no build steps, no tests, and no linting configuration.

## Architecture

### File Structure

- `index.html` — Home page (unique layout with animated canvas background and 3D model)
- `about/index.html`, `skills/index.html` — Inner pages (shared layout with `.container` wrapper)
- `styles.css` — Single shared stylesheet for all pages
- `script.js` — Single shared script for all pages, structured as self-contained IIFEs
- `src/` — Static assets: Minecraft-style pixel PNGs (cherry leaves, crafting/enchanting table textures), resume PDF, and `enchanting_texture_hex.js`
- `assets/` — Custom cursor PNG and profile SVG

### script.js IIFE Modules

The script is organized into independent IIFEs, each responsible for one feature:

1. **Theme** — Forces `data-theme="dark"` on `<html>` at load time.
2. **mobileTopNav** — Hamburger menu toggle for the topbar on mobile (`≤640px`).
3. **typewriter** — Cycles through identity words in the hero `<span#typewriter>`.
4. **pixelField** — Animates a `<canvas>` background with falling cherry leaf sprites and floating pixel-art orbs. Leaves use `src/cherry_0.png` through `src/cherry_11.png`; orb frames are hardcoded pixel maps.
5. **heroEnchantingTable** — Loads Three.js from unpkg CDN, then renders a Minecraft enchanting table with a floating animated book into `#heroIcosa`. Texture data comes from `window.__ENCHANTING_TEXTURE_HEX` (set by `src/enchanting_texture_hex.js`, which must load before `script.js`). Supports drag-to-rotate and pointer-follow for the book.
6. **calModal** — Lazily loads the Cal.com embed script on "book a call" button click. Namespace: `keshav-inline`, cal link: `keshavpillarisetti/30min`.

### Styling Conventions

- CSS custom properties defined on `:root` (light) and `[data-theme="dark"]`. Dark is always active.
- Home page uses `body.home` for its distinct full-screen hero layout; inner pages use `body > .container`.
- Font stack: JetBrains Mono / Fira Code / monospace fallbacks.

### Texture System

`src/enchanting_texture_hex.js` sets `window.__ENCHANTING_TEXTURE_HEX` with `top`, `side`, and `bottom` keys. Each value is a hex string encoding raw RGBA pixel data for a 16×16 texture (512 hex chars = 256 pixels × 2 chars/byte × 4 channels). The enchanting table renderer in `script.js` decodes these into `ImageData` for use as Three.js `CanvasTexture`s with `NearestFilter` to preserve the pixel-art look.
