// One-off probe: the live site's <head> per page (title, description, Open Graph/Twitter tags, icons, canonical,
// language) and every third-party script/tracker it loads. Read-only.
import { chromium } from 'playwright';

const PAGES = ['', 'product', 'aboutus', 'contact', 'power-to-heat', 'power-to-drive', 'power-to-power'];
const b = await chromium.launch();
const p = await b.newPage();
const thirdParty = new Set();
p.on('request', (r) => {
  const host = new URL(r.url()).hostname;
  if (!/hermanosenergy\.com$|framerusercontent\.com$|framer\.com$|framer\.app$|fonts\.g(oogleapis|static)\.com$/.test(host)) thirdParty.add(host);
});

for (const page of PAGES) {
  await p.goto(`https://www.hermanosenergy.com/${page}`, { waitUntil: 'networkidle' });
  const head = await p.evaluate(() => ({
    lang: document.documentElement.lang,
    title: document.title,
    meta: [...document.querySelectorAll('meta[name], meta[property]')]
      .map((m) => `${m.getAttribute('name') || m.getAttribute('property')} = ${m.content}`)
      .filter((s) => !/^(viewport|generator|framer|robots = max)/.test(s)),
    links: [...document.querySelectorAll('link[rel*="icon"], link[rel="canonical"], link[rel="alternate"]')]
      .map((l) => `${l.rel}${l.media ? ` (${l.media})` : ''} ${l.sizes?.value || ''} → ${l.href}`),
    analytics: [...document.querySelectorAll('script[src]')].map((s) => s.src).filter((s) => !/framerusercontent|framer\.com\/(m|edit)/.test(s)),
  }));
  console.log(`\n===== /${page}  lang=${head.lang}\nTITLE: ${head.title}`);
  head.meta.forEach((m) => console.log(`  ${m}`));
  head.links.forEach((l) => console.log(`  ${l}`));
  head.analytics.forEach((s) => console.log(`  script: ${s}`));
}
console.log(`\nTHIRD-PARTY HOSTS CONTACTED: ${[...thirdParty].join(', ') || 'none'}`);
await b.close();
