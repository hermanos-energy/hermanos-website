// One-off check: clicking each tab on the rebuilt detail pages shows exactly one panel with the matching image.
import { chromium } from 'playwright';

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
for (const page of ['power-to-heat', 'power-to-drive', 'power-to-power']) {
  await p.goto(`file:///C:/dev/hermanos/hermanos-website/scratchpad/${page}/index.html`);
  const count = await p.locator('.tabs__button').count();
  for (let i = 0; i < count; i++) {
    await p.locator('.tabs__button').nth(i).click();
    // Images on the non-default tabs are lazy-loaded, so give them a moment.
    await p.waitForFunction(() => {
      const img = [...document.querySelectorAll('.tab-panel')].find((x) => !x.hidden)?.querySelector('img');
      return img && img.complete && img.naturalWidth > 0;
    }, null, { timeout: 5000 }).catch(() => {});
    const state = await p.evaluate(() => {
      const visible = [...document.querySelectorAll('.tab-panel')].filter((x) => !x.hidden);
      const img = visible[0]?.querySelector('img');
      return `${document.querySelector('.tabs__button[aria-selected="true"]').textContent} → ${visible.length} panel visible, image ${img?.currentSrc.split('/').pop()} loaded=${img?.complete && img?.naturalWidth > 0}`;
    });
    console.log(`${page}: ${state}`);
  }
}
await b.close();
