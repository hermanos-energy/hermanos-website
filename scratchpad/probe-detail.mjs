// Usage: node probe-detail.mjs <page>   e.g. power-to-heat
// One-off probe for the product detail pages: text markup (desktop + tablet, to catch copy that differs),
// icons, links, image srcsets, and every tab state at every breakpoint. Writes out/<page>/detail.json.
import { chromium } from 'playwright';
import fs from 'node:fs';

const page = process.argv[2];
const url = `https://www.hermanosenergy.com/${page}`;
const VIEWPORTS = { desktop: 1440, tablet: 1000, mobile: 390 };
const clean = (h) => h.replace(/ (style|class|data-[\w-]+|dir)="[^"]*"/g, '').replace(/<!--\/?\$-->/g, '');

const b = await chromium.launch();
const result = { texts: {}, tabs: {} };

for (const [bp, width] of Object.entries(VIEWPORTS)) {
  const p = await b.newPage({ viewport: { width, height: 900 } });
  await p.goto(url, { waitUntil: 'networkidle' });
  // Scroll through so lazy content renders.
  await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 400) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 100)); } });

  result.texts[bp] = await p.evaluate(() => [...document.querySelectorAll('h1.framer-text, h2.framer-text, h3.framer-text, p.framer-text')]
    .filter((e) => e.getBoundingClientRect().width > 0 && !e.closest('nav, footer')).map((e) => e.outerHTML));
  result.texts[bp] = result.texts[bp].map(clean);

  if (bp === 'desktop') {
    Object.assign(result, await p.evaluate(() => {
      const svgOf = (svg) => { const c = svg.cloneNode(true);
        c.querySelectorAll('use').forEach((u) => { const t = document.querySelector(u.getAttribute('href')); if (t) u.replaceWith(t.cloneNode(true)); });
        return c.outerHTML.replace(/ (style|class|data-[\w-]+)="[^"]*"/g, ''); };
      const svgs = [...document.querySelectorAll('svg')].filter((s) => !s.closest('nav, footer'))
        .map((s) => ({ w: Math.round(s.getBoundingClientRect().width), y: Math.round(s.getBoundingClientRect().y + scrollY), svg: svgOf(s) }))
        .filter((s) => s.w > 0 && s.w < 60);
      return {
        icons: svgs,
        links: [...document.querySelectorAll('main a, a')].filter((a) => !a.closest('nav, footer'))
          .map((a) => `${a.textContent.trim()} -> ${a.getAttribute('href')} target=${a.target}`),
        images: [...document.querySelectorAll('img')].map((i) => ({ alt: i.alt, src: i.src, srcset: i.getAttribute('srcset') })),
      };
    }));
  }

  // Tabs: click each button inside the tabs component and record what the component looks like.
  const buttons = await p.locator('button').count();
  result.tabs[bp] = [];
  for (let i = 0; i < buttons; i++) {
    const btn = p.locator('button').nth(i);
    if (!(await btn.isVisible())) continue;
    await btn.scrollIntoViewIfNeeded();
    await btn.click();
    await p.waitForTimeout(1500);
    result.tabs[bp].push(await p.evaluate((idx) => {
      const btns = [...document.querySelectorAll('button')].filter((x) => x.getBoundingClientRect().width > 0);
      const comp = btns[0].closest('[data-framer-name]').parentElement.closest('[class*="container"]') || btns[0].parentElement.parentElement.parentElement;
      const r = (e) => { const b = e.getBoundingClientRect(); return [Math.round(b.x), Math.round(b.y + scrollY), Math.round(b.width), Math.round(b.height)]; };
      const cs = (e, props) => Object.fromEntries(props.map((k) => [k, getComputedStyle(e)[k]]));
      return {
        clicked: idx,
        component: r(comp),
        variant: comp.querySelector('[data-framer-name]')?.getAttribute('data-framer-name'),
        buttons: btns.map((x) => ({ text: x.textContent.trim(), rect: r(x), ...cs(x, ['backgroundColor', 'borderTopWidth', 'borderTopColor', 'boxShadow', 'color']),
          after: getComputedStyle(x, '::after').borderTopWidth + ' ' + getComputedStyle(x, '::after').borderTopColor,
          inner: [...x.querySelectorAll('*')].map((c) => getComputedStyle(c).borderTopWidth + '/' + getComputedStyle(c).borderTopColor + '/' + getComputedStyle(c).boxShadow).filter((s) => !s.startsWith('0px/') || !s.endsWith('none')) })),
        texts: [...comp.querySelectorAll('p.framer-text')].filter((e) => e.getBoundingClientRect().width > 0).map((e) => ({ rect: r(e), parent: r(e.parentElement), grand: r(e.parentElement.parentElement), html: e.innerHTML.replace(/ (style|class|data-[\w-]+|dir)="[^"]*"/g, '') })),
        images: [...comp.querySelectorAll('img')].filter((e) => e.getBoundingClientRect().width > 0).map((e) => ({ rect: r(e), box: r(e.parentElement.parentElement), src: e.currentSrc, srcset: e.getAttribute('srcset') })),
      };
    }, i));
  }
  await p.close();
}

fs.writeFileSync(`out/${page}/detail.json`, JSON.stringify(result, null, 1));
console.log(`${page}: texts d/t/m = ${result.texts.desktop.length}/${result.texts.tablet.length}/${result.texts.mobile.length}, icons ${result.icons.length}, tab states d/t/m = ${result.tabs.desktop.length}/${result.tabs.tablet.length}/${result.tabs.mobile.length}`);
await b.close();
