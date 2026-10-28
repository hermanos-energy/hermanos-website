// Usage: node download.mjs <targetDir> <fileName>=<url> [<fileName>=<url> ...]
// Downloads images from the live site into a page's assets folder (only framerusercontent.com and YouTube thumbnails).
import fs from 'node:fs';
import path from 'node:path';

const [dir, ...pairs] = process.argv.slice(2);
fs.mkdirSync(dir, { recursive: true });

for (const pair of pairs) {
  const i = pair.indexOf('=');
  const name = pair.slice(0, i);
  const url = pair.slice(i + 1);
  if (!['framerusercontent.com', 'i.ytimg.com'].includes(new URL(url).hostname)) throw new Error(`refusing URL from unknown host: ${url}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} for ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(path.join(dir, name), buf);
  console.log(`${name}  ${(buf.length / 1024).toFixed(0)} KB`);
}
