// Usage: node show-detail.mjs <page> [texts|tabs|icons|links|images|diff]
// Prints parts of out/<page>/detail.json (written by probe-detail.mjs) in readable form.
import fs from 'node:fs';

const [page, part = 'all'] = process.argv.slice(2);
const d = JSON.parse(fs.readFileSync(`out/${page}/detail.json`));
const show = (name) => part === 'all' || part === name;

if (show('texts')) {
  console.log('=== TEXTS (desktop)');
  d.texts.desktop.forEach((t) => console.log(t));
}
if (show('diff')) {
  console.log('=== TEXT DIFFERENCES vs desktop');
  for (const bp of ['tablet', 'mobile']) {
    d.texts[bp].forEach((t, i) => { if (t !== d.texts.desktop[i]) console.log(`[${bp} #${i}]\n  desktop: ${d.texts.desktop[i]}\n  ${bp}:  ${t}`); });
  }
}
if (show('tabs')) {
  console.log('=== TABS');
  for (const [bp, states] of Object.entries(d.tabs)) {
    for (const s of states) {
      console.log(`[${bp}] clicked #${s.clicked} variant="${s.variant}" component=${s.component}`);
      s.buttons.forEach((b) => console.log(`   button "${b.text}" ${b.rect} bg=${b.backgroundColor} border=${b.borderTopWidth} ${b.borderTopColor} shadow=${b.boxShadow} after=${b.after} inner=${b.inner.join(' | ')}`));
      s.texts.forEach((t) => console.log(`   text ${t.rect} parent=${t.parent} grand=${t.grand}\n     ${t.html}`));
      s.images.forEach((im) => console.log(`   image ${im.rect} box=${im.box} ${im.src}`));
    }
  }
}
if (show('icons')) {
  console.log('=== ICONS');
  d.icons.forEach((i) => console.log(`[w=${i.w} y=${i.y}] ${i.svg}`));
}
if (show('links')) {
  console.log('=== LINKS');
  d.links.forEach((l) => console.log(l));
}
if (show('images')) {
  console.log('=== IMAGES');
  d.images.forEach((i) => console.log(`${i.alt} | ${i.srcset || i.src}`));
}
