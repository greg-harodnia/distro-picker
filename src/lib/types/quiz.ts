export type QuestionKey = `quiz.questions.${string}`;
export type ResultKey = `quiz.results.${string}`;

export interface QuizAnswer {
	text: QuestionKey;
	question?: QuizQuestion;
	result?: ResultKey;
}

export interface QuizQuestion {
	text: QuestionKey;
	answers: QuizAnswer[];
}

export interface QuizNode {
	question: QuizQuestion;
}

export interface QuickTestData {
	test: QuizNode[];
}
