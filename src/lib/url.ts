// Builds a site-relative URL that respects Astro's `base` (e.g. '/hermanos-website' on GitHub Pages, '/' on the own domain).
const base = import.meta.env.BASE_URL.replace(/\/$/, '');

export function url(path = ''): string {
  return `${base}/${path.replace(/^\//, '')}`;
}

// srcset helper: srcset('images/home/ems', [[1024, '-1024.jpg'], [2048, '-2048.jpg']])
export function srcset(prefix: string, variants: [number, string][]): string {
  return variants.map(([width, suffix]) => `${url(prefix + suffix)} ${width}w`).join(', ');
}
