// Usage: node smoke-astro.mjs [baseUrl]   (default http://localhost:4321/hermanos-website)
// Functional smoke test of the built site: links, mobile menu, FAQ, tabs, slider and contact form.
// Formspark requests are intercepted, so no real message is sent.
import { chromium } from 'playwright';

const base = process.argv[2] || 'http://localhost:4321/hermanos-website';
const b = await chromium.launch();
const results = [];
const check = (name, ok, detail = '') => results.push(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);

// Every internal link and image on every page resolves
const desk = await b.newPage({ viewport: { width: 1440, height: 900 } });
const broken = [];
desk.on('response', (r) => { if (r.status() >= 400 && r.url().startsWith(base.replace(/\/hermanos-website$/, ''))) broken.push(`${r.status()} ${r.url()}`); });
for (const page of ['', 'product', 'aboutus', 'contact', 'power-to-heat', 'power-to-drive', 'power-to-power']) {
  await desk.goto(`${base}/${page}`, { waitUntil: 'networkidle' });
  const links = await desk.evaluate(() => [...document.querySelectorAll('a[href^="/"]')].map((a) => a.href));
  for (const link of [...new Set(links)]) {
    const res = await desk.request.get(link);
    if (!res.ok()) broken.push(`${res.status()} ${link} (linked from /${page})`);
  }
}
check('all internal links, images, CSS and JS load', broken.length === 0, broken.slice(0, 5).join(', '));

// FAQ
await desk.goto(`${base}/product`);
await desk.click('.faq-item:nth-child(2) .faq-item__question');
check('FAQ opens a second item', await desk.evaluate(() => document.querySelectorAll('.faq-item.is-open').length === 2));

// Tabs
await desk.goto(`${base}/power-to-power`);
await desk.click('.tabs__button:nth-child(3)');
check('tabs switch panel', await desk.evaluate(() => !document.getElementById('tab-winter').hidden && document.getElementById('tab-summer').hidden));

// Slider
await desk.goto(`${base}/`);
await desk.click('.slider__button--next', { force: true });
check('slider next button', await desk.evaluate(() => document.querySelector('.slider__track').style.transform === 'translateX(-100%)'));

// Contact form
await desk.route('https://submit-form.com/**', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
await desk.goto(`${base}/contact`);
await desk.click('.contact-form__submit');
check('form blocks empty submit', await desk.evaluate(() => document.querySelectorAll('[aria-invalid="true"]').length === 3));
await desk.fill('input[name=name]', 'Test');
await desk.fill('input[name=email]', 'test@example.com');
await desk.fill('textarea[name=message]', 'Hello');
await desk.click('.contact-form__submit');
check('form shows success after (intercepted) submit', await desk.waitForSelector('.contact-form__success', { timeout: 5000 }).then(() => true, () => false));

// Mobile menu
const mob = await b.newPage({ viewport: { width: 390, height: 844 } });
await mob.goto(`${base}/aboutus`);
await mob.click('.menu-toggle');
check('mobile menu opens', await mob.isVisible('.mobile-menu'));

console.log(results.join('\n'));
await b.close();
