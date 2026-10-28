// Usage: node compare.mjs <liveDir> <rebuildDir> [summary|full] [hash=name ...]
// Matches text elements and images between two extract.mjs outputs and reports position/size/font differences.
// With "summary" only the per-breakpoint totals and the footer position (a proxy for total page height) are printed.
// Extra hash=name pairs map a live image hash to our file name stem for this page (overriding the defaults below).
import fs from 'node:fs';
import path from 'node:path';

const [liveDir, rebuildDir, mode, ...extraAliases] = process.argv.slice(2);
const TOLERANCE = 2; // px

// Elements we compare: leaf text (first 40 chars as key) and images (by file name stem).
const keyOf = (n) => {
  if (n.tag === 'img' && n.src) return 'img:' + path.basename(n.src.split('?')[0]).split(/[-.]/)[0];
  if (n.text) return n.text.slice(0, 40);
  return null;
};

// Map live image hashes to our file names.
const IMAGE_ALIASES = { rW3Cxy2t0aC3QpsLyjxmf3ebx8: 'founders', IxMuJFAmtyyrNkhckmQKQGyaFTU: 'preview',
  Shu3loxYUVoTM3mIWc6GDrpp83A: 'kansen', '8xTAZdryZnPxGIgPK60AWoWDuk': 'eu',
  EYUjFZbNruBdjnruJxL7Tr7jvs: 'products', w11iMoSS4QkjVWHSwtL1JSz0t14: 'timeline',
  // Product detail pages ("in" = in-action-*.jpg)
  gpQzoAcaJfbYvYJ5o8Fu1wURTp4: 'diagram', yWpgbpA5iy5XUuseh4sdtS6FvQ: 'diagram', FGQqKY61UyJQdhkSXjrKGcNQaY: 'diagram',
  '0zO4Cxz4LYdRQW7F9UZi6gn8UE': 'summer', ZC2Dot9XuFdYUj2XHuZAg3DV1E: 'summer', GQkwz93XwLpZX3qEHsNWO2WFpa4: 'day',
  Mda4e3BHxXPpfeOlL8QexJy5M: 'in', KGPPDGIv0KhmDEAiQS9O7tZ2NXM: 'in' };
for (const pair of extraAliases) {
  const [hash, name] = pair.split('=');
  IMAGE_ALIASES[hash] = name;
}

const index = (file, aliases = {}) => {
  const map = new Map();
  for (const n of JSON.parse(fs.readFileSync(file))) {
    let k = keyOf(n);
    if (!k) continue;
    if (k.startsWith('img:')) k = 'img:' + (aliases[k.slice(4)] || k.slice(4));
    if (!map.has(k)) map.set(k, []);
    map.get(k).push(n);
  }
  return map;
};

for (const bp of ['desktop', 'tablet', 'mobile']) {
  const live = index(path.join(liveDir, `${bp}.json`), IMAGE_ALIASES);
  const ours = index(path.join(rebuildDir, `${bp}.json`));
  let ok = 0;
  const issues = [];
  for (const [k, lives] of live) {
    const mine = ours.get(k) || [];
    lives.forEach((l, i) => {
      const m = mine[i];
      if (!m) { issues.push(`MISSING  ${k}`); return; }
      const d = ['x', 'y', 'w', 'h'].map((p) => m.rect[p] - l.rect[p]);
      const font = ['fontSize', 'fontWeight', 'lineHeight', 'color'].filter((p) => l.styles[p] && l.styles[p] !== m.styles[p])
        .map((p) => `${p} ${l.styles[p]}→${m.styles[p]}`);
      if (d.some((v) => Math.abs(v) > TOLERANCE) || font.length) {
        issues.push(`DIFF     ${k.padEnd(40)} live[${l.rect.x},${l.rect.y} ${l.rect.w}x${l.rect.h}] ours[${m.rect.x},${m.rect.y} ${m.rect.w}x${m.rect.h}] ${font.join('; ')}`);
      } else ok++;
    });
  }
  const footerY = (m) => (m.get('Hermanos Energy 2025 © All rights reserv') || [{ rect: { y: '?' } }])[0].rect.y;
  console.log(`\n=== ${bp}: ${ok} match within ${TOLERANCE}px, ${issues.length} differ — footer text y: live ${footerY(live)}, ours ${footerY(ours)}`);
  if (mode !== 'summary') issues.forEach((s) => console.log('  ' + s));
}
