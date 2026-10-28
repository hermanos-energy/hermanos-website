// One-off: moves the photos from public/images to src/assets/images so Astro can optimise them (AVIF/WebP, several
// widths). Keeps only the largest version of each photo (dropping the "-2048"/"-1920" suffix) and deletes the
// "-1024"/"-768" copies, which Astro now generates itself. Logos, icons and charts stay in public/images.
import fs from 'node:fs';
import path from 'node:path';

const MOVES = {
  'aboutus/founders-2048.jpg': 'aboutus/founders.jpg',
  'aboutus/preview-2048.jpg': 'aboutus/preview.jpg',
  'product/products.png': 'product/products.png',
  'product/timeline.png': 'product/timeline.png',
  'home/images/hero-1920.png': 'home/hero.png',
  'home/images/future-2048.jpg': 'home/future.jpg',
  'home/images/ems-2048.jpg': 'home/ems.jpg',
  'home/images/contact-2048.jpg': 'home/contact.jpg',
  'home/news/vakbeurs.jpg': 'home/news/vakbeurs.jpg',
  'home/news/power2you.png': 'home/news/power2you.png',
  'home/news/award.jpg': 'home/news/award.jpg',
};
for (const page of ['power-to-heat', 'power-to-drive', 'power-to-power']) {
  for (const file of fs.readdirSync(`public/images/${page}`)) {
    if (file.endsWith('-2048.jpg')) MOVES[`${page}/${file}`] = `${page}/${file.replace('-2048', '')}`;
    if (file === 'diagram.jpg') MOVES[`${page}/${file}`] = `${page}/${file}`;
  }
}
const DELETE = [
  'aboutus/founders-1024.jpg', 'aboutus/preview-1024.jpg',
  'home/images/hero-1024.png', 'home/images/future-1024.jpg', 'home/images/ems-1024.jpg', 'home/images/contact-1024.jpg',
  'home/news/vakbeurs-1024.jpg', 'home/news/power2you-1024.png', 'home/news/award-768.jpg',
];
for (const page of ['power-to-heat', 'power-to-drive', 'power-to-power']) {
  for (const file of fs.readdirSync(`public/images/${page}`)) if (file.endsWith('-1024.jpg')) DELETE.push(`${page}/${file}`);
}

for (const [from, to] of Object.entries(MOVES)) {
  const target = path.join('src/assets/images', to);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.renameSync(path.join('public/images', from), target);
  console.log(`moved   ${from} → src/assets/images/${to}`);
}
for (const file of DELETE) {
  fs.rmSync(path.join('public/images', file));
  console.log(`deleted ${file}`);
}
// Remove folders that are now empty
for (const dir of ['power-to-heat', 'power-to-drive', 'power-to-power', 'aboutus', 'product']) {
  const full = path.join('public/images', dir);
  if (fs.existsSync(full) && fs.readdirSync(full).length === 0) fs.rmdirSync(full);
}
