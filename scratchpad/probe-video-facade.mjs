// One-off check: the SAIL slide shows the thumbnail without contacting YouTube, and clicking it loads the player.
import { chromium } from 'playwright';

const b = await chromium.launch();
for (const width of [1440, 390]) {
  const p = await b.newPage({ viewport: { width, height: 900 } });
  const youtube = [];
  p.on('request', (r) => { if (/youtube|ytimg|doubleclick/.test(r.url())) youtube.push(r.url()); });
  await p.goto('http://localhost:4321/hermanos-website/', { waitUntil: 'networkidle' });
  await p.locator('.news').scrollIntoViewIfNeeded();
  await p.click('.slider__dot:nth-child(2)');
  await p.waitForTimeout(800);
  const box = await p.locator('.video-facade').boundingBox();
  await p.evaluate(() => { document.querySelector('.site-header').style.visibility = 'hidden'; });
  await p.locator('.video-facade').screenshot({ path: `scratchpad/out/home-astro/video-facade-${width}.png` });
  await p.evaluate(() => { document.querySelector('.site-header').style.visibility = ''; });
  console.log(`${width}px: facade ${Math.round(box.width)}x${Math.round(box.height)}, YouTube requests before click: ${youtube.length}`);
  await p.click('.video-facade');
  await p.waitForTimeout(1500);
  const iframe = await p.evaluate(() => { const f = document.querySelector('.news iframe'); return f && `${f.src} ${Math.round(f.getBoundingClientRect().width)}x${Math.round(f.getBoundingClientRect().height)}`; });
  console.log(`${width}px: after click → iframe ${iframe}`);
  await p.close();
}
await b.close();
