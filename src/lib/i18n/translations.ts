import { translations as en } from './translations/en';
import { translations as be } from './translations/be';
import { translations as es } from './translations/es';
import { translations as pt } from './translations/pt';
import { translations as tr } from './translations/tr';
import { translations as de } from './translations/de';
import { translations as fr } from './translations/fr';
import { translations as it } from './translations/it';
import { translations as id } from './translations/id';

export type Language = 'en' | 'be' | 'es' | 'pt' | 'tr' | 'de' | 'fr' | 'it' | 'id';

export const translations: Record<Language, typeof en> = {
  en,
  be,
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