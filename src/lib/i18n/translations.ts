import type { Translations, Language } from '$lib/locales/types';
import enData from '$lib/locales/en.json';
import beData from '$lib/locales/be.json';

/**
 * All translations are bundled statically so they are available during
 * server-side rendering / prerendering. This is what makes non-JS crawlers
 * (search engines, AI agents) see the correct language in the HTML.
 */
const translationCache: Partial<Record<Language, Translations>> = {
	en: enData as Translations,
	be: beData as Translations,
};

const translationPathCache = new Map<string, string>();

export async function loadTranslation(lang: Language): Promise<Translations> {
	return translationCache[lang] ?? (translationCache.en as Translations);
}

/** Fallback label for ids with no translation, e.g. "kde-plasma" -> "Kde Plasma". */
export function humanizeId(id: string): string {
	return id.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function getTranslation(lang: Language, path: string): string | undefined {
  const cacheKey = `${lang}:${path}`;
  const cached = translationPathCache.get(cacheKey);
  if (cached !== undefined) return cached;
  
  const translations = translationCache[lang];
  if (!translations) {
    const fallback = lang === 'en' ? undefined : getTranslation('en', path);
    translationPathCache.set(cacheKey, fallback || '');
    return fallback;
  }

  const keys = path.split('.');
  let result: unknown = translations;

  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = (result as Record<string, unknown>)[key];
    } else {
      const fallback = lang === 'en' ? undefined : getTranslation('en', path);
      translationPathCache.set(cacheKey, fallback || '');
      return fallback;
    }
  }

  const value = typeof result === 'string' ? result : undefined;
  translationPathCache.set(cacheKey, value || '');
  return value;
}

export function getNestedValue<T = unknown>(lang: Language, path: string): T | undefined {
  const translations = translationCache[lang];
  if (!translations) {
    return lang === 'en' ? undefined : getNestedValue<T>('en', path);
  }

  const keys = path.split('.');
  let result: unknown = translations;

  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = (result as Record<string, unknown>)[key];
    } else {
      return lang === 'en' ? undefined : getNestedValue<T>('en', path);
    }
  }

  return result as T;
}
