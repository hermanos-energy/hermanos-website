// One-off probe: find the Formspark form ID used by the live Contact page by searching the loaded JavaScript.
// Read-only — it does not submit the form.
import { chromium } from 'playwright';

const b = await chromium.launch();
const p = await b.newPage();
const hits = [];
p.on('response', async (res) => {
  if (!/javascript|ecmascript/.test(res.headers()['content-type'] || '')) return;
  try {
    const body = await res.text();
    for (const m of body.matchAll(/.{0,120}(submit-form\.com|formspark|formId).{0,160}/gi)) hits.push(`${res.url().split('/').pop()}: ${m[0]}`);
  } catch { /* ignore */ }
});
await p.goto('https://www.hermanosenergy.com/contact', { waitUntil: 'networkidle' });
await p.waitForTimeout(2000);
console.log([...new Set(hits)].slice(0, 20).join('\n\n') || 'no matches');
await b.close();
