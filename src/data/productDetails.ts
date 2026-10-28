// Content and measured layout values for the three product detail pages (rendered by ProductDetail.astro).
// Copy is taken from the live desktop site, typos included.
import type { Feature } from '../components/Features.astro';

export interface ProductDetailData {
  slug: 'power-to-heat' | 'power-to-drive' | 'power-to-power';
  title: string;
  subtitle: string;
  description: string;
  diagramAlt: string;
  icons: string[];
  features: { heading: string; items: Feature[] };
  tabs: {
    heading: string;
    intro: string;
    // CSS custom properties for the tab block (see product-detail.css)
    layout: Record<string, string>;
    items: { id: string; label: string; text: string; alt: string; fixedText?: boolean }[];
  };
  inAction: { title: string; photoAlt: string; wideOnMobile?: boolean };
}

export const powerToHeat: ProductDetailData = {
  slug: 'power-to-heat',
  title: 'Power to Heat',
  subtitle: 'Heating with locally produced hydrogen.',
  description: 'Heating with locally produced hydrogen.',
  diagramAlt: 'Power to heat system diagram: own energy and grid feed the battery and electrolyser; hydrogen goes to H2 storage and an H2 boiler',
  icons: ['sun', 'drop', 'chart', 'thermometer', 'eye', 'arrow-right'],
  features: {
    heading: 'This is what makes power to heat unique.',
    items: [
      { icon: 'sun', size: 'wide', title: 'Solar heat in winter', text: "Throughout the year, the software continuously monitors grid prices, the availability of green energy, weather forecasts, and your specific circumstances. It uses this information to optimize the system's performance for your needs making sure you can store the surplus solar energy generated in summer and use it for heating in winter." },
      { icon: 'drop', title: 'Replaces gas', text: 'Hydrogen is a gas with characteristics very similar to natural gas. With Power-to-Heat, we burn the hydrogen directly replacing your need for conventional gas.' },
      { icon: 'chart', title: 'Mixing with gas', text: 'Hydrogen is so similar to natural gas that it can be mixed with it, allowing you to start using hydrogen without needing to switch over completely right away.' },
      { icon: 'thermometer', size: 'wide', title: 'Any temperature any usecase', text: 'Burning hydrogen can generate very high temperatures, making it suitable for situations where heat pumps or electric heating are not viable.<br><br>There is a wide range of hydrogen boilers, gas mixers, and hydrogen-compatible heat pumps available for both industrial and domestic use. We work with a variety of suppliers to match your specific needs.' },
      { icon: 'eye', size: 'full', title: 'Hardly any energy loss', text: 'When converting between electricity and hydrogen, heat is released. This heat is often considered "energy loss." In our system, however, the released heat is recovered and stored resulting in less than 15% energy loss and making the entire process highly efficient.' },
    ],
  },
  tabs: {
    heading: 'A year-round solution',
    intro: 'In summer, there is often an excess of solar power, while energy consumption is relatively low. In winter, days are shorter and temperatures lower most energy use then goes toward heating. With power to heat, we convert electricity from solar panels into hydrogen, which can be stored and used for heating in winter. Click through the pictures to see how the system behaves across different seasons.',
    // On the live site this tab block has a fixed height with its content centered in it
    layout: {
      'tabs-gap': '26px',
      'tabs-justify': 'center',
      'tabs-min-height-desktop': '744px',
      'tabs-min-height-tablet': '744px',
      'tabs-min-height-mobile': '641px',
      'tabs-width-tablet': '810px',
      'tab-image-desktop': '518px',
      'tab-image-tablet': '430px',
      'tab-image-mobile': '190px',
    },
    items: [
      { id: 'summer', label: 'Summer', fixedText: true, alt: 'The system in summer: solar panels power the electrolyser', text: 'During summer, solar panels generate more energy than you consume. At these moments, we convert the excess electricity into hydrogen and store it in tanks for later use. The system includes a battery that balances your electricity usage throughout the day, ensuring only the surplus energy is converted into hydrogen while also extending the electrolyzer’s operating hours. While generating hydrogen, some heat is released and recovered. This heat can be used for hot water typically enough to provide showers for a family.' },
      { id: 'winter', label: 'Winter', alt: 'The system in winter: stored hydrogen heats the building', text: 'In winter we use the hydrogen to heat your home. We use hydrogen boilers making sure you are warm even if temperartures get very low. Electricity prices still vary a lot in the winter, and can still be negative. At those moments we still make hydrogen to keep your tanks filled.' },
    ],
  },
  inAction: { title: 'Power to heat in action', photoAlt: 'Power to heat installation at a farm' },
};

