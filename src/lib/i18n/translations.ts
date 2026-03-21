import { translations as en } from './translations/en';
import { translations as be } from './translations/be';
import { translations as uk } from './translations/uk';
import { translations as pl } from './translations/pl';
import { translations as ru } from './translations/ru';
import { translations as zh } from './translations/zh';
import { translations as ja } from './translations/ja';
import { translations as vi } from './translations/vi';
import { translations as ko } from './translations/ko';
import { translations as th } from './translations/th';
import { translations as es } from './translations/es';
import { translations as pt } from './translations/pt';
import { translations as tr } from './translations/tr';
import { translations as de } from './translations/de';
import { translations as fr } from './translations/fr';
import { translations as it } from './translations/it';
import { translations as id } from './translations/id';

export type Language = 'en' | 'be' | 'uk' | 'pl' | 'ru' | 'zh' | 'ja' | 'vi' | 'ko' | 'th' | 'es' | 'pt' | 'tr' | 'de' | 'fr' | 'it' | 'id';

export const translations: Record<Language, typeof en> = {
  en,
  be,
  uk,
  pl,
  ru,
  zh,
  ja,
  vi,
  ko,
  th,
  es,
  pt,
  tr,
  de,
  fr,
  it,
  id,
};

export function getTranslation(lang: Language, path: string): string | undefined {
  const keys = path.split('.');
  let result: any = translations[lang];

  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = result[key];
    } else {
      return lang === 'en' ? undefined : getTranslation('en', path);
    }
  }

  return typeof result === 'string' ? result : undefined;
}