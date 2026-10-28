// One-off check of the rebuilt news slider's pause behaviour (8 s interval).
import { chromium } from 'playwright';

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('file:///C:/dev/hermanos/hermanos-website/scratchpad/index.html');
const slide = () => p.evaluate(() => [...document.querySelectorAll('.slider__dot')].findIndex((d) => d.getAttribute('aria-current') === 'true'));
const wait = (s) => p.waitForTimeout(s * 1000);

console.log('start:', await slide());
await wait(8.5);
console.log('after 8.5 s (autoplay):', await slide());

await p.locator('.news-slide').first().scrollIntoViewIfNeeded();
await p.hover('.slider', { position: { x: 600, y: 300 } });
await wait(9);
console.log('hovered 9 s (should not move):', await slide());
await p.mouse.move(5, 5);
await p.locator('.site-footer').click({ position: { x: 5, y: 5 } }); // move focus out of the slider
await wait(8.5);
console.log('after leaving 8.5 s (moves again):', await slide());

// Go to the video slide and play the video (muted, so autoplay is allowed)
await p.evaluate(() => document.querySelectorAll('.slider__dot')[2].click());
await p.mouse.move(5, 5);
await p.locator('.site-footer').click({ position: { x: 5, y: 5 } });
await p.evaluate(() => document.querySelector('.slider video').play().catch((e) => console.log(e.message)));
await wait(9);
console.log('video playing 9 s (should stay on 2):', await slide(), '| video paused:', await p.evaluate(() => document.querySelector('.slider video').paused));
await p.evaluate(() => document.querySelector('.slider video').pause());
await wait(8.5);
console.log('video paused, 8.5 s later (moves again):', await slide());
await b.close();
