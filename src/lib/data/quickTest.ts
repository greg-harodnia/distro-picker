import type { QuickTestData } from '$lib/types/quiz';

export const quickTestData: QuickTestData = {
	test: [
		{
			question: {
				text: 'quiz.questions.howToUse',
				answers: [
					{
						text: 'quiz.questions.lazy',
						result: 'quiz.results.lazy',
					},
					{
						text: 'quiz.questions.regularUser',
						question: {
							text: 'quiz.questions.whichLayout',
							answers: [
								{
									text: 'quiz.questions.windowsLike',
									result: 'quiz.results.regularWindows',
								},
								{
									text: 'quiz.questions.macosLike',
									result: 'quiz.results.regularMacos',
								},
							],
						},
					},
					{
						text: 'quiz.questions.gaming',
						question: {
							text: 'quiz.questions.canEditSystem',
							answers: [
								{
									text: 'quiz.questions.yes',
									result: 'quiz.results.gamingYes',
								},
								{
									text: 'quiz.questions.dontCare',
									result: 'quiz.results.gamingNo',
								},
							],
						},
					},
					{
						text: 'quiz.questions.developer',
						result: 'quiz.results.developer',
					},
					{
						text: 'quiz.questions.enthusiast',
						result: 'quiz.results.enthusiast',
					},
					{
						text: 'quiz.questions.recover',
						question: {
							text: 'quiz.questions.howOld',
							answers: [
								{
									text: 'quiz.questions.sluggish',
									result: 'quiz.results.oldSluggish',
								},
								{
									text: 'quiz.questions.before2011',
									result: 'quiz.results.old2011',
								},
								{
									text: 'quiz.questions.ancient',
									result: 'quiz.results.oldAncient',
								},
							],
						},
					},
					{
						text: 'quiz.questions.appleSilicon',
						result: 'quiz.results.appleSilicon'
					},
				],
			},
		},
	],
};
