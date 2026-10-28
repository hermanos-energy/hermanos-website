# CLAUDE.md — Hermanos Energy Website

## Project goal

Replace the Framer website at **https://www.hermanosenergy.com** with a static Astro site hosted on **GitHub Pages**,
visually identical to the live site (measured, not guessed).

## Structure

```
src/
  layouts/Layout.astro        <head>, header, footer, icon sprite, site-wide scripts
  components/                 Header, Footer, IconSprite, Features, GetInTouch, ProductDetail
  data/icons.ts               Phosphor icons used on the site
  data/productDetails.ts      content + measured layout values of the 3 product detail pages
  pages/                      index, product, aboutus, contact, power-to-heat, power-to-drive, power-to-power
  styles/                     base.css (shared) · product-detail.css (template) · one CSS file per page
  scripts/site.js             mobile menu, FAQ, tabs, news slider (auto-pause), fade-up animation
  scripts/contact.js          contact form → Formspark (form ID NG4zIZy6, same as the live site)
  lib/url.ts                  url()/srcset() helpers that respect Astro's `base`
public/images/<page>/         images downloaded from the live site
scratchpad/                   measurement tools + the approved plain-HTML prototype (not deployed)
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
8. **Never add AI attribution to commits or pull requests** — no `Co-Authored-By: Claude` trailer and no
   "Generated with Claude Code" line. Plain commit messages only.

## Breakpoints

Desktop ≥ 1200px · Tablet 810–1199px · Mobile < 810px (measured at 1440 / 1000 / 390).

## Verifying a page

```
npm run build
npm run preview                      # http://localhost:4321/hermanos-website/
node scratchpad/extract.mjs http://localhost:4321/hermanos-website/<page> scratchpad/out/<page>-astro
node scratchpad/compare.mjs scratchpad/out/<page> scratchpad/out/<page>-astro summary
node scratchpad/smoke-astro.mjs      # links, menu, FAQ, tabs, slider, form (intercepted)
```

## Roadmap

- [x] Astro site with all 7 pages, identical to the approved prototype
- [ ] Production basics: meta/OG tags, favicon, sitemap, 404, WebP/AVIF images, self-hosted fonts
- [ ] Dutch version (`/nl/...`) built at compile time
- [ ] GitHub Actions deploy to GitHub Pages, then switch the hermanosenergy.com domain
