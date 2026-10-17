/**
 * The image shown when a distro has no logo of its own. Kept in one place so
 * every logo fallback (grid cards, detail page, structured data, quiz results)
 * stays in sync.
 */
export const FALLBACK_LOGO = '/linux.webp';

/** Root-relative logo path for a distro, applying the shared fallback. */
export function logoPath(logo: string | undefined): string {
	return logo || FALLBACK_LOGO;
}
