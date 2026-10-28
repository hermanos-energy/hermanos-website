# Hermanos Energy website

The website of [Hermanos Energy](https://www.hermanosenergy.com), in English and Dutch.
A static site built with [Astro](https://astro.build) and hosted on GitHub Pages.

Preview: https://hermanos-energy.github.io/hermanos-website/

## Getting started

Requires Node.js 22 or newer.

```
npm install
npm run dev        # local development server with live reload: http://localhost:4321/hermanos-website/
npm run build      # builds the site into dist/
npm run preview    # serves the built site from dist/
```

Every push to `main` is built and published automatically (`.github/workflows/deploy.yml`).
Work on a branch and merge it through a pull request.

## Changing text

All text on the site lives in two files:

- `src/i18n/en.json`: English
- `src/i18n/nl.json`: Dutch

Both files have exactly the same structure. To change a text, edit it in both files.
To add a text, add the same key to both: the build stops with a clear message if a key is missing in one of them.
Some texts contain simple HTML such as `<br>` (line break) or `<em>` (italics).

Product names (Power to Heat, Power to Drive, Power to Power) are set once in `src/data/products.ts` and are never
translated.

## Changing images

- Photos: `src/assets/images/<page>/`. They are automatically resized and converted to AVIF/WebP during the build.
  Replace a file with one of the same name to swap a photo.
- Logos, icons and charts: `public/images/<page>/`. These are used as they are.
- The image shown when a link is shared (LinkedIn, WhatsApp, …): `public/share-image.jpg`.

## How the site is organised

| Where | What |
|---|---|
| `src/views/` | The markup of each page, written once and used for both languages |
| `src/pages/` | One small file per page: English at `/<page>`, Dutch in `src/pages/nl/` at `/nl/<page>` |
| `src/components/` | Shared parts: header, footer, contact block, key features, product detail template |
| `src/layouts/Layout.astro` | The shell around every page: `<head>`, header, footer, scripts |
| `src/styles/` | CSS: `base.css` for the whole site, one file per page |
| `src/scripts/` | Small vanilla JavaScript files: menu, FAQ, tabs, news slider, contact form |
| `src/data/` | Product names and the structure of the product detail pages |
| `scratchpad/` | Developer tools for measuring and testing the site (not published) |

Visitors whose browser prefers Dutch are taken to the Dutch version, until they pick a language with the EN / NL
switch in the menu.

The contact form sends messages through [Formspark](https://formspark.io) (form `NG4zIZy6`).

## Testing

With `npm run preview` running:

```
node scratchpad/smoke-astro.mjs                                               # links, language switch, menu, FAQ, tabs, slider, form
node scratchpad/check-overflow.mjs http://localhost:4321/hermanos-website     # text that is cut off (add "nl" for Dutch)
```

The tests need Playwright (`npm install` inside `scratchpad/`, then `npx playwright install chromium`).
The contact form test never sends a real message.

More detail for developers, including the rules the site was built by, is in `CLAUDE.md`.
