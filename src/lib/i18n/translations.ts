import { translations as en } from './translations/en';

export type Language = 'en' | 'be' | 'uk' | 'pl' | 'ru' | 'zh' | 'ja' | 'vi' | 'ko' | 'th' | 'es' | 'pt' | 'tr' | 'de' | 'fr' | 'it' | 'id';

const translationModules: Record<string, () => Promise<{ translations: typeof en }>> = {
  be: () => import('./translations/be'),
  uk: () => import('./translations/uk'),
  pl: () => import('./translations/pl'),
  ru: () => import('./translations/ru'),
  zh: () => import('./translations/zh'),
  ja: () => import('./translations/ja'),
  vi: () => import('./translations/vi'),
  ko: () => import('./translations/ko'),
  th: () => import('./translations/th'),
  es: () => import('./translations/es'),
  pt: () => import('./translations/pt'),
  tr: () => import('./translations/tr'),
  de: () => import('./translations/de'),
  fr: () => import('./translations/fr'),
  it: () => import('./translations/it'),
  id: () => import('./translations/id'),
};

const translationCache: Partial<Record<Language, typeof en>> = {
  en,
};

export async function loadTranslation(lang: Language): Promise<void> {
  if (lang === 'en' || translationCache[lang]) return;

  const loader = translationModules[lang];
  if (loader) {
    const module = await loader();
    translationCache[lang] = module.translations;
  }
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
