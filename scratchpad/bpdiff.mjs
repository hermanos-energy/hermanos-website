// Usage: node bpdiff.mjs <outDir> <tablet|mobile>
// Lists elements whose styles differ from desktop at the given breakpoint (matched by Framer class + occurrence).
import fs from 'node:fs';
import path from 'node:path';

const [dir, bp] = process.argv.slice(2);
const IGNORE = new Set(['width', 'height', 'top', 'left', 'transform', 'borderTopColor']);

const keyed = (file) => {
  const seen = {};
  const map = new Map();
  for (const n of JSON.parse(fs.readFileSync(path.join(dir, file)))) {
    const k = (n.cls.split(' ')[0] || n.tag) + (n.text ? '«' + n.text.slice(0, 20) : '');
    seen[k] = (seen[k] || 0) + 1;
    map.set(`${k}#${seen[k]}`, n);
  }
  return map;
};

const desktop = keyed('desktop.json');
const other = keyed(`${bp}.json`);

for (const [k, o] of other) {
  const d = desktop.get(k);
  if (!d) { console.log(`ONLY ${bp.toUpperCase()}  ${k} [${o.rect.w}x${o.rect.h}]`); continue; }
  const keys = new Set([...Object.keys(d.styles), ...Object.keys(o.styles)]);
  const changes = [...keys].filter((p) => !IGNORE.has(p) && d.styles[p] !== o.styles[p])
    .map((p) => `${p}: ${d.styles[p] ?? '-'} → ${o.styles[p] ?? '-'}`);
  if (changes.length) console.log(`${k} [${o.rect.x},${o.rect.y} ${o.rect.w}x${o.rect.h}]  ${changes.join('; ')}`);
}
for (const k of desktop.keys()) if (!other.has(k)) console.log(`ONLY DESKTOP  ${k}`);
