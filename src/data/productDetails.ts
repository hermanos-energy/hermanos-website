// Structure and measured layout values of the three product detail pages (rendered by ProductDetail.astro).
// All text lives in src/i18n/<lang>.json under productDetails.<key>; ids here match the keys there.
import type { productNames } from './products';

export interface ProductDetailConfig {
  key: keyof typeof productNames; // also the key in the translation files
  slug: 'power-to-heat' | 'power-to-drive' | 'power-to-power';
  icons: string[];
  features: { id: string; icon: string; size?: 'wide' | 'full' }[];
  tabs: {
    // CSS custom properties for the tab block (see product-detail.css)
    layout: Record<string, string>;
    items: { id: string; fixedText?: boolean }[];
  };
  wideInActionOnMobile?: boolean;
}

export const powerToHeat: ProductDetailConfig = {
  key: 'heat',
  slug: 'power-to-heat',
  icons: ['sun', 'drop', 'chart', 'thermometer', 'eye', 'arrow-right'],
  features: [
    { id: 'solarHeat', icon: 'sun', size: 'wide' },
    { id: 'replacesGas', icon: 'drop' },
    { id: 'mixing', icon: 'chart' },
    { id: 'anyTemperature', icon: 'thermometer', size: 'wide' },
    { id: 'energyLoss', icon: 'eye', size: 'full' },
  ],
  tabs: {
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
    items: [{ id: 'summer', fixedText: true }, { id: 'winter' }],
  },
};

export const powerToDrive: ProductDetailConfig = {
  key: 'drive',
  slug: 'power-to-drive',
  icons: ['laptop', 'waves', 'tree', 'gas-pump', 'money', 'arrow-right'],
  features: [
    { id: 'neverOutOfFuel', icon: 'laptop', size: 'wide' },
    { id: 'moreThanFuel', icon: 'waves' },
    { id: 'driveAnywhere', icon: 'tree' },
    { id: 'easyRefueling', icon: 'gas-pump', size: 'wide' },
    { id: 'cheaper', icon: 'money', size: 'full' },
  ],
  tabs: {
    layout: {
      'tabs-gap': '41px',
      'tabs-min-height-desktop': '744px',
      'tab-image-desktop': '502px',
      'tab-image-tablet': '357px',
      'tab-image-mobile': '190px',
    },
    items: [{ id: 'day' }, { id: 'night' }],
  },
  wideInActionOnMobile: true,
};

export const powerToPower: ProductDetailConfig = {
  key: 'power',
  slug: 'power-to-power',
  icons: ['laptop', 'battery', 'cylinder', 'thermometer', 'money', 'arrow-right'],
  features: [
    { id: 'energyManagement', icon: 'laptop', size: 'wide' },
    { id: 'dayNightStorage', icon: 'battery' },
    { id: 'seasonalStorage', icon: 'cylinder' },
    { id: 'heat', icon: 'thermometer', size: 'wide' },
    { id: 'profit', icon: 'money', size: 'full' },
  ],
  tabs: {
    layout: {
      'tabs-gap': '42px',
      'tabs-width-tablet': '810px',
      'tab-image-desktop': '502px',
      'tab-image-tablet': '430px',
      'tab-image-mobile': '200px',
    },
    items: [{ id: 'summer' }, { id: 'autumn' }, { id: 'winter' }],
  },
};
