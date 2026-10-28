// Generates /robots.txt at build time, pointing search engines to the sitemap.
import type { APIRoute } from 'astro';
import { url } from '../lib/url';

export const GET: APIRoute = ({ site }) => {
  const sitemap = new URL(url('sitemap.xml'), site).href;
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${sitemap}\n`, { headers: { 'Content-Type': 'text/plain' } });
};
