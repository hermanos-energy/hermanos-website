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
const PAGES = ['', 'product', 'aboutus', 'contact', 'power-to-heat', 'power-to-drive', 'power-to-power'];
const wrongLang = [];
const wrongSwitch = [];
for (const prefix of ['', 'nl/']) {
  for (const page of PAGES) {
    await desk.goto(`${base}/${prefix}${page}`, { waitUntil: 'networkidle' });
    const info = await desk.evaluate(() => ({
      lang: document.documentElement.lang,
      links: [...document.querySelectorAll('a[href^="/"]')].map((a) => a.href),
      nav: [...document.querySelectorAll('.site-nav__link')].map((a) => new URL(a.href).pathname),
      switchTo: Object.fromEntries([...document.querySelectorAll('.site-nav .lang-switch a')].map((a) => [a.hreflang, new URL(a.href).pathname])),
    }));
    const expectedLang = prefix ? 'nl' : 'en';
    if (info.lang !== expectedLang || info.nav.some((p) => prefix && !p.includes('/nl/'))) wrongLang.push(`/${prefix}${page}`);
    const strip = (p) => p.replace(/\/$/, '');
    if (strip(info.switchTo.en) !== strip(`/hermanos-website/${page}`) || strip(info.switchTo.nl) !== strip(`/hermanos-website/nl/${page}`)) wrongSwitch.push(`/${prefix}${page}`);
    for (const link of [...new Set(info.links)]) {
      const res = await desk.request.get(link);
      if (!res.ok()) broken.push(`${res.status()} ${link} (linked from /${prefix}${page})`);
    }
  }
}
check('all internal links, images, CSS and JS load (en + nl)', broken.length === 0, broken.slice(0, 5).join(', '));
check('<html lang> and menu links match the page language', wrongLang.length === 0, wrongLang.join(', '));
check('language switch points to the same page in the other language', wrongSwitch.length === 0, wrongSwitch.join(', '));

// Dutch contact form shows Dutch labels
await desk.goto(`${base}/nl/contact`);
check('Dutch contact form is translated', await desk.evaluate(() => document.querySelector('input[name=name]').placeholder === 'Naam' && document.querySelector('.contact-form__submit').textContent === 'Verstuur bericht'));

// Browser language: a Dutch browser lands on the Dutch page, until it picks English with the switch
const dutchBrowser = await b.newContext({ locale: 'nl-NL', viewport: { width: 1440, height: 900 } });
const nlPage = await dutchBrowser.newPage();
await nlPage.goto(`${base}/product`);
check('Dutch browser is sent to the Dutch page', nlPage.url().endsWith('/nl/product/'), nlPage.url());
await nlPage.click('.site-nav .lang-switch a[hreflang="en"]');
await nlPage.waitForLoadState();
await nlPage.goto(`${base}/aboutus`);
check('chosen language (EN) is remembered', nlPage.url().endsWith('/aboutus'), nlPage.url());
await dutchBrowser.close();
await desk.goto(`${base}/product`);
check('English browser stays on the English page', desk.url().endsWith('/product'), desk.url());

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
