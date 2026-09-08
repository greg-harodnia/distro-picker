export interface Tag {
	id: string;
	description: string;
	group: string;
}

export interface Distro {
	disabled?: boolean;
	id: string;
	name: string;
	website: string;
	tag_ids: string[];
	logo?: string;
	best?: boolean;
	popular?: boolean;
	desktops?: string[];
	hasMoreDesktops?: boolean;
	beginner_friendly?: number;
	based_on?: string;
	likes?: number;
	userLiked?: boolean;
	userbase_number?: string;
	secure_boot?: boolean;
	swap_strategy?: 'swap-partition' | 'swap-file' | 'zram' | 'none' | 'zram-and-swap-file' | 'zram-and-swap-partition';
}