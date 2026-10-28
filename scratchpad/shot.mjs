// Usage: node shot.mjs <url> <width> <selector> <out.png>
// Screenshot of one element (fade-up animations switched on first).
import { chromium } from 'playwright';

const [url, width, selector, out] = process.argv.slice(2);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: Number(width), height: 900 } });
await p.goto(url, { waitUntil: 'networkidle' });
await p.evaluate(() => document.querySelectorAll('.reveal').forEach((e) => e.classList.add('is-visible')));
await p.waitForTimeout(800);
await p.locator(selector).first().screenshot({ path: out });
await b.close();
