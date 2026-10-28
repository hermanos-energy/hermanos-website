// One-off: downloads the Google Fonts used by the site (Latin + Latin Extended only) into src/assets/fonts/
// and writes src/styles/fonts.css with matching @font-face rules, so the site no longer loads fonts from Google.
import fs from 'node:fs';

const CSS_URL = 'https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700&family=Rajdhani:wght@400;500;600;700&display=swap';
const KEEP = ['latin', 'latin-ext'];
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

const css = await (await fetch(CSS_URL, { headers: { 'User-Agent': UA } })).text();
fs.mkdirSync('src/assets/fonts', { recursive: true });

// Google's CSS is a list of "/* subset */ @font-face { ... }" blocks
const blocks = [...css.matchAll(/\/\* ([\w-]+) \*\/\s*@font-face \{([^}]+)\}/g)];
const faces = blocks
  .filter(([, subset]) => KEEP.includes(subset))
  .map(([, subset, body]) => ({
    subset,
    family: body.match(/font-family: '([^']+)'/)[1],
    weight: body.match(/font-weight: (\d+)/)[1],
    src: body.match(/url\((https:[^)]+\.woff2)\)/)[1],
    range: body.match(/unicode-range: ([^;]+);/)[1],
  }));

// A file used for several weights is a variable font (Manrope); name files by weight otherwise
const weightsPerFile = new Map();
faces.forEach((f) => weightsPerFile.set(f.src, (weightsPerFile.get(f.src) || 0) + 1));

const downloaded = new Map(); // font URL → local file name
const rules = [];

for (const { subset, family, weight, src, range } of faces) {
  if (!downloaded.has(src)) {
    const variant = weightsPerFile.get(src) > 1 ? 'variable' : weight;
    const name = `${family.toLowerCase()}-${variant}-${subset}.woff2`;
    fs.writeFileSync(`src/assets/fonts/${name}`, Buffer.from(await (await fetch(src)).arrayBuffer()));
    downloaded.set(src, name);
  }
  rules.push(`/* ${family} ${weight} — ${subset} */\n@font-face {\n  font-family: '${family}';\n  font-style: normal;\n  font-weight: ${weight};\n  font-display: swap;\n  src: url('../assets/fonts/${downloaded.get(src)}') format('woff2');\n  unicode-range: ${range};\n}`);
}

fs.writeFileSync('src/styles/fonts.css', `/* Self-hosted copies of Rajdhani and Manrope (SIL Open Font License), downloaded from Google Fonts by\n   scratchpad/fetch-fonts.mjs. Only the Latin and Latin Extended subsets are included. */\n\n${rules.join('\n\n')}\n`);
console.log(`${rules.length} @font-face rules, ${downloaded.size} font files`);
