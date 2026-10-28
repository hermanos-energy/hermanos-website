// Generates /sitemap.xml at build time from the page list.
import type { APIRoute } from 'astro';
import { sitemapPages } from '../data/pages';
import { url } from '../lib/url';

export const GET: APIRoute = ({ site }) => {
  // Trailing slash, matching the canonical URLs (pages are built as <page>/index.html)
  const entries = sitemapPages
    .map((page) => `  <url><loc>${new URL(url(page ? `${page}/` : ''), site).href}</loc></url>`)
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
};
