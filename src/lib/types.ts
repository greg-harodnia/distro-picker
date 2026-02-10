export interface Tag {
	id: string;
	name: string;
	description: string;
	color: string;
}

export interface Distro {
	id: string;
	name: string;
	website: string;
	tag_ids: string[];
	priority: number;
	description: string;
}