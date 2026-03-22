

export interface ValidationError {
	field: string;
	message: string;
}

export interface ValidationResult {
	isValid: boolean;
	errors: ValidationError[];
}

function validateTag(tag: unknown): ValidationResult {
	const errors: ValidationError[] = [];

	if (!tag || typeof tag !== 'object') {
		errors.push({ field: 'tag', message: 'Tag must be an object' });
		return { isValid: false, errors };
	}

	const t = tag as Record<string, unknown>;

	if (!t['id'] || typeof t['id'] !== 'string') {
		errors.push({ field: 'id', message: 'Tag must have a valid string ID' });
	}

	if (!t['name'] || typeof t['name'] !== 'string') {
		errors.push({ field: 'name', message: 'Tag must have a valid string name' });
	}

	if (!t['description'] || typeof t['description'] !== 'string') {
		errors.push({ field: 'description', message: 'Tag must have a valid string description' });
	}

	return {
		isValid: errors.length === 0,
		errors
	};
}

function validateDistro(distro: unknown): ValidationResult {
	const errors: ValidationError[] = [];

	if (!distro || typeof distro !== 'object') {
		errors.push({ field: 'distro', message: 'Distro must be an object' });
		return { isValid: false, errors };
	}

	const d = distro as Record<string, unknown>;

	if (!d['id'] || typeof d['id'] !== 'string') {
		errors.push({ field: 'id', message: 'Distro must have a valid string ID' });
	}

	if (!d['name'] || typeof d['name'] !== 'string') {
		errors.push({ field: 'name', message: 'Distro must have a valid string name' });
	}

	if (!d['website'] || typeof d['website'] !== 'string') {
		errors.push({ field: 'website', message: 'Distro must have a valid string website' });
	}

	if (d['website'] && !isValidUrl(d['website'] as string)) {
		errors.push({ field: 'website', message: 'Website must be a valid URL' });
	}

	if (!Array.isArray(d['tag_ids'])) {
		errors.push({ field: 'tag_ids', message: 'Distro must have a valid array of tag IDs' });
	}

	if (typeof d['priority'] !== 'number' || d['priority'] < 0) {
		errors.push({ field: 'priority', message: 'Distro must have a valid positive priority number' });
	}

	return {
		isValid: errors.length === 0,
		errors
	};
}

function isValidUrl(url: string): boolean {
	try {
		const urlObj = new URL(url);
		return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
	} catch {
		return false;
	}
}

export function validateTagsArray(tags: any[]): ValidationResult {
	if (!Array.isArray(tags)) {
		return { isValid: false, errors: [{ field: 'tags', message: 'Tags must be an array' }] };
	}

	const allErrors: ValidationError[] = [];

	tags.forEach((tag, index) => {
		const result = validateTag(tag);
		if (!result.isValid) {
			result.errors.forEach(error => {
				allErrors.push({
					field: `tags[${index}].${error.field}`,
					message: error.message
				});
			});
		}
	});

	return {
		isValid: allErrors.length === 0,
		errors: allErrors
	};
}

export function validateDistrosArray(distros: any[]): ValidationResult {
	if (!Array.isArray(distros)) {
		return { isValid: false, errors: [{ field: 'distros', message: 'Distros must be an array' }] };
	}

	const allErrors: ValidationError[] = [];

	distros.forEach((distro, index) => {
		const result = validateDistro(distro);
		if (!result.isValid) {
			result.errors.forEach(error => {
				allErrors.push({
					field: `distros[${index}].${error.field}`,
					message: error.message
				});
			});
		}
	});

	return {
		isValid: allErrors.length === 0,
		errors: allErrors
	};
}