// Usage: node extract.mjs <url> <outDir>
// Captures, per breakpoint: full-page screenshot, computed styles of every visible
// element (JSON + readable outline). Also saves every stylesheet and image the page loads.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const [url, outDir] = process.argv.slice(2);
if (!url || !outDir) { console.error('usage: node extract.mjs <url> <outDir>'); process.exit(1); }

const VIEWPORTS = { desktop: 1440, tablet: 1000, mobile: 390 };

const PROPS = [
  'display', 'position', 'top', 'left', 'zIndex',
  'flexDirection', 'flexWrap', 'justifyContent', 'alignItems', 'gap', 'gridTemplateColumns',
  'width', 'height', 'maxWidth', 'minHeight', 'aspectRatio',
  'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
  'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
  'backgroundColor', 'backgroundImage', 'color', 'opacity',
  'fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'textAlign', 'textTransform', 'textDecorationLine',
  'borderRadius', 'borderTopWidth', 'borderTopColor', 'boxShadow', 'overflow', 'objectFit', 'transform', 'filter', 'backdropFilter',
];
// Values not worth reporting (browser defaults).
const DEFAULTS = new Set(['normal', 'none', 'auto', '0px', 'static', 'visible', 'rgba(0, 0, 0, 0)', 'row', 'nowrap',
  'stretch', 'start', 'fill', '1', 'block', 'left', 'flex-start']);

fs.mkdirSync(path.join(outDir, 'css'), { recursive: true });
fs.mkdirSync(path.join(outDir, 'images'), { recursive: true });

const browser = await chromium.launch();
const saved = new Set();

for (const [name, width] of Object.entries(VIEWPORTS)) {
  const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });

  page.on('response', async (res) => {
    const u = res.url();
    if (saved.has(u)) return;
    const type = res.headers()['content-type'] || '';
    const dir = type.includes('css') ? 'css' : type.startsWith('image/') ? 'images' : null;
    if (!dir) return;
    saved.add(u);
    try {
      const file = path.basename(new URL(u).pathname).replace(/[^\w.-]/g, '_') || 'index';
      fs.writeFileSync(path.join(outDir, dir, file), await res.body());
    } catch { /* redirects / aborted requests have no body */ }
  });

  await page.goto(url, { waitUntil: 'networkidle', timeout: 90000 });

  // Framer appear animations start as inline opacity/transform; record their initial state so the rebuild can copy them.
  const animations = await page.evaluate(() => [...document.querySelectorAll('[style*="opacity:0"], [style*="opacity: 0"]')]
    .map((e) => ({ cls: e.getAttribute('class'), initial: e.getAttribute('style'), text: e.textContent.trim().slice(0, 60) })));
  fs.writeFileSync(path.join(outDir, `${name}-animations.json`), JSON.stringify(animations, null, 1));

  // Scroll through the page so scroll-triggered animations and lazy images settle. Don't return to the
  // very top: Framer replays the hero animation there, hiding it again. A small offset keeps it visible.
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 400) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 150));
    }
    window.scrollTo(0, 300);
  });
  await page.waitForTimeout(2000);

  await page.screenshot({ path: path.join(outDir, `${name}.png`), fullPage: true });

  const nodes = await page.evaluate(({ PROPS, DEFAULTS }) => {
    const skip = new Set(DEFAULTS);
    const out = [];
    const walk = (el, depth) => {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      if (cs.display === 'none') return;
      // Framer wraps fixed/absolute layers in zero-size containers: skip recording them, but keep descending.
      if (r.width === 0 || r.height === 0 || cs.visibility === 'hidden') {
        for (const c of el.children) walk(c, depth + 1);
        return;
      }
      const styles = {};
      for (const p of PROPS) {
        const v = cs[p];
        if (v && !skip.has(v)) styles[p] = v;
      }
      const ownText = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join(' ').trim();
      out.push({
        depth,
        tag: el.tagName.toLowerCase(),
        name: el.getAttribute('data-framer-name') || null,
        cls: (el.getAttribute('class') || '').split(/\s+/).filter((c) => c.startsWith('framer-')).slice(0, 3).join(' '),
        rect: { x: Math.round(r.x), y: Math.round(r.y + scrollY), w: Math.round(r.width), h: Math.round(r.height) },
        text: ownText.slice(0, 120) || null,
        src: el.currentSrc || el.getAttribute('src') || null,
        styles,
      });
      for (const c of el.children) walk(c, depth + 1);
    };
    walk(document.body, 0);
    // Inline <style> blocks too (Framer's SSR CSS).
    const inlineCss = [...document.querySelectorAll('style')].map((s) => s.textContent).join('\n');
    return { nodes: out, inlineCss };
  }, { PROPS, DEFAULTS: [...DEFAULTS] });

  fs.writeFileSync(path.join(outDir, `${name}.json`), JSON.stringify(nodes.nodes, null, 1));
  fs.writeFileSync(path.join(outDir, 'css', `inline-${name}.css`), nodes.inlineCss);

  // Readable outline: only layers with a Framer name, text, or an image — the meaningful ones.
  const lines = nodes.nodes
    .filter((n) => n.name || n.text || n.tag === 'img')
    .map((n) => {
      const label = n.name ? `"${n.name}"` : n.tag;
      const s = Object.entries(n.styles).map(([k, v]) => `${k}:${v}`).join('; ');
      const t = n.text ? `  » ${n.text}` : '';
      return `${'  '.repeat(Math.min(n.depth, 20))}${label} [${n.rect.x},${n.rect.y} ${n.rect.w}×${n.rect.h}]${t}\n${'  '.repeat(Math.min(n.depth, 20))}    ${s}`;
    });
  fs.writeFileSync(path.join(outDir, `${name}-outline.txt`), lines.join('\n'));

  console.log(`${name} (${width}px): ${nodes.nodes.length} elements`);
  await page.close();
}

await browser.close();
console.log(`assets: ${fs.readdirSync(path.join(outDir, 'css')).length} css, ${fs.readdirSync(path.join(outDir, 'images')).length} images`);
