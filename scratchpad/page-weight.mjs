// Usage: node page-weight.mjs <baseUrl> [baseUrl2]
// Loads every page (scrolling through so lazy images load) at desktop and mobile width and sums the downloaded
// bytes per type. With two base URLs it prints them side by side (e.g. live site vs. new site).
import { chromium } from 'playwright';

const bases = process.argv.slice(2);
const PAGES = ['', 'product', 'aboutus', 'contact', 'power-to-heat', 'power-to-drive', 'power-to-power'];
const VIEWPORTS = { desktop: 1440, mobile: 390 };
const b = await chromium.launch();

async function weigh(url, width) {
  const p = await b.newPage({ viewport: { width, height: 900 } });
  const totals = { image: 0, font: 0, script: 0, other: 0 };
  p.on('response', async (res) => {
    try {
      const type = res.request().resourceType();
      const size = (await res.body()).length;
      const key = type === 'image' ? 'image' : type === 'font' ? 'font' : type === 'script' ? 'script' : 'other';
      totals[key] += size;
    } catch { /* redirects, aborted requests */ }
  });
  await p.goto(url, { waitUntil: 'networkidle', timeout: 90000 });
  await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 150)); } });
  await p.waitForLoadState('networkidle');
  await p.close();
  return totals;
}

const kb = (n) => `${Math.round(n / 1024)} KB`.padStart(8);
for (const [name, width] of Object.entries(VIEWPORTS)) {
  console.log(`\n=== ${name} (${width}px) — total (images / fonts / scripts)`);
  for (const page of PAGES) {
    const cols = [];
    for (const base of bases) {
      const t = await weigh(`${base}/${page}`, width);
      const total = t.image + t.font + t.script + t.other;
      cols.push(`${kb(total)} (${kb(t.image).trim()} / ${kb(t.font).trim()} / ${kb(t.script).trim()})`);
    }
    console.log(`/${page.padEnd(16)} ${cols.join('   vs   ')}`);
  }
}
await b.close();
