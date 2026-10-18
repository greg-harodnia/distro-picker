import en from './en.json';

export type Language = 'en' | 'be' | 'ru' | 'es' | 'pt' | 'de' | 'fr' | 'tr';

/**
 * Inferred from the canonical English copy, so it cannot drift from the data:
 * adding or removing a key in `en.json` is reflected here automatically. The
 * hand-written structural version of this type had already lost `modals.contact`
 * before this inference replaced it — the exact failure this removes.
 */
export type Translations = typeof en;
