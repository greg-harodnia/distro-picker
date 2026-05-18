import type { Translations, Language } from '$lib/locales/types';
import enData from '$lib/locales/en.json';
import { base } from '$app/paths';

const translationCache: Partial<Record<Language, Translations>> = {
  en: enData as Translations,
};

const translationPathCache = new Map<string, string>();

async function loadLang(lang: Language): Promise<Translations> {
  if (typeof window === 'undefined') {
    return enData as Translations;
  }
  const url = `${base}/locales/${lang}.json`;
  const response = await fetch(url);
  if (!response.ok) {
    return enData as Translations;
  }
  return response.json() as Promise<Translations>;
}

export async function loadTranslation(lang: Language): Promise<Translations> {
  if (translationCache[lang]) return translationCache[lang]!;
  const translations = await loadLang(lang);
  translationCache[lang] = translations;
  translationPathCache.clear(); // is it needed?
  return translations;
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
