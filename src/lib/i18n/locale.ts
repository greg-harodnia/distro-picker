import { writable, derived } from 'svelte/store';
import { getTranslation, type Language } from './translations';

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
  {
    code: 'es',
    name: 'Español 🤖',
    browserLanguages: ['es', 'es-ES', 'es-MX', 'es-AR', 'es-CO', 'es-CL'],
    timezones: [],
  },
  {
    code: 'pt',
    name: 'Português 🤖',
    browserLanguages: ['pt', 'pt-BR', 'pt-PT'],
    timezones: ['America/Sao_Paulo', 'Europe/Lisbon'],
  },
  {
    code: 'tr',
    name: 'Türkçe 🤖',
    browserLanguages: ['tr', 'tr-TR'],
    timezones: ['Europe/Istanbul'],
  },
  {
    code: 'de',
    name: 'Deutsch 🤖',
    browserLanguages: ['de', 'de-DE', 'de-AT', 'de-CH'],
    timezones: ['Europe/Berlin', 'Europe/Vienna', 'Europe/Zurich'],
  },
  {
    code: 'fr',
    name: 'Français 🤖',
    browserLanguages: ['fr', 'fr-FR', 'fr-CA', 'fr-BE', 'fr-CH'],
    timezones: ['Europe/Paris', 'America/Montreal', 'Europe/Brussels'],
  },
  {
    code: 'it',
    name: 'Italiano 🤖',
    browserLanguages: ['it', 'it-IT'],
    timezones: ['Europe/Rome'],
  },
  {
    code: 'id',
    name: 'Bahasa Indonesia 🤖',
    browserLanguages: ['id', 'id-ID'],
    timezones: ['Asia/Jakarta'],
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
  const { subscribe, set, update } = writable<Language>('en');

  return {
    subscribe,
    set: (lang: Language) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('language', lang);
      }
      set(lang);
    },
    toggle: () => {
      update(current => {
        const currentIndex = languageConfigs.findIndex(c => c.code === current);
        const nextIndex = (currentIndex + 1) % languageConfigs.length;
        const newLang = languageConfigs[nextIndex].code;
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('language', newLang);
        }
        return newLang;
      });
    },
    init: () => {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('language') as Language | null;
        if (stored && languageConfigs.some(c => c.code === stored)) {
          set(stored);
          return;
        }

        const detected = detectLanguage();
        set(detected);
        localStorage.setItem('language', detected);
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
