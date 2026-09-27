export interface QuizAnswer {
	text: string;
	question?: QuizQuestion;
	/**
	 * Prose shown as the recommendation. May name a distro (or a spin like
	 * "Linux Mint Xfce") that has no page of its own.
	 *
	 * The distros.json ids this answer links to live in one locale-independent
	 * map — see `$lib/quiz-results` — so the list is never duplicated per
	 * language.
	 */
	result?: string;
}

export interface QuizQuestion {
	text: string;
	answers: QuizAnswer[];
}


