export interface ValidationError {
	field: string;
	message: string;
}

export interface ValidationResult {
	isValid: boolean;
	errors: ValidationError[];
}

function isValidUrl(url: string): boolean {
	try {
		const urlObj = new URL(url);
		return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
	} catch {
		return false;
	}
}

export function validateDistrosArray(distros: unknown[]): ValidationResult {
	if (!Array.isArray(distros)) {
		return { isValid: false, errors: [{ field: 'distros', message: 'Distros must be an array' }] };
	}

	const errors: ValidationError[] = [];

	distros.forEach((distro, index) => {
		const d = distro as Record<string, unknown>;
		if (!d || typeof d !== 'object') {
			errors.push({ field: `distros[${index}]`, message: 'Distro must be an object' });
			return;
		}
		if (!d['id'] || typeof d['id'] !== 'string') {
			errors.push({ field: `distros[${index}].id`, message: 'Distro must have a valid string ID' });
		}
		if (!d['name'] || typeof d['name'] !== 'string') {
			errors.push({ field: `distros[${index}].name`, message: 'Distro must have a valid string name' });
		}
		if (!d['website'] || typeof d['website'] !== 'string') {
			errors.push({ field: `distros[${index}].website`, message: 'Distro must have a valid string website' });
		} else if (!isValidUrl(d['website'] as string)) {
			errors.push({ field: `distros[${index}].website`, message: 'Website must be a valid URL' });
		}
		if (!Array.isArray(d['tag_ids'])) {
			errors.push({ field: `distros[${index}].tag_ids`, message: 'Distro must have a valid array of tag IDs' });
		}
	});

	return { isValid: errors.length === 0, errors };
}