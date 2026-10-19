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

/**
 * Single-colour silhouettes, keyed by the path `logoPath` returns: black Tux
 * and the SteamOS circle dissolve into the ink theme, and their exact inverse
 * is that logo's own dark-mode version — `.logo-flip--*` in app.css inverts
 * them, but only in the theme that would swallow them.
 *
 * The tone is decided once, from the pixels, rather than sampled at runtime:
 * the runtime version ran after hydration, i.e. after the logo had already
 * painted from the server-rendered markup, so it flashed un-inverted first.
 *
 * To classify another logo: rasterise it at 48×48 — stretched to exactly that
 * size, the way the browser's `drawImage` fills its analysis canvas (SVGs
 * rendered at that size, not downscaled from their natural size) — and count
 * pixels with alpha ≥ 128. Pure black (`LUM ≤ 32`) on ≥95% of them is `dark`,
 * pure white (`LUM ≥ 232`) on ≥95% is `light`, and more than 5% coloured
 * pixels disqualifies a logo either way.
 */
const FLIPPED: Record<string, 'dark' | 'light'> = {
	[FALLBACK_LOGO]: 'dark', // Tux
	'/steamos.webp': 'dark',
	'/tuxedo.svg': 'dark',
};

/** The `logo-flip--*` class for a logo, or `''` when it reads on both themes. */
export function logoFlip(logo: string | undefined): string {
	const tone = FLIPPED[logoPath(logo)];
	return tone ? `logo-flip--${tone}` : '';
}