export const powerToDrive: ProductDetailData = {
  slug: 'power-to-drive',
  title: 'Power to Drive',
  subtitle: 'Drive a boat or vehicle on your own hydrogen.',
  description: 'Drive a boat or vehicle on your own hydrogen.',
  diagramAlt: 'Power to drive system diagram: own energy and grid feed the battery and electrolyser; hydrogen is compressed and used to refuel a vehicle',
  icons: ['laptop', 'waves', 'tree', 'gas-pump', 'money', 'arrow-right'],
  features: {
    heading: 'This is what makes power to drive unique.',
    items: [
      { icon: 'laptop', size: 'wide', title: 'Never out of fuel', text: 'The hydrogen used to fuel your vehicle is produced on-site, so you don’t depend on external fuel suppliers, and your vehicle doesn’t need to leave the premises to refuel. Our software monitors grid prices, the availability of renewable energy, and the amount of fuel left in your tanks. It not only ensures you always have fuel but also chooses the most cost-effective moments to produce it.' },
      { icon: 'waves', title: 'More than just fuel', text: 'During hydrogen production, we recover waste heat and use a battery to extend the electrolyzer’s runtime.' },
      { icon: 'tree', title: 'Drive anywhere', text: 'Diesel-powered vehicles are not welcome in zero-emission zones like nature reserves. Battery-powered vehicles are often not feasible either, as their weight can cause them to sink in muddy terrain. In these cases, hydrogen-powered vehicles are the only practical option and they also offer a much greater range.' },
      { icon: 'gas-pump', size: 'wide', title: 'Easy refueling', text: 'Our refueling station is easy to use, simple, and reliable. The experience is very similar to refueling with petrol or diesel.<br><br>We use the high pressure in the storage tanks to fill your vehicle, slowly releasing the gas to ensure safety and reliability. We can fuel vehicles up to 300 bar, and it takes around fifteen minutes to fill your vehicle.<br><br>We manage the entire process, from producing the hydrogen to compressing and refueling, so we can ensure the tanks are always at the right pressure to fill your vehicle efficiently' },
      { icon: 'money', size: 'full', title: '50% cheapter than diesel', text: "Your own solar energy is by far the cheapest energy available. We use it to produce hydrogen for around €3 per kilogram. A typical car can drive approximately 100 km on just one kilogram of hydrogen. This makes hydrogen a much more affordable option then diesel as long as it's produced locally by you.<br><br>Buying hydrogen at a commercial fuel station cost around €21 per kilogram.&nbsp; Making your own is 7 times cheapter." },
    ],
  },
  tabs: {
    heading: 'Fuel is made while you use the vehicle',
    intro: 'During a sunny summer day, energy is cheap and green but that’s often the exact moment you want to use your vehicle. We produce hydrogen when there’s an abundance of green energy and store it in tanks, so you can refuel later. Whether you have a vehicle you use daily or only during certain seasons, we always choose the right moments throughout the year to produce hydrogen ensuring it’s available when you need it. Click the pictures below to see how the system works at different times',
    layout: {
      'tabs-gap': '41px',
      'tabs-min-height-desktop': '744px',
      'tab-image-desktop': '502px',
      'tab-image-tablet': '357px',
      'tab-image-mobile': '190px',
    },
    items: [
      { id: 'day', label: 'Day', alt: 'During the day the electrolyser makes hydrogen from solar power while the vehicle is in use', text: 'While you\'re out working during the day and using your vehicle, the electrolyzer produces hydrogen using the energy generated by your solar panels. By the time you return from a hard day’s work, your hydrogen tanks are full and ready to use.' },
      { id: 'night', label: 'Night', alt: 'At night the vehicle is refuelled with the hydrogen made during the day', text: 'When the workday is over, the sun is down, and energy prices are high your vehicle is fueled by the green and cheap hydrogen produced during the day. Ready to go again tomorrow.' },
    ],
  },
  inAction: { title: 'Power to drive in action', photoAlt: 'Hydrogen refuelling station', wideOnMobile: true },
};

