# CLAUDE.md — Hermanos Energy Website

## Project goal

Replace the Framer website at **https://www.hermanosenergy.com** with a static Astro site hosted on **GitHub Pages**,
visually identical to the live site (measured, not guessed).

## Structure

```
src/
  layouts/Layout.astro        <head>, header, footer, icon sprite, site-wide scripts
  components/                 Header, Footer, IconSprite, Features, GetInTouch, ProductDetail,
                              Photo (optimised <picture>: AVIF/WebP in several widths)
  assets/images/              photos, optimised at build time — use <Photo src="page/name.jpg">
  assets/fonts/               self-hosted Rajdhani + Manrope (src/styles/fonts.css); no Google Fonts
  i18n/en.json, nl.json       ALL visible text (same keys in both; the build fails if they differ)
  i18n/index.ts               useTranslations(lang), localUrl(lang, page), key check
  views/                      page markup, written once per page, takes a `lang` prop
  data/icons.ts               Phosphor icons used on the site
  data/products.ts            product names (Power to Heat/Drive/Power): never translated
  data/productDetails.ts      structure + measured layout values of the 3 product detail pages (text in i18n)
  pages/                      thin wrappers: English at /<page>, Dutch in pages/nl/ at /nl/<page>
  styles/                     base.css (shared) · product-detail.css (template) · one CSS file per page
  scripts/site.js             mobile menu, FAQ, tabs, news slider (auto-pause), fade-up animation
  scripts/contact.js          contact form → Formspark (form ID NG4zIZy6, same as the live site)
  lib/url.ts                  url()/srcset() helpers that respect Astro's `base`
public/images/<page>/         logos, icons and charts (served as-is)
public/                       favicon.png, share-image.jpg (Open Graph)
src/pages/sitemap.xml.ts, robots.txt.ts, 404.astro
.github/workflows/deploy.yml  builds and publishes to GitHub Pages on every push to main
scratchpad/                   measurement and test tools (not deployed)
```

Routes match the live site: `/`, `/product`, `/aboutus`, `/contact`, `/power-to-heat`, `/power-to-drive`, `/power-to-power`.

## Rules

1. **Measure, don't guess.** Every size, colour and spacing comes from the live site via Playwright
   (`scratchpad/extract.mjs`). Verify changes with `scratchpad/compare.mjs` (footer y = total page height).
2. **Copy layout quirks, not broken content.** Keep deliberate-looking oddities; don't copy missing/clipped content
   or stale tablet-only copy. List anything not copied for the user.
3. **CSS cascade layers:** every stylesheet declares `@layer base, components, page;` — shared styles go in `base`,
   section templates in `components`, page CSS in `page`. Don't rely on file load order.
4. **Links and images** always go through `url()` from `src/lib/url.ts` (the site runs under `/hermanos-website/`
   on GitHub Pages and under `/` on the own domain).
5. **No frameworks/libraries** beyond Astro; vanilla JS and CSS only.
6. **Never submit the contact form for real in tests** — intercept `https://submit-form.com/**` with Playwright.
7. Run one plain shell command per call (no pipes, variables or `&&` chains) — those trigger approval prompts.
8. **No hard-coded text in markup or scripts.** Add it to both `src/i18n/en.json` and `nl.json`; scripts get labels
   through data attributes. Product names come from `src/data/products.ts`. Dutch uses informal "je".
9. **Never add AI attribution to commits or pull requests** — no `Co-Authored-By: Claude` trailer and no
   "Generated with Claude Code" line. Plain commit messages only.

## Breakpoints

Desktop ≥ 1200px · Tablet 810–1199px · Mobile < 810px (measured at 1440 / 1000 / 390).

## Verifying a page

```
npm run build
npm run preview                      # http://localhost:4321/hermanos-website/
node scratchpad/extract.mjs http://localhost:4321/hermanos-website/<page> scratchpad/out/<page>-astro
node scratchpad/compare.mjs scratchpad/out/<page> scratchpad/out/<page>-astro summary
node scratchpad/smoke-astro.mjs      # links (en + nl), language switch, menu, FAQ, tabs, slider, form (intercepted)
node scratchpad/check-overflow.mjs http://localhost:4321/hermanos-website nl   # text cut off after translating
```

## Roadmap

- [x] Astro site with all 7 pages, identical to the approved prototype
- [x] Production basics: meta/OG tags, favicon, sitemap, 404, AVIF/WebP images, self-hosted fonts,
      click-to-play YouTube, typo fixes, GitHub Actions deploy
- [x] Dutch version (`/nl/...`) built at compile time, EN/NL switch in the menu
- [ ] Switch the hermanosenergy.com domain (then set `site` to the domain and `base` to '/')
- [ ] Visitor statistics (the Framer site used Framer's own analytics; nothing replaces it yet)
