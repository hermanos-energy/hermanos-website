// One-off check of the rebuilt contact form. Requests to Formspark are intercepted and answered locally,
// so no real message is ever sent.
import { chromium } from 'playwright';

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const sent = [];
await p.route('https://submit-form.com/**', (route) => {
  sent.push({ url: route.request().url(), body: route.request().postData() });
  route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
});
await p.goto('file:///C:/dev/hermanos/hermanos-website/scratchpad/contact/index.html');

await p.click('.contact-form__submit');
console.log('empty submit → invalid:', await p.evaluate(() => [...document.querySelectorAll('[aria-invalid="true"]')].map((e) => e.name).join(', ')), '| requests:', sent.length);

await p.fill('input[name=name]', 'Test');
await p.fill('input[name=email]', 'not-an-email');
await p.fill('textarea[name=message]', 'Hello');
await p.click('.contact-form__submit');
console.log('bad email → invalid:', await p.evaluate(() => [...document.querySelectorAll('[aria-invalid="true"]')].map((e) => e.name).join(', ')), '| requests:', sent.length);

await p.fill('input[name=email]', 'test@example.com');
await p.click('.contact-form__submit');
await p.waitForSelector('.contact-form__success', { timeout: 5000 });
console.log('valid → request:', JSON.stringify(sent[0]), '| success shown:', await p.isVisible('.contact-form__success'));

await p.evaluate(() => scrollTo(0, 0));
await p.screenshot({ path: 'out/contact-rebuild/form-success.png' });
await b.close();
