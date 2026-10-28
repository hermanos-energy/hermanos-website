import { defineConfig } from 'astro/config';

// GitHub Pages project site. When the custom domain (hermanosenergy.com) is connected,
// change `site` to https://www.hermanosenergy.com and `base` to '/'.
export default defineConfig({
  site: 'https://solojan.github.io',
  base: '/hermanos-website',
  trailingSlash: 'ignore',
});
