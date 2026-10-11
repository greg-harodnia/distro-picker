export interface Tag {
	id: string;
	description: string;
}

/**
 * Homepage grouping. Every distro belongs to exactly one tier, rendered as its
 * own labelled (collapsible) section: `best` is expanded first, then `other`,
 * then `less-popular`.
 */
export type DistroTier = 'best' | 'other' | 'less-popular';

export interface Distro {
	disabled?: boolean;
	id: string;
	name: string;
	website: string;
	tag_ids: string[];
	logo?: string;
	tier?: DistroTier;
	popular?: boolean;
	in_development?: boolean;
	desktops?: string[];
	hasMoreDesktops?: boolean;
	ease_of_use?: number;
	based_on?: string;
	likes?: number;
	userLiked?: boolean;
	userbase_number?: string;
	secure_boot?: boolean;
	swap_strategy?: 'swap-partition' | 'swap-file' | 'zram' | 'none' | 'zram-and-swap-file' | 'zram-and-swap-partition';
}