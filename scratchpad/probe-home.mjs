// One-off probe: homepage news slider behaviour per breakpoint, plus full text markup, links and images.
// Writes out/home/detail.json and prints a summary.
import { chromium } from 'playwright';
import fs from 'node:fs';

const VIEWPORTS = { desktop: 1440, tablet: 1000, mobile: 390 };
const clean = (h) => h.replace(/ (style|class|data-[\w-]+|dir)="[^"]*"/g, '').replace(/<!--\/?\$-->/g, '');
const b = await chromium.launch();
const out = { slider: {}, texts: {} };

for (const [bp, width] of Object.entries(VIEWPORTS)) {
  const p = await b.newPage({ viewport: { width, height: 900 } });
  await p.goto('https://www.hermanosenergy.com/', { waitUntil: 'networkidle' });
  await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 400) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 100)); } });

  out.texts[bp] = (await p.evaluate(() => [...document.querySelectorAll('h1.framer-text, h2.framer-text, h3.framer-text, p.framer-text')]
    .filter((e) => !e.closest('nav, footer')).map((e) => e.outerHTML))).map(clean);

  // The slider: the element that holds the prev/next buttons.
  const info = async () => p.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find((x) => x.textContent.includes('▶'));
    if (!btn) return null;
    const box = btn.parentElement;
    const track = box.querySelector(':scope > div');
    const r = (e) => { const q = e.getBoundingClientRect(); return [Math.round(q.x), Math.round(q.y + scrollY), Math.round(q.width), Math.round(q.height)]; };
    return {
      box: r(box), track: r(track), trackTransform: getComputedStyle(track).transform, trackTransition: getComputedStyle(track).transition,
      slides: [...track.children].map((s) => r(s.firstElementChild || s)),
      section: r(box.closest('[class*="container"]').parentElement),
      buttons: [...box.querySelectorAll(':scope > button')].map((x) => ({ r: r(x), text: x.textContent, bg: getComputedStyle(x).backgroundColor, font: getComputedStyle(x).fontSize, border: getComputedStyle(x).border, shadow: getComputedStyle(x).boxShadow })),
      dots: [...(box.querySelector(':scope > div:last-child')?.children || [])].map((d) => r(d)),
    };
  });
  const s = { initial: await info() };
  if (s.initial) {
    await p.waitForTimeout(6000);
    s.after6s = await info();
    await p.locator('button', { hasText: '▶' }).first().click({ force: true });
    await p.waitForTimeout(1500);
    s.afterNext = await info();
  }
  out.slider[bp] = s;

  if (bp === 'desktop') {
    Object.assign(out, await p.evaluate(() => ({
      links: [...document.querySelectorAll('a')].filter((a) => !a.closest('nav, footer')).map((a) => `${a.textContent.trim() || '(img)'} -> ${a.getAttribute('href')} target=${a.target}`),
      images: [...document.querySelectorAll('img, video, iframe')].map((i) => `${i.tagName} ${i.alt || ''} | ${i.getAttribute('srcset') || i.currentSrc || i.src}`),
      iframe: document.querySelector('iframe')?.outerHTML.slice(0, 500),
      video: document.querySelector('video')?.outerHTML.slice(0, 600),
    })));
  }
  await p.close();
}
fs.writeFileSync('out/home/detail.json', JSON.stringify(out, null, 1));
for (const [bp, s] of Object.entries(out.slider)) {
  console.log(`== ${bp}`);
  if (!s.initial) { console.log('  no slider found'); continue; }
  console.log(`  section ${s.initial.section} box ${s.initial.box} track ${s.initial.track}`);
  console.log(`  transform initial: ${s.initial.trackTransform} | after 6s: ${s.after6s.trackTransform} | after next: ${s.afterNext.trackTransform}`);
  console.log(`  transition: ${s.initial.trackTransition}`);
  console.log(`  slides: ${JSON.stringify(s.initial.slides)}`);
  console.log(`  buttons: ${JSON.stringify(s.initial.buttons)}`);
  console.log(`  dots: ${JSON.stringify(s.initial.dots)}`);
  console.log(`  box after next: ${s.afterNext.box} section after next: ${s.afterNext.section}`);
}
