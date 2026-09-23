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

/** Stored by the language toggle when the user makes an explicit choice. */
const LANGUAGE_KEY = 'language';

const BELARUSIAN_BROWSER_LANGUAGES = ['be', 'be-tarask', 'bel'];

function prefersBelarusian(): boolean {
  const browserLang = (window.navigator.language || '').toLowerCase();
  const matchesBrowser = BELARUSIAN_BROWSER_LANGUAGES.some(
    (l) => browserLang === l || browserLang.startsWith(`${l}-`)
  );
  if (matchesBrowser) return true;

  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone === 'Europe/Minsk';
  } catch {
    return false;
  }
}

/**
 * Client-only: send visitors who likely prefer Belarusian (an explicit
 * stored preference, or detection via browser language / Minsk timezone)
 * to the `/be` equivalent of the English page they opened.
 *
 * Runs after a full page load only — the English HTML is already served
 * (and indexed) before this executes, so it never affects crawlers or the
 * prerendered output. Client-side navigations never reach this either.
 */
export function redirectToPreferredLocale(): void {
  if (typeof window === 'undefined') return;

  const path = window.location.pathname;
  // Only English *content* pages are candidates; /be, other prefixes and
  // potential 404s are left alone (also guarantees no redirect loops).
  const isEnglishPage =
    path === '/' || /^\/distro\/[^/]+$/.test(path) || /^\/blog(?:\/[^/]+)?$/.test(path);
  if (!isEnglishPage) return;

  const stored = window.localStorage.getItem(LANGUAGE_KEY);
  const preferBe =
    stored === 'be' ? true : stored === 'en' ? false : prefersBelarusian();
  if (!preferBe) return;

  window.location.replace(localePath(path, 'be'));
}

/** Remember an explicit language choice so the auto-redirect respects it. */
export function storeLanguagePreference(lang: Language): void {
  try {
    window.localStorage.setItem(LANGUAGE_KEY, lang);
  } catch {
    // storage unavailable (private mode/quota) — redirect heuristics just apply
  }
}
