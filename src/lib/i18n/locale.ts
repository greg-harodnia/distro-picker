import { writable, derived } from 'svelte/store';
import type { Language } from '$lib/locales/types';
import { getTranslation, loadTranslation } from './translations';

interface LanguageConfig {
  code: Language;
  name: string;
  browserLanguages: string[];
  timezones: string[];
}

const languageConfigs: LanguageConfig[] = [
  {
    code: 'en',
    name: 'English',
    browserLanguages: ['en'],
    timezones: [],
  },
  {
    code: 'be',
    name: 'Беларуская',
    browserLanguages: ['be', 'be-BY', 'bel', 'be-tarask'],
    timezones: ['Europe/Minsk'],
  },
];

function detectLanguage(): Language {
  if (typeof window === 'undefined') return 'en';

  const browserLang = navigator.language || (navigator as any).userLanguage;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  for (const config of languageConfigs) {
    const matchesBrowser = config.browserLanguages.some(
      lang => browserLang.toLowerCase().startsWith(lang.toLowerCase())
    );
    const matchesTimezone = config.timezones.includes(timezone);

    if (matchesBrowser || matchesTimezone) {
      return config.code;
    }
  }

  return 'en';
}

function createLocaleStore() {
  const { subscribe, set } = writable<Language>('en');

  return {
    subscribe,
    set: async (lang: Language) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('language', lang);
      }
      await loadTranslation(lang);
      set(lang);
    },
    init: async () => {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('language') as Language | null;
        let lang: Language = 'en';

        if (stored && languageConfigs.some(c => c.code === stored)) {
          lang = stored;
        } else {
          lang = detectLanguage();
          localStorage.setItem('language', lang);
        }

        await loadTranslation(lang);
        set(lang);
      }
    },
  };
}

export const locale = createLocaleStore();

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
