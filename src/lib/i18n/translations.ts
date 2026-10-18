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
	en: enData,
};

/** Locales that ship with the app but aren't bundled into the initial graph. */
const localeLoaders: Partial<Record<Language, () => Promise<{ default: Translations }>>> = {
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
				const data = mod.default;
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

/**
 * Walks a dotted path against a loaded locale, falling back to English when
 * the key (or the whole locale) is missing. Shared by the string and
 * structured lookups below so the traversal exists once.
 */
function resolvePath(lang: Language, path: string): unknown {
	const translations = translationCache[lang];
	if (!translations) return lang === 'en' ? undefined : resolvePath('en', path);

	let result: unknown = translations;
	for (const key of path.split('.')) {
		if (result && typeof result === 'object' && key in result) {
			result = (result as Record<string, unknown>)[key];
		} else {
			return lang === 'en' ? undefined : resolvePath('en', path);
		}
	}
	return result;
}

/**
 * The translated string at `path`, falling back to English when `lang` has no
 * entry for it — the fallback is performed by `resolvePath` (missing key or
 * unloaded locale), so callers must not repeat it as
 * `getTranslation(lang, p) || getTranslation('en', p)`: that second lookup can
 * only ever redo the English fallback that already happened.
 *
 * `undefined` when the path resolves to a non-string, or is missing in English
 * too.
 */
export function getTranslation(lang: Language, path: string): string | undefined {
	const cacheKey = `${lang}:${path}`;
	const cached = translationPathCache.get(cacheKey);
	if (cached !== undefined) return cached;

	// The locale hasn't been loaded yet. Return the English fallback but do
	// *not* cache it — a later lookup (after `loadTranslation` has run) must
	// resolve against the real translations instead of a stale fallback.
	if (!translationCache[lang]) {
		return lang === 'en' ? undefined : getTranslation('en', path);
	}

	const value = resolvePath(lang, path);
	const result = typeof value === 'string' ? value : undefined;
	translationPathCache.set(cacheKey, result || '');
	return result;
}

export function getNestedValue<T = unknown>(lang: Language, path: string): T | undefined {
	return resolvePath(lang, path) as T | undefined;
}
