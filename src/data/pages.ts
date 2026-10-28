// All public pages (path relative to the site base, '' = home). Every page exists in every language.
export const pages = ['', 'product', 'power-to-heat', 'power-to-drive', 'power-to-power', 'aboutus', 'contact'] as const;
export type Page = (typeof pages)[number];
