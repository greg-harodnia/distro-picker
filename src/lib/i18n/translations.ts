import { translations as en } from './translations/en';
import { translations as be } from './translations/be';

export type Language = 'en' | 'be';

export const translations: Record<Language, typeof en> = {
  en,
  be,
};

export function getTranslation(lang: Language, path: string): string | undefined {
  const keys = path.split('.');
  let result: any = translations[lang];
  
  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = result[key];
    } else {
      return undefined;
    }
  }
  
  return typeof result === 'string' ? result : undefined;
}