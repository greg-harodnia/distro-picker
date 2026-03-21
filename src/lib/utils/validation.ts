

export interface ValidationError {
	field: string;
	message: string;
}

export interface ValidationResult {
	isValid: boolean;
	errors: ValidationError[];
}

export function validateTag(tag: any): ValidationResult {
	const errors: ValidationError[] = [];

	if (!tag || typeof tag !== 'object') {
		errors.push({ field: 'tag', message: 'Tag must be an object' });
		return { isValid: false, errors };
	}

	if (!tag.id || typeof tag.id !== 'string') {
		errors.push({ field: 'id', message: 'Tag must have a valid string ID' });
	}

	if (!tag.name || typeof tag.name !== 'string') {
		errors.push({ field: 'name', message: 'Tag must have a valid string name' });
	}

	if (!tag.description || typeof tag.description !== 'string') {
		errors.push({ field: 'description', message: 'Tag must have a valid string description' });
	}

	return {
		isValid: errors.length === 0,
		errors
	};
}

export function validateDistro(distro: any): ValidationResult {
	const errors: ValidationError[] = [];

	if (!distro || typeof distro !== 'object') {
		errors.push({ field: 'distro', message: 'Distro must be an object' });
		return { isValid: false, errors };
	}

	if (!distro.id || typeof distro.id !== 'string') {
		errors.push({ field: 'id', message: 'Distro must have a valid string ID' });
	}

	if (!distro.name || typeof distro.name !== 'string') {
		errors.push({ field: 'name', message: 'Distro must have a valid string name' });
	}

	if (!distro.website || typeof distro.website !== 'string') {
		errors.push({ field: 'website', message: 'Distro must have a valid string website' });
	}

	// Validate URL format
	if (distro.website && !isValidUrl(distro.website)) {
		errors.push({ field: 'website', message: 'Website must be a valid URL' });
	}

	if (!Array.isArray(distro.tag_ids)) {
		errors.push({ field: 'tag_ids', message: 'Distro must have a valid array of tag IDs' });
	}

	if (typeof distro.priority !== 'number' || distro.priority < 0) {
		errors.push({ field: 'priority', message: 'Distro must have a valid positive priority number' });
	}

	return {
		isValid: errors.length === 0,
		errors
	};
}

export function isValidUrl(url: string): boolean {
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