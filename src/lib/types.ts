export interface Tag {
	id: string;
	name: string;
	description: string;
	color: string;
	group: string;
}

export interface Distro {
	disabled?: boolean;
	id: string;
	name: string;
	website: string;
	tag_ids: string[];
	priority: number;
	best?: boolean;
	description: string;
	desktops?: string[];
	likes?: number;
	userLiked?: boolean;
}