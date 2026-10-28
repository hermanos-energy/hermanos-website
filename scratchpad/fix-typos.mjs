// One-off: fixes spelling and grammar mistakes copied from the live site, and reports every change per file.
import fs from 'node:fs';
import path from 'node:path';

const FIXES = [
  ['cheapter', 'cheaper'],
  ['Mannaging heat', 'Managing heat'],
  ['betweem', 'between'],
  ['enviroment', 'environment'],
  ['electricyty', 'electricity'],
  ['electricy.', 'electricity.'],
  ['temperartures', 'temperatures'],
  ['fosil fuels', 'fossil fuels'],
  ['bussines', 'business'],
  ['cheaper then reqular', 'cheaper than regular'],
  ['affordable option then diesel', 'affordable option than diesel'],
  ['more then 10.000', 'more than 10.000'],
  ['issues with out product', 'issues with our product'],
  ['If your interested', "If you're interested"],
  ['two of the shelf options', 'two off-the-shelf options'],
  ['Look at or power to power product', 'Look at our power to power product'],
  ['gas bundels', 'gas bundles'],
  ['electrolyzer whic makes', 'electrolyzer which makes'],
  [`the "loss\\'\\' of energy`, 'the "loss" of energy'],
  ['social impact we are making..', 'social impact we are making.'],
  ['social impact we are making</p>', 'social impact we are making.</p>'],
  ['CO2 emissions required. this is causing', 'CO2 emissions required. This is causing'],
  ['is required. this is causing', 'is required. This is causing'],
  ['fossil fuel as a energy source', 'fossil fuel as an energy source'],
  ['Hermanos Energy mission is', "Hermanos Energy's mission is"],
  ['to heat your house Hermanos Energy is offering', 'to heat your house. Hermanos Energy is offering'],
  ['hot&nbsp; water', 'hot water'],
  ['around&nbsp; €20', 'around €20'],
  ['per kilogram.&nbsp; Making', 'per kilogram. Making'],
];

const files = [];
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).forEach((e) => {
  const full = path.join(dir, e.name);
  if (e.isDirectory()) walk(full);
  else if (/\.(astro|ts)$/.test(e.name)) files.push(full);
});
walk('src');

let total = 0;
for (const file of files) {
  let text = fs.readFileSync(file, 'utf8');
  const changes = [];
  for (const [from, to] of FIXES) {
    const count = text.split(from).length - 1;
    if (count) {
      text = text.split(from).join(to);
      changes.push(`  ${count}× "${from}" → "${to}"`);
      total += count;
    }
  }
  if (changes.length) {
    fs.writeFileSync(file, text);
    console.log(`${file}\n${changes.join('\n')}`);
  }
}
console.log(`\n${total} corrections`);
