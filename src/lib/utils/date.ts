import type { Language } from '$lib/locales/types';

/**
 * Formats a blog `YYYY-MM-DD` date in the active locale. Parsed as UTC so the
 * displayed day never shifts with the viewer's timezone.
 */
export function formatDate(iso: string, lang: Language): string {
	const date = new Date(`${iso}T00:00:00Z`);
	return new Intl.DateTimeFormat(lang === 'be' ? 'be' : 'en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		timeZone: 'UTC',
	}).format(date);
}
