// Usage: node probe-switch.mjs <url>
// Screenshots the header and reports the language switch's position, colour and visibility at 1440/1000/390px.
import { chromium } from 'playwright';

const url = process.argv[2];
const b = await chromium.launch();
for (const width of [1440, 1000, 390]) {
  const p = await b.newPage({ viewport: { width, height: 900 } });
  await p.goto(url, { waitUntil: 'networkidle' });
  if (width < 810) await p.click('.menu-toggle');
  const info = await p.evaluate(() => [...document.querySelectorAll('.lang-switch')].map((s) => {
    const r = s.getBoundingClientRect();
    const cs = getComputedStyle(s);
    const a = getComputedStyle(s.querySelector('a'));
    return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), display: cs.display, color: a.color, opacity: a.opacity, headerBg: getComputedStyle(document.querySelector('.site-header__bar')).backgroundColor };
  }));
  console.log(width, JSON.stringify(info));
  await p.screenshot({ path: `scratchpad/out/switch-${width}.png`, clip: { x: 0, y: 0, width, height: width < 810 ? 500 : 120 } });
  await p.close();
}
await b.close();
