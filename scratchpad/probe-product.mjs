// One-off probe: Product page text markup, SVG icons, links and FAQ behaviour.
import { chromium } from 'playwright';
import fs from 'node:fs';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('https://www.hermanosenergy.com/product', { waitUntil: 'networkidle' });
const r = await p.evaluate(() => {
  const clean = (h) => h.replace(/ (style|class|data-[\w-]+|dir)="[^"]*"/g, '').replace(/<!--\/?\$-->/g, '');
  const texts = [...document.querySelectorAll('main h1, main h2, main h3, main p, [data-framer-name] h1, [data-framer-name] h2, [data-framer-name] h3, [data-framer-name] p, h1.framer-text, h2.framer-text, h3.framer-text, p.framer-text')]
    .filter((e, i, a) => a.indexOf(e) === i).map((e) => clean(e.outerHTML));
  // Resolve <use href="#id"> to the referenced symbol so icons are self-contained.
  const svgOf = (svg) => { if (!svg) return null; const c = svg.cloneNode(true);
    c.querySelectorAll('use').forEach((u) => { const t = document.querySelector(u.getAttribute('href')); if (t) u.replaceWith(t.cloneNode(true)); });
    return clean(c.outerHTML); };
  return {
    texts,
    check: svgOf(document.querySelector('.framer-hkux9s-container svg')),
    features: [...document.querySelectorAll('.framer-kqmbbe-container svg')].map(svgOf),
    faqOpen: svgOf(document.querySelector('.framer-14evfl3-container .framer-dx3teb svg')),
    faqClosed: svgOf(document.querySelector('.framer-1794s7u-container .framer-dx3teb svg')),
    links: [...document.querySelectorAll('a')].map((a) => `${a.textContent.trim() || '(logo)'} -> ${a.getAttribute('href')} target=${a.target}`),
    imgs: [...document.querySelectorAll('img')].map((i) => `${i.alt} | ${i.src}`),
  };
});
fs.writeFileSync('out/product/texts.html', r.texts.join('\n'));
fs.writeFileSync('out/product/icons/check.svg', r.check);
r.features.forEach((s, i) => fs.writeFileSync(`out/product/icons/feature-${i + 1}.svg`, s));
fs.writeFileSync('out/product/icons/faq-open.svg', r.faqOpen);
fs.writeFileSync('out/product/icons/faq-closed.svg', r.faqClosed);
console.log(r.links.join('\n')); console.log(r.imgs.join('\n'));

// FAQ behaviour: click the second question and see what happens to the first.
const heights = () => p.evaluate(() => [...document.querySelectorAll('.framer-s4c5ox > div')].map((d) => Math.round(d.getBoundingClientRect().height)));
console.log('FAQ heights before:', await heights());
await p.locator('.framer-1794s7u-container').click(); await p.waitForTimeout(1500);
console.log('FAQ heights after clicking #2:', await heights());
await p.locator('.framer-1794s7u-container').click(); await p.waitForTimeout(1500);
console.log('FAQ heights after clicking #2 again:', await heights());
// Open each in turn to collect all answers.
const answers = [];
for (const c of ['14evfl3', '1794s7u', '828siv', 'y2zcsk', '1i9numw']) {
  const loc = p.locator(`.framer-${c}-container`);
  let txt = await loc.evaluate((e) => [...e.querySelectorAll('p')].map((x) => x.innerHTML).join(' || '));
  if (!txt) { await loc.click(); await p.waitForTimeout(1200); txt = await loc.evaluate((e) => [...e.querySelectorAll('p')].map((x) => x.innerHTML).join(' || ')); }
  answers.push(c + ': ' + txt.replace(/ (style|class|data-[\w-]+|dir)="[^"]*"/g, ''));
}
fs.writeFileSync('out/product/faq-answers.html', answers.join('\n\n'));
await b.close();
