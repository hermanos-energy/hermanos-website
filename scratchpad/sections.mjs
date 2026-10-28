// Usage: node sections.mjs <extract.json> [minDepth] [maxDepth]
// Prints the top-level layout (sections and their direct children) of a page, with layout styles only.
import fs from 'node:fs';

const [file, min = 3, max = 5] = process.argv.slice(2);
const KEYS = ['display', 'flexDirection', 'flexWrap', 'justifyContent', 'alignItems', 'gap', 'paddingTop', 'paddingRight',
  'paddingBottom', 'paddingLeft', 'maxWidth', 'backgroundColor', 'backgroundImage', 'borderRadius', 'gridTemplateColumns'];

for (const n of JSON.parse(fs.readFileSync(file))) {
  if (n.depth < min || n.depth > max || n.tag === 'path') continue;
  const styles = KEYS.filter((k) => n.styles[k]).map((k) => `${k}:${n.styles[k]}`).join('; ');
  const line = `${'  '.repeat(n.depth - min)}${n.tag} ${n.cls.split(' ')[0]} ${n.name ? `"${n.name}" ` : ''}[${n.rect.x},${n.rect.y} ${n.rect.w}x${n.rect.h}] ${n.text ? `«${n.text.slice(0, 30)}» ` : ''}${styles}`;
  console.log(line.slice(0, 260));
}
