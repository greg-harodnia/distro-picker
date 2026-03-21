import { translations as en } from '$lib/locales/en';
import { base } from '$app/paths';

export type Language = 'en' | 'be' | 'uk' | 'pl' | 'ru' | 'zh' | 'ja' | 'vi' | 'ko' | 'th' | 'es' | 'pt' | 'tr' | 'de' | 'fr' | 'it' | 'id';

type Translations = typeof en;

const translationCache: Partial<Record<Language, Translations>> = {
  en,
};

async function loadLang(lang: Language): Promise<Translations> {
  const url = `${base}/locales/${lang}.json`;
  const response = await fetch(url);
  if (!response.ok) {
    console.error(`Failed to load translation ${lang} from ${url}: ${response.status}`);
    return en;
  }
  const data = await response.json() as Translations;
  return data;
}

export async function loadTranslation(lang: Language): Promise<void> {
  if (lang === 'en' || translationCache[lang]) return;
  translationCache[lang] = await loadLang(lang);
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

export const translations = { en };
