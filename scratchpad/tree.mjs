// Usage: node tree.mjs <extract.json> <framer-class> [maxDepth] [maxLineWidth]
// Prints the subtree under the first element with that class, with only the styles that matter for layout/type.
// Skips SVG internals and truncates long lines, so no shell pipes are needed.
import fs from 'node:fs';

const [file, cls, maxDepth = 99, width = 300] = process.argv.slice(2);
const SVG_PARTS = new Set(['path', 'g', 'rect', 'line', 'circle', 'use', 'polyline', 'polygon', 'ellipse']);
const nodes = JSON.parse(fs.readFileSync(file));
const NOISE = { fontSize: '12px', fontWeight: '400', color: 'rgb(0, 0, 0)', fontFamily: 'sans-serif' };
const SKIP = new Set(['borderTopColor', 'transform', 'zIndex', 'top', 'left', 'width', 'height', 'textDecorationLine']);

const start = nodes.findIndex((n) => n.cls.split(' ').includes(cls));
if (start < 0) { console.error('class not found'); process.exit(1); }
const base = nodes[start].depth;

for (let i = start; i < nodes.length; i++) {
  const n = nodes[i];
  if (i > start && n.depth <= base) break;
  if (n.depth - base > maxDepth || SVG_PARTS.has(n.tag)) continue;
  const styles = Object.entries(n.styles)
    .filter(([k, v]) => !SKIP.has(k) && NOISE[k] !== v && !(k === 'fontFamily' && !n.text))
    .map(([k, v]) => `${k}:${v.replace(/"Rajdhani Placeholder", /, '').replace(/, sans-serif/, '')}`).join('; ');
  const label = [n.tag, n.cls.split(' ')[0], n.name && `"${n.name}"`].filter(Boolean).join(' ');
  const extra = [n.text && `«${n.text.slice(0, 50)}»`, n.src && n.src.split('/').pop().slice(0, 40)].filter(Boolean).join(' ');
  console.log(`${'  '.repeat(n.depth - base)}${label} [${n.rect.x},${n.rect.y} ${n.rect.w}x${n.rect.h}] ${extra} ${styles}`.slice(0, Number(width)));
}
