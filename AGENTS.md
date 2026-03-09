# Repository Guidelines

## Project Structure & Module Organization
This repository is a vanilla static site with no framework or build step. The root contains shared entry files: `index.html`, `styles.css`, and `script.js`. Route pages live in folders with their own `index.html`, such as `about/`, `skills/`, `projects/`, `blog/`, `blog/hello-world/`, and `contact/`. Store reusable media in `assets/` and page art or downloadable files in `src/` (for example `src/cherry_0.png` or `src/Keshav Pillarisetti - Resume.pdf`). When adding a new page, follow the existing route pattern: `<section>/index.html`.

## Build, Test, and Development Commands
There is no build pipeline or package-managed dev workflow. Serve the repo root with a static server:

```bash
python -m http.server 8080
npx serve .
```

Use either command from the repository root, then open the local URL in a browser. There are currently no automated test, lint, or build commands.

## Coding Style & Naming Conventions
Match the existing style: 2-space indentation in HTML and CSS, semicolon-terminated vanilla JavaScript, and small self-contained feature blocks in `script.js`. Use lowercase route folders and `index.html` for pages. Prefer kebab-case for CSS classes and descriptive IDs like `bookCallBtn` only when an element is scripted. Keep shared styling in `styles.css` instead of adding page-local `<style>` blocks unless the change is truly page-specific.

## Testing Guidelines
This repo does not include an automated test suite, so changes should be validated manually. Smoke-test every affected route, confirm links and assets resolve, and check responsive behavior around mobile navigation (`<=640px`) and the home page canvas/3D interactions. For visual changes, verify both desktop and mobile layouts before opening a PR.

## Commit & Pull Request Guidelines
Recent history follows Conventional Commit style: `feat:`, `fix:`, `style:`, and `revert:`. Keep subjects short, imperative, and scoped to one change. Pull requests should include a concise summary, linked issue if applicable, manual test notes, and screenshots or a short recording for UI changes.

## Configuration Notes
This site loads some third-party resources directly in the browser, so keep external URLs deliberate and reviewable. Do not commit secrets or environment-specific credentials.
