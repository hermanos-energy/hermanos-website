// Usage: node check-overflow.mjs <baseUrl> [lang prefix, e.g. nl]
// For every page at 1440/1000/390px, reports text that is cut off by a box with overflow hidden/clip, or that sticks
// out of a fixed-height box onto other content. Run for both languages to see which problems a translation adds.
import { chromium } from 'playwright';

const [base, prefix = ''] = process.argv.slice(2);
const PAGES = ['', 'product', 'aboutus', 'contact', 'power-to-heat', 'power-to-drive', 'power-to-power'];
const WIDTHS = [1440, 1000, 390];
const b = await chromium.launch();

for (const width of WIDTHS) {
  const p = await b.newPage({ viewport: { width, height: 900 } });
  for (const page of PAGES) {
    await p.goto(`${base}/${prefix ? `${prefix}/` : ''}${page}`, { waitUntil: 'networkidle' });
    await p.evaluate(() => document.querySelectorAll('.reveal').forEach((e) => e.classList.add('is-visible')));
    const issues = await p.evaluate(() => {
      const found = [];
      const textOf = (e) => e.textContent.trim().replace(/\s+/g, ' ').slice(0, 50);
      // Ignore the slider track (horizontally scrolling by design) and the mobile menu (hidden)
      const skip = (e) => e.closest('.slider__track, .mobile-menu, .site-header, svg');
      for (const el of document.querySelectorAll('h1, h2, h3, p, li, span, button, a, .label')) {
        if (skip(el) || !el.textContent.trim() || el.getBoundingClientRect().width === 0) continue;
        const r = el.getBoundingClientRect();
        // Walk up to the first ancestor that clips its content
        for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
          const cs = getComputedStyle(a);
          if (!/hidden|clip/.test(cs.overflow + cs.overflowY + cs.overflowX)) continue;
          if (a.closest('.slider__track') || a.matches('.slider, .news, section')) break;
          const ar = a.getBoundingClientRect();
          if (r.bottom > ar.bottom + 2 || r.right > ar.right + 2) {
            found.push(`cut off by ${a.className || a.tagName} (${Math.round(Math.max(r.bottom - ar.bottom, r.right - ar.right))}px): "${textOf(el)}"`);
          }
          break;
        }
      }
      // Text sticking out of fixed-height rows that don't clip (product card label row, FAQ question row)
      for (const row of document.querySelectorAll('.product-card__label-row, .faq-item__question')) {
        const inner = row.firstElementChild.getBoundingClientRect();
        const box = row.getBoundingClientRect();
        if (inner.height > box.height + 2) found.push(`sticks out of ${row.className} by ${Math.round(inner.height - box.height)}px: "${textOf(row)}"`);
      }
      // The visible news slide must fit inside the slider
      const slider = document.querySelector('.slider');
      if (slider) {
        for (const slide of document.querySelectorAll('.slider__slide')) {
          const overflow = slide.scrollHeight - slider.clientHeight;
          if (overflow > 0) found.push(`news slide taller than slider by ${overflow}px: "${textOf(slide.querySelector('h3'))}"`);
        }
      }
      if (document.documentElement.scrollWidth > innerWidth + 1) found.push(`page wider than screen by ${document.documentElement.scrollWidth - innerWidth}px`);
      return [...new Set(found)];
    });
    if (issues.length) console.log(`[${width}] /${prefix ? `${prefix}/` : ''}${page}\n  ${issues.join('\n  ')}`);
  }
  await p.close();
}
console.log('done');
await b.close();
