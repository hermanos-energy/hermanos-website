// Generates /sitemap.xml at build time: every page in every language, with links between the language versions.
import type { APIRoute } from 'astro';
import { pages } from '../data/pages';
import { languages, localUrl, type Lang } from '../i18n';

export const GET: APIRoute = ({ site }) => {
  const langs = Object.keys(languages) as Lang[];
  // Trailing slash, matching the canonical URLs (pages are built as <page>/index.html)
  const abs = (lang: Lang, page: string) => new URL(localUrl(lang, page ? `${page}/` : ''), site).href;

  const entries = pages.flatMap((page) => langs.map((lang) => {
    const alternates = langs.map((alt) => `    <xhtml:link rel="alternate" hreflang="${alt}" href="${abs(alt, page)}"/>`).join('\n');
    return `  <url>\n    <loc>${abs(lang, page)}</loc>\n${alternates}\n  </url>`;
  }));

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${entries.join('\n')}\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
};
