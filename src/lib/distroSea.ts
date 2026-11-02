/**
 * DistroSea hosts a subset of the distros we list, under its own slugs. Only
 * entries present here get a "Try on DistroSea" badge; a distro missing from
 * the map has no online demo to link to.
 */
const DISTRO_SEA_IDS: Record<string, string> = {
	mint: 'linuxmint',
	fedora: 'fedora',
	kubuntu: 'kubuntu',
	tuxedo: 'tuxedoos',
	zorin: 'zorin',
	popos: 'popos',
	nobara: 'nobara',
	pikaos: 'pikaos',
	openSUSE: 'opensuse',
	endeavouros: 'endeavouros',
	cachyos: 'cachyos',
	bazzite: 'bazzite',
	lubuntu: 'lubuntu',
	antiX: 'antix',
};

/** Returns the DistroSea page for a distro id, or `undefined` if it isn't hosted there. */
export function getDistroSeaUrl(distroId: string): string | undefined {
	const id = DISTRO_SEA_IDS[distroId];
	return id ? `https://distrosea.com/select/${id}/` : undefined;
}
