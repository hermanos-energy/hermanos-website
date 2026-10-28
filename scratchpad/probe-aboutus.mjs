// One-off probe: pulls markup details the extractor doesn't capture (full text HTML, logo SVG, mobile menu).
import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('https://www.hermanosenergy.com/aboutus', { waitUntil: 'networkidle' });
const r = await p.evaluate(() => {
  const texts = [...document.querySelectorAll('h1.framer-text, h2.framer-text, p.framer-text')].map((e) => e.outerHTML.replace(/ style="[^"]*"/g, '').replace(/ class="[^"]*"/g, ''));
  const logo = document.querySelector('.framer-1xphtue svg');
  const use = logo?.querySelector('use')?.getAttribute('href');
  const symbol = use ? document.querySelector(use)?.outerHTML : null;
  const css = [...document.querySelectorAll('style')].map((s) => s.textContent).join('\n');
  const rules = ['1ckxmzo', '1m537jz', '12spheg', 's75pn2', '13wffq5', '139527w', 'xr7rny', '1xphtue', 'hcttz3', '21rxkl', 'remyth', '1tn31tn', 'r0n9x2', 'k65jy7', 'oata6g']
    .map((c) => c + ':\n  ' + (css.match(new RegExp('[^}]*\.framer-' + c + '[^{]*\{[^}]*\}', 'g')) || []).join('\n  '));
  return { texts, logoOuter: logo?.outerHTML.slice(0, 400), symbol, rules };
});
console.log(r.texts.join('\n'));
console.log('\nLOGO:', r.logoOuter, '\nSYMBOL:', r.symbol);
console.log('\nRULES:\n' + r.rules.join('\n'));
await p.setViewportSize({ width: 390, height: 900 });
await p.waitForTimeout(1500);
console.log('\nMOBILE NAV:', await p.evaluate(() => document.querySelector('nav')?.outerHTML.replace(/<svg[\s\S]*?<\/svg>/g, '<svg/>').slice(0, 3000)));
await b.close();
