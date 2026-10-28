// Translations: every visible text lives in en.json / nl.json; pages and components only hold structure.
// English is the default language (no URL prefix); Dutch lives under /nl/.
import en from './en.json';
import nl from './nl.json';
import { url } from '../lib/url';

export const languages = { en: 'EN', nl: 'NL' } as const;
export type Lang = keyof typeof languages;
export const defaultLang: Lang = 'en';
export type Dictionary = typeof en;

// Build-time safety check: both files must have exactly the same keys (and equally long lists),
// so a page can never be published half-translated. Fails the build with a list of problems.
function compare(a: unknown, b: unknown, path: string, problems: string[]) {
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b)) problems.push(`${path}: list in one language, not in the other`);
    else if (a.length !== b.length) problems.push(`${path}: ${a.length} items in en, ${b.length} in nl`);
    return;
  }
  if (typeof a === 'object' && a && typeof b === 'object' && b) {
    for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) {
      if (!(key in a)) problems.push(`${path}${key}: missing in en.json`);
      else if (!(key in b)) problems.push(`${path}${key}: missing in nl.json`);
      else compare((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key], `${path}${key}.`, problems);
    }
    return;
  }
  if (typeof a !== typeof b) problems.push(`${path}: different type in en and nl`);
  else if (typeof a === 'string' && b === '') problems.push(`${path}: empty in nl.json`);
}

const problems: string[] = [];
compare(en, nl, '', problems);
if (problems.length) throw new Error(`Translation files don't match:\n  ${problems.join('\n  ')}`);

const dictionaries: Record<Lang, Dictionary> = { en, nl: nl as Dictionary };

export function useTranslations(lang: Lang): Dictionary {
  return dictionaries[lang];
}

// URL of a page in a given language, e.g. localUrl('nl', 'product') → /hermanos-website/nl/product
export function localUrl(lang: Lang, page = ''): string {
  return url(lang === defaultLang ? page : `${lang}/${page}`);
}
