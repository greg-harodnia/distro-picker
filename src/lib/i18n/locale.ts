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
    code: 'uk',
    name: 'Українська',
    browserLanguages: ['uk', 'uk-UA'],
    timezones: ['Europe/Kiev', 'Europe/Kyiv'],
  },
  {
    code: 'pl',
    name: 'Polski',
    browserLanguages: ['pl', 'pl-PL'],
    timezones: ['Europe/Warsaw'],
  },
  {
    code: 'ru',
    name: 'Русский',
    browserLanguages: ['ru', 'ru-RU'],
    timezones: ['Europe/Moscow', 'Europe/Kaliningrad', 'Europe/Volgograd', 'Europe/Samara', 'Asia/Yekaterinburg', 'Asia/Omsk'],
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
    code: 'tr',
    name: 'Türkçe 🤖',
    browserLanguages: ['tr', 'tr-TR'],
    timezones: ['Europe/Istanbul'],
  },
  {
    code: 'vi',
    name: 'Tiếng Việt 🤖',
    browserLanguages: ['vi', 'vi-VN'],
    timezones: ['Asia/Ho_Chi_Minh'],
  },
  {
    code: 'id',
    name: 'Bahasa Indonesia 🤖',
    browserLanguages: ['id', 'id-ID'],
    timezones: ['Asia/Jakarta'],
  },
  {
    code: 'th',
    name: 'ไทย 🤖',
    browserLanguages: ['th', 'th-TH'],
    timezones: ['Asia/Bangkok'],
  },
  {
    code: 'zh',
    name: '简体中文 🤖',
    browserLanguages: ['zh', 'zh-CN', 'zh-SG'],
    timezones: ['Asia/Shanghai', 'Asia/Harbin', 'Asia/Urumqi'],
  },
  {
    code: 'ja',
    name: '日本語 🤖',
    browserLanguages: ['ja', 'ja-JP'],
    timezones: ['Asia/Tokyo'],
  },
  {
    code: 'ko',
    name: '한국어 🤖',
    browserLanguages: ['ko', 'ko-KR'],
    timezones: ['Asia/Seoul'],
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
