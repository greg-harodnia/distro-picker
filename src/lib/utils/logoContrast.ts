import type { Action } from 'svelte/action';

/**
 * A few logos are one-colour silhouettes that dissolve into the page — black
 * Tux on the near-black ink theme, a white mark on the paper theme. Their
 * exact inverse is their own dark-mode version, so a `filter: invert(1)`
 * (only in the theme that would swallow them) is all they need.
 *
 * Whether a logo qualifies is decided from its own pixels at runtime and
 * cached per path — no per-distro data to keep in sync.
 */

const SAMPLE = 48; // analysis resolution — plenty for a 56–96px logo
const SILHOUETTE_SHARE = 0.95; // one colour this pure = safe to invert exactly
const MAX_CHROMA = 16; // channel spread above which a pixel counts as coloured

const LUM_BLACK = relativeLuminance([32, 32, 32]); // near-pure black only
const LUM_WHITE = relativeLuminance([232, 232, 232]); // near-pure white only

const toneCache = new Map<string, string>();

function relativeLuminance([r, g, b]: number[]): number {
	const channel = (c: number) => {
		const s = c / 255;
		return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
	};
	return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** `dark` / `light` for a one-colour silhouette, `null` for anything else. */
function silhouetteTone(img: HTMLImageElement): 'light' | 'dark' | null {
	const canvas = document.createElement('canvas');
	canvas.width = SAMPLE;
	canvas.height = SAMPLE;
	const ctx = canvas.getContext('2d', { willReadFrequently: true });
	if (!ctx) return null;

	let pixels: number[][];
	try {
		ctx.drawImage(img, 0, 0, SAMPLE, SAMPLE);
		const { data } = ctx.getImageData(0, 0, SAMPLE, SAMPLE);
		pixels = [];
		for (let i = 0; i < data.length; i += 4) {
			if (data[i + 3] < 128) continue; // transparent — the page shows through
			pixels.push([data[i], data[i + 1], data[i + 2]]);
		}
	} catch {
		return null; // cross-origin canvas: leave the logo alone
	}
	if (pixels.length === 0) return null;

	const share = (test: (pixel: number[]) => boolean) =>
		pixels.filter(test).length / pixels.length;
	const coloured = share(([r, g, b]) => Math.max(r, g, b) - Math.min(r, g, b) > MAX_CHROMA);
	if (coloured > 1 - SILHOUETTE_SHARE) return null;
	if (share((p) => relativeLuminance(p) <= LUM_BLACK) >= SILHOUETTE_SHARE) return 'dark';
	if (share((p) => relativeLuminance(p) >= LUM_WHITE) >= SILHOUETTE_SHARE) return 'light';
	return null;
}

/** The flip class this loaded logo needs, cached per path. */
function flipClass(path: string, img: HTMLImageElement): string | null {
	const cached = toneCache.get(path);
	if (cached !== undefined) return cached || null;

	const tone = silhouetteTone(img);
	const fix = tone ? `logo-flip--${tone}` : '';
	toneCache.set(path, fix);
	return fix || null;
}

/**
 * Marks a one-colour silhouette so it can be inverted in the theme that would
 * swallow it. The class only ever adds a filter, so nothing shifts in layout.
 */
export const logoContrast: Action<HTMLImageElement, string | undefined> = (img, path) => {
	const apply = () => {
		if (!path || !img.naturalWidth) return;
		const fix = flipClass(path, img);
		if (fix) img.classList.add(fix);
	};

	// `complete` is also true for an image that has no src yet (the grid's
	// lazy loader sets it later), so only treat it as done once it has pixels.
	if (img.complete && img.naturalWidth) apply();
	else img.addEventListener('load', apply);

	return {
		destroy: () => img.removeEventListener('load', apply),
	};
};
