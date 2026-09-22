import type { Distro } from '../types';
import { validateDistrosArray, type ValidationResult } from './validation';

export interface DataLoadResult<T> {
	data: T | null;
	error: string | null;
	loading: boolean;
}

export async function loadDistros(): Promise<DataLoadResult<Distro[]>> {
	try {
		const distrosData = await import('$lib/distros.json');
		if (!distrosData?.default?.distros || !Array.isArray(distrosData.default.distros)) {
			throw new Error('Invalid distros data structure');
		}

		const validation: ValidationResult = validateDistrosArray(distrosData.default.distros);
		if (!validation.isValid) {
			const errorMessages = validation.errors.map(e => `${e.field}: ${e.message}`).join('; ');
			throw new Error(`Validation failed: ${errorMessages}`);
		}

		return {
			data: distrosData.default.distros,
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

export function sanitizeUrl(url: string): string {
	try {
		const parsed = new URL(url);
		// Only allow http and https protocols
		if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
			return '#';
		}
		return parsed.toString();
	} catch {
		return '#';
	}
}