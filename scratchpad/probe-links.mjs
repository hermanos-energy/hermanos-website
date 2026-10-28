// One-off probe: link targets and image srcsets.
import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('https://www.hermanosenergy.com/aboutus', { waitUntil: 'networkidle' });
console.log(await p.evaluate(() => [...document.querySelectorAll('a')].map((a) => `${a.textContent.trim() || '(logo)'} -> ${a.getAttribute('href')} target=${a.target}`).join('\n')));
console.log(await p.evaluate(() => [...document.querySelectorAll('img')].map((i) => `${i.alt} | ${i.getAttribute('srcset') || i.src}`).join('\n\n')));
await b.close();
