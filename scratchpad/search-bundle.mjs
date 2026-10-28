// Usage: node search-bundle.mjs <url> <regex>
// Loads a live page and searches every JavaScript file it loads for a pattern (read-only).
import { chromium } from 'playwright';

const [url, pattern] = process.argv.slice(2);
const re = new RegExp(`.{0,160}(${pattern}).{0,200}`, 'g');
const b = await chromium.launch();
const p = await b.newPage();
const hits = new Set();
p.on('response', async (res) => {
  if (!/javascript|ecmascript/.test(res.headers()['content-type'] || '')) return;
  try {
    for (const m of (await res.text()).matchAll(re)) hits.add(`${res.url().split('/').pop()}: ${m[0]}`);
  } catch { /* ignore */ }
});
await p.goto(url, { waitUntil: 'networkidle' });
await p.waitForTimeout(2000);
console.log([...hits].slice(0, 15).join('\n\n') || 'no matches');
await b.close();
