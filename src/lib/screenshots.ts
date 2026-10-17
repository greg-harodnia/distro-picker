/**
 * Screenshot discovery for the prerendered routes.
 *
 * `import.meta.glob` is resolved by Vite at build time, so this module is
 * server-only: it must not be imported from client code. Both the homepage
 * (which needs the whole map for the distro modal) and the distro detail page
 * (which needs one distro) read from the same precomputed map rather than each
 * re-globbing `static/screenshots`.
 */

const screenshotModules = import.meta.glob('/static/screenshots/*/*');

function groupByDistro(): Map<string, string[]> {
	const byDistro = new Map<string, string[]>();

	for (const path of Object.keys(screenshotModules)) {
		const match = path.match(/\/screenshots\/([^/]+)\//);
		if (!match) continue;

		const distroId = match[1];
		const list = byDistro.get(distroId);
		if (list) {
			list.push(path.replace('/static', ''));
		} else {
			byDistro.set(distroId, [path.replace('/static', '')]);
		}
	}

	return byDistro;
}

const byDistro = groupByDistro();

/** Screenshot paths (root-relative, no `base` prefix) for one distro. */
export function screenshotsForDistro(distroId: string): string[] {
	return byDistro.get(distroId) ?? [];
}

/** Every distro's screenshots, keyed by distro id. */
export function allScreenshots(): Record<string, string[]> {
	return Object.fromEntries(byDistro);
}
