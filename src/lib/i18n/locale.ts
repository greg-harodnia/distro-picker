import { writable, derived, get } from 'svelte/store';
import type { Language } from '$lib/locales/types';
import { getTranslation } from './translations';

interface LanguageConfig {
  code: Language;
  name: string;
}

const languageConfigs: LanguageConfig[] = [
  {
    code: 'en',
    name: 'English',
  },
  {
    code: 'be',
    name: 'Беларуская',
  },
];

/**
 * The current locale. It is seeded from the URL (`/` -> en, `/be` -> be) by
 * the root layout during SSR/prerender, so the rendered HTML always matches
 * the URL. The URL is the single source of truth — no localStorage/hash.
 */
export const locale = writable<Language>('en');

/** Set the current locale synchronously (translations are bundled). */
export function setLocale(lang: Language): void {
  locale.set(lang);
}

export const t = derived(locale, ($locale) => {
  return (path: string): string | undefined => {
    const result = getTranslation($locale, path);
    return result;
  };
});

export const availableLanguages = languageConfigs.map(c => ({
  code: c.code,
  name: c.name,
}));

/**
 * Prefix a root-relative path with the active locale, e.g.
 * localePath('/distro/mint', 'be') -> '/be/distro/mint'. English stays unprefixed.
 */
export function localePath(path: string, lang: Language = get(locale)): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  if (lang === 'en') return p;
  return p === '/' ? `/${lang}` : `/${lang}${p}`;
}