export const powerToPower: ProductDetailData = {
  slug: 'power-to-power',
  title: 'Power to Power',
  subtitle: 'A year round green electricity.',
  description: 'A year round green electricity.',
  diagramAlt: 'Power to power system diagram: own energy and grid feed the battery and electrolyser; a fuel cell turns stored hydrogen back into electricity and warm water for the home',
  icons: ['laptop', 'battery', 'cylinder', 'thermometer', 'money', 'arrow-right'],
  features: {
    heading: 'This is what makes power to power unique.',
    items: [
      { icon: 'laptop', size: 'wide', title: 'Personalised smart energy management', text: "Throughout the year, the software continuously monitors grid prices, availability of green energy, weather predictions, and your specific circumstances. It leverages these inputs to optimize the system's performance for your needs." },
      { icon: 'battery', title: 'Day and night storage', text: 'We store your electricity in a battery as a buffer for short-term imbalances between production and usage (such as day-night variations)' },
      { icon: 'cylinder', title: 'Seasonal storage', text: 'We use an electrolyzer to store electricity in the form of hydrogen as a buffer for imbalances over longer periods (summer-winter). A fuel cell converts it back to electricy. Hydrogen is 20 times cheaper then reqular batteries per stored kWh' },
      { icon: 'thermometer', size: 'wide', title: 'Mannaging heat', text: 'When converting betweem electricity and hydrogen, heat is released. This heat is often considered as "energy loss." In our system, the released heat is recovered and stored to deliver hot&nbsp; water at around 55 °C to your home or business.' },
      { icon: 'money', size: 'full', title: 'Good for profit and enviroment', text: 'With our storage solution, you can also significantly reduce your costs for grid electricity usage. Grid electricity prices vary from hour to hour, ranging from more than 60 cents per kwh to below zero. You can configure the software to stop drawing electricity from the grid once the price exceeds a certain level, and instead utilize the electricity stored in your system. And moments with high prices correlate with a lot of energy from fosil fuels, using your own stored green energy at those moments is much better for the enviroment as well.<br><br>Our solution can also be used when you are faced with net congestion, and can not expand. We make sure you can always run your bussines the way you want.' },
    ],
  },
  tabs: {
    heading: 'A year-round solution',
    intro: 'In summer there is an excess of solar power and at that time energy consumption is low. In winters the yield of solar panels is much less, and a lot of energy in the form of heating is used. Batteries have a limited storage capacity, they are great for day storage but we add hydrogen storage to it to deal with the imbalance in the seasons. Click through the pictures below to see how our system behaves during the different seasons.',
    layout: {
      'tabs-gap': '42px',
      'tabs-width-tablet': '810px',
      'tab-image-desktop': '502px',
      'tab-image-tablet': '430px',
      'tab-image-mobile': '200px',
    },
    items: [
      { id: 'summer', label: 'Summer', alt: 'The system in summer: surplus solar power charges the battery and makes hydrogen', text: "During summer, solar panels often generate more energy than you consume. At these moments, we store the surplus energy in a battery for later use. Additionally, we convert the excess electricity into hydrogen, which can be utilized for heating your home during the winter months. Even if you don't have solar panels, you can still benefit from the green energy available on the grid." },
      { id: 'autumn', label: 'Autumn', alt: 'The system in autumn: green wind energy from the grid charges the battery', text: 'On windy and rainy autumn days, solar energy may not be readily accessible. However, thanks to the contribution of windmills, there is still an abundance of green energy. Our system continuously monitors the grid, keeping track of green energy availability and prices. When the electricity is sourced from renewable sources and prices are low, we seize the opportunity to charge the battery and produce hydrogen. Notably, the process of generating hydrogen also generates heat, which we harness to warm your home efficiently.' },
      { id: 'winter', label: 'Winter', alt: 'The system in winter: stored hydrogen is turned back into electricity and heat', text: 'During winter, when solar and wind energy are limited, our stored energy comes into play. We provide two of the shelf options for utilizing the stored hydrogen:<br>1. You can directly convert the stored hydrogen into heating using a boiler.<br>2. Alternatively, you can use a fuel cell to generate electricity once again. The electricity generation process itself generates heat, which we effectively utilize to warm your home.<br><br>Moreover, if you happen to store more energy than you need, we enable you to contribute the excess electricity back to the grid. This allows your neighbors to benefit from the surplus green electricity, while you enjoy the advantage of potentially high electricity prices in such scenarios. By implementing our comprehensive solution, you can optimize your energy consumption throughout the year, making the most of renewable resources while reducing your environmental footprint.' },
    ],
  },
  inAction: { title: 'Power to Power in action', photoAlt: 'Power to power installation at a farm' },
};
