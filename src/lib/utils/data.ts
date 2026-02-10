import type { Distro, Tag } from '../types';
import { validateTagsArray, validateDistrosArray, type ValidationResult } from './validation';

export interface DataLoadResult<T> {
	data: T | null;
	error: string | null;
	loading: boolean;
}

export async function loadTags(): Promise<DataLoadResult<Tag[]>> {
	try {
		const tagsData = await import('$lib/tags.json');
		if (!tagsData?.default?.tags || !Array.isArray(tagsData.default.tags)) {
			throw new Error('Invalid tags data structure');
		}

		const validation: ValidationResult = validateTagsArray(tagsData.default.tags);
		if (!validation.isValid) {
			const errorMessages = validation.errors.map(e => `${e.field}: ${e.message}`).join('; ');
			throw new Error(`Validation failed: ${errorMessages}`);
		}

		return {
			data: tagsData.default.tags,
			error: null,
			loading: false
		};
	} catch (error) {
		console.error('Failed to load tags:', error);
		return {
			data: null,
			error: error instanceof Error ? error.message : 'Failed to load tags',
			loading: false
		};
	}
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

export function getDistroIconPath(distroId: string): string {
	const iconMap: Record<string, string> = {
		'mint': '/mint.png',
		'zorin': '/zorin.png',
		'popos': '/popos.png',
		'aurora': '/aurora.svg',
		'fedora-kde': '/fedora.png',
		'fedora-workstation': '/fedora.png',
		'bluefin': '/bluefin.svg',
		'bazzite-kde': '/bazzite.svg',
		'bazzite-gnome': '/bazzite.svg',
		'cachyos': '/cachyos.png',
		'lubuntu': '/lubuntu.png',
		'linux-lite': '/linux-lite.png'
	};
	return iconMap[distroId] || '/ubuntu.png';
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