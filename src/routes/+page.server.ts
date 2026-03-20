export async function load() {
	const screenshots: Record<string, string[]> = {};

	const modules = import.meta.glob('/static/screenshots/*/*', { as: 'url' });

	for (const path in modules) {
		const match = path.match(/\/screenshots\/([^/]+)\//);
		if (match) {
			const distroId = match[1];
			if (!screenshots[distroId]) {
				screenshots[distroId] = [];
			}
			screenshots[distroId].push(path.replace('/static', ''));
		}
	}

	return { screenshots };
}
