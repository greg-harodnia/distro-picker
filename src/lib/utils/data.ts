import type { Distro } from '../types';
import { distros } from '../distros';
import { validateDistrosArray, isValidUrl, type ValidationResult } from './validation';

export interface DataLoadResult<T> {
	data: T | null;
	error: string | null;
	loading: boolean;
}

export async function loadDistros(): Promise<DataLoadResult<Distro[]>> {
	try {
		if (!Array.isArray(distros)) {
			throw new Error('Invalid distros data structure');
		}

		const validation: ValidationResult = validateDistrosArray(distros);
		if (!validation.isValid) {
			const errorMessages = validation.errors.map(e => `${e.field}: ${e.message}`).join('; ');
			throw new Error(`Validation failed: ${errorMessages}`);
		}

		return {
			data: distros,
			error: null,
			loading: false
		};
	} catch (error) {
		console.error('Failed to load distros:', error);
		return {
			data: null,
			error: error instanceof Error ? error.message : 'Failed to load distros',
			loading: false
		};
	}
}

/** Returns a normalized `http(s)` URL, or `'#'` when the input isn't one. */
export function sanitizeUrl(url: string): string {
	return isValidUrl(url) ? new URL(url).toString() : '#';
}
