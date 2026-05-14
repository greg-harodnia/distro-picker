export interface QuizAnswer {
	text: string;
	question?: QuizQuestion;
	result?: string;
}

export interface QuizQuestion {
	text: string;
	answers: QuizAnswer[];
}


