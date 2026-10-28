// One-off: wraps each stylesheet in src/styles in a CSS cascade layer, so the order base → components → page
// no longer depends on the order in which Astro injects the files. Every file declares the full layer order first.
import fs from 'node:fs';

const LAYERS = {
  'base.css': 'base',
  'product-detail.css': 'components',
  'aboutus.css': 'page',
  'product.css': 'page',
  'home.css': 'page',
  'contact.css': 'page',
};
const ORDER = '@layer base, components, page;';

for (const [file, layer] of Object.entries(LAYERS)) {
  const path = `src/styles/${file}`;
  const css = fs.readFileSync(path, 'utf8');
  if (css.includes(ORDER)) { console.log(`${file}: already wrapped`); continue; }
  const indented = css.trimEnd().split('\n').map((line) => (line ? `  ${line}` : line)).join('\n');
  fs.writeFileSync(path, `/* Cascade layer order is declared in every stylesheet; see base.css */\n${ORDER}\n\n@layer ${layer} {\n${indented}\n}\n`);
  console.log(`${file}: wrapped in @layer ${layer}`);
}
