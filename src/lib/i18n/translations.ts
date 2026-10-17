import type { Translations, Language } from '$lib/locales/types';
import enData from '$lib/locales/en.json';

/**
 * English is bundled statically because it is both the default locale and the
 * fallback for every other one, so it is needed on every page — and having it
 * available synchronously is what lets non-JS crawlers see the right language
 * in the HTML.
 *
 * Other locales are loaded on demand: an English page never pays for `be.json`.
 * `loadTranslation()` must be awaited before the first render of a page in that
 * language (the root layout does this in its `load`), because `getTranslation`
 * — and therefore `$t` — is synchronous.
 */
const translationCache: Partial<Record<Language, Translations>> = {
	en: enData as Translations,
};

/** Locales that ship with the app but aren't bundled into the initial graph. */
const localeLoaders: Partial<Record<Language, () => Promise<{ default: unknown }>>> = {
	be: () => import('$lib/locales/be.json'),
};

const pending = new Map<Language, Promise<Translations>>();

const translationPathCache = new Map<string, string>();

/** Loads a locale into the cache (idempotent, and cheap for locales already there). */
export async function loadTranslation(lang: Language): Promise<Translations> {
	const cached = translationCache[lang];
	if (cached) return cached;

	const loader = localeLoaders[lang];
	if (!loader) return translationCache.en as Translations;

	let inflight = pending.get(lang);
	if (!inflight) {
		inflight = loader()
			.then((mod) => {
				const data = mod.default as Translations;
				translationCache[lang] = data;
				return data;
			})
			.catch((error) => {
				// A failed locale chunk (offline, transient network error) must not
				// reject `load` and take the whole route down. English is bundled,
				// so degrade to it and let a later navigation retry.
				console.error(`[i18n] failed to load "${lang}" translations; falling back to English`, error);
				return translationCache.en as Translations;
			})
			.finally(() => pending.delete(lang));
		pending.set(lang, inflight);
	}
	return inflight;
}

/** Fallback label for ids with no translation, e.g. "kde-plasma" -> "Kde Plasma". */
export function humanizeId(id: string): string {
	return id.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function getTranslation(lang: Language, path: string): string | undefined {
  const cacheKey = `${lang}:${path}`;
  const cached = translationPathCache.get(cacheKey);
  if (cached !== undefined) return cached;
  
  const translations = translationCache[lang];
  if (!translations) {
    // The locale hasn't been loaded yet. Return the English fallback but do
    // *not* cache it — a later lookup (after `loadTranslation` has run) must
    // resolve against the real translations instead of a stale fallback.
    return lang === 'en' ? undefined : getTranslation('en', path);
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
