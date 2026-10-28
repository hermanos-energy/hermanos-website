// One-off check: FAQ toggling on the rebuilt Product page, compared to the live heights (190 open / 84 closed / 282 for #2 open).
import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('file:///C:/dev/hermanos/hermanos-website/scratchpad/product/index.html');
const heights = () => p.evaluate(() => [...document.querySelectorAll('.faq-item')].map((d) => Math.round(d.getBoundingClientRect().height)));
console.log('before:', await heights());
await p.click('.faq-item:nth-child(2) .faq-item__question'); await p.waitForTimeout(600);
console.log('after #2:', await heights());
await p.click('.faq-item:nth-child(2) .faq-item__question'); await p.waitForTimeout(600);
console.log('after #2 again:', await heights());
await b.close();
