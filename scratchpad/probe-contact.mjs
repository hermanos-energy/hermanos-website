// One-off probe: Contact page form setup (action, fields, styles), texts, icons and links.
import { chromium } from 'playwright';

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('https://www.hermanosenergy.com/contact', { waitUntil: 'networkidle' });
const r = await p.evaluate(() => {
  const clean = (h) => h.replace(/ (style|class|data-[\w-]+|dir)="[^"]*"/g, '').replace(/<!--\/?\$-->/g, '');
  const cs = (e, props) => props.map((k) => `${k}:${getComputedStyle(e)[k]}`).join('; ');
  const ph = (e) => { const s = getComputedStyle(e, '::placeholder'); return `placeholder color:${s.color} font:${s.fontFamily} ${s.fontSize} ${s.fontWeight}`; };
  const form = document.querySelector('form');
  const svgOf = (svg) => { const c = svg.cloneNode(true);
    c.querySelectorAll('use').forEach((u) => { const t = document.querySelector(u.getAttribute('href')); if (t) u.replaceWith(t.cloneNode(true)); });
    return c.outerHTML.replace(/ (style|class|data-[\w-]+)="[^"]*"/g, ''); };
  return {
    form: form.outerHTML.replace(/ class="[^"]*"/g, '').replace(/ style="[^"]*"/g, '').slice(0, 1500),
    formAttrs: [...form.attributes].map((a) => `${a.name}=${a.value}`),
    fields: [...form.querySelectorAll('input, textarea')].map((e) => `${e.tagName} type=${e.type} name=${e.name} placeholder=${e.placeholder} value=${e.value} required=${e.required}\n   ${cs(e, ['fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'color', 'backgroundColor', 'borderTopWidth', 'borderTopColor', 'borderRadius', 'padding', 'boxShadow', 'resize', 'letterSpacing'])}\n   ${ph(e)}`),
    texts: [...document.querySelectorAll('h1.framer-text, h2.framer-text, h3.framer-text, p.framer-text')].filter((e) => !e.closest('nav, footer')).map((e) => clean(e.outerHTML) + '  {' + cs(e, ['color', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing']) + '}'),
    icons: [...document.querySelectorAll('svg')].filter((s) => !s.closest('nav, footer')).map((s) => svgOf(s)),
    links: [...document.querySelectorAll('a')].filter((a) => !a.closest('nav, footer')).map((a) => `${a.textContent.trim() || a.getAttribute('aria-label') || '(icon)'} -> ${a.getAttribute('href')} target=${a.target}`),
  };
});
console.log('FORM ATTRS:', r.formAttrs.join(' | '));
console.log('FORM:', r.form);
console.log('\nFIELDS:\n' + r.fields.join('\n'));
console.log('\nTEXTS:\n' + r.texts.join('\n'));
console.log('\nICONS:\n' + r.icons.join('\n'));
console.log('\nLINKS:\n' + r.links.join('\n'));
// Hover/focus styles of a field and the button
await p.focus('input[name]');
console.log('\nFOCUSED INPUT:', await p.evaluate(() => { const e = document.activeElement; const s = getComputedStyle(e); return `border:${s.borderTopWidth} ${s.borderTopColor} outline:${s.outline} shadow:${s.boxShadow} bg:${s.backgroundColor}`; }));
await b.close();
