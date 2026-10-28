// One-off probe: mobile hamburger + open menu styles, and the logo SVG.
import { chromium } from 'playwright';
import fs from 'node:fs';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 390, height: 844 } });
await p.goto('https://www.hermanosenergy.com/aboutus', { waitUntil: 'networkidle' });
const sym = await p.evaluate(() => document.querySelector(document.querySelector('.framer-1xphtue use').getAttribute('href')).outerHTML);
fs.writeFileSync('out/aboutus/logo.svg', sym.replace(/ id="[^"]*"/, ' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 293 122"'));
const dump = () => p.evaluate(() => [...document.querySelectorAll('nav, nav *')].filter((e) => e.getBoundingClientRect().width > 0 && !e.closest('svg'))
  .map((e) => { const r = e.getBoundingClientRect(), s = getComputedStyle(e);
    return `${e.tagName.toLowerCase()} ${(e.getAttribute('class') || '').split(' ')[0]} ${e.getAttribute('data-framer-name') || ''} [${Math.round(r.x)},${Math.round(r.y)} ${Math.round(r.width)}x${Math.round(r.height)}] ${[...e.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join('')} bg:${s.backgroundColor} color:${s.color} font:${s.fontSize}/${s.lineHeight} ${s.fontWeight} radius:${s.borderRadius} transform:${s.transform} pad:${s.padding} gap:${s.gap} dir:${s.flexDirection} align:${s.alignItems}`; }));
console.log('CLOSED\n' + (await dump()).join('\n'));
await p.click('.framer-ohrwp6'); await p.waitForTimeout(1200);
console.log('\nOPEN\n' + (await dump()).join('\n'));
await p.screenshot({ path: 'out/aboutus/mobile-menu-open.png' });
await b.close();
