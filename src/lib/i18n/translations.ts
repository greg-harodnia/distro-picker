import type { Translations } from '$lib/locales/types';
import enData from '$lib/locales/en.json';
import { base } from '$app/paths';

export type Language = 'en' | 'be' | 'uk' | 'pl' | 'ru' | 'zh' | 'ja' | 'vi' | 'ko' | 'th' | 'es' | 'pt' | 'tr' | 'de' | 'fr' | 'it' | 'id';

const translationCache: Partial<Record<Language, Translations>> = {
  en: enData as Translations,
};

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
  return translations;
}

export async function loadTranslations(langs: Language[]): Promise<void> {
  await Promise.all(langs.map(loadTranslation));
}

export function getTranslation(lang: Language, path: string): string | undefined {
  const translations = translationCache[lang];
  if (!translations) {
    return lang === 'en' ? undefined : getTranslation('en', path);
  }

  const keys = path.split('.');
  let result: any = translations;

  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = result[key];
    } else {
      return lang === 'en' ? undefined : getTranslation('en', path);
    }
  }

  return typeof result === 'string' ? result : undefined;
}
