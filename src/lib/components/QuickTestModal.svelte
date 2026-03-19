<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { quickTestData } from '$lib/data/quickTest';
	import type { QuizQuestion, QuizAnswer } from '$lib/types/quiz';
	import { locale, t } from '$lib/i18n/locale';
	import { getTranslation } from '$lib/i18n/translations';

	export let isOpen = false;

	const dispatch = createEventDispatcher();

	let currentQuestion: QuizQuestion | null = null;
	let currentPath: QuizAnswer[] = [];
	let result: string | null = null;
	let isComplete = false;

	const questionKeyMap: Record<string, string> = {
		'How would you like to use the distribution?': 'quiz.questions.howToUse',
		'Just a regular user': 'quiz.questions.regularUser',
		'I want my distro to be preconfigured for gaming / I want to use it on a handheld': 'quiz.questions.gaming',
		'I want to develop on it': 'quiz.questions.developer',
		"I'm a tech enthusiast who wants a distro that's as flexible and unbloated as possible. I want full control over my system, and I enjoy tweaking and using the terminal.": 'quiz.questions.enthusiast',
		'I want to recover my old PC with it': 'quiz.questions.recover',
		'Which layout do you prefer?': 'quiz.questions.whichLayout',
		'Windows-like': 'quiz.questions.windowsLike',
		'MacOS-like': 'quiz.questions.macosLike',
		'Do you want to be able to edit system files?': 'quiz.questions.canEditSystem',
		'Yes': 'quiz.questions.yes',
		"I don't care about it": 'quiz.questions.dontCare',
		'How old is your computer?': 'quiz.questions.howOld',
		'Not extremely old, but it feels sluggish': 'quiz.questions.sluggish',
		'It was produced before 2011': 'quiz.questions.before2011',
		'It is truly ancient (2004 or older)': 'quiz.questions.ancient',
	};

	const resultKeyMap: Record<string, string> = {
		'Linux Mint, Kubuntu, or Zorin OS—depending on which design you like more.': 'quiz.results.regularWindows',
		"Pop!_OS. If you would like to be able to easily switch between different layouts, go with Zorin OS.": 'quiz.results.regularMacos',
		"Nobara. With its mutable system, you'll be able to tweak system files and install any packages you want. If you're comfortable using the terminal, you can also go with CachyOS.": 'quiz.results.gamingYes',
		"Bazzite. The distribution is available for both PCs and handhelds. You can also go with SteamOS if it supports your handheld (it doesn't officially support PCs yet). CachyOS is the third option for those who enjoy using the terminal.": 'quiz.results.gamingNo',
		"Fedora is your ideal choice. It's both stable and offers up-to-date software. Plus, you can choose from various desktop environments to suit your preferences. That said, distros like Linux Mint, Kubuntu, Zorin OS, Pop!_OS, or CachyOS are also viable options.": 'quiz.results.developer',
		"Sounds like CachyOS was made for you. Or, if you want something even closer to barebones Arch, EndeavourOS is worth checking out.": 'quiz.results.enthusiast',
		'Linux Mint Xfce': 'quiz.results.oldSluggish',
		'Lubuntu': 'quiz.results.old2011',
		'AntiX': 'quiz.results.oldAncient',
	};

	function translateText(text: string): string {
		const key = questionKeyMap[text] || resultKeyMap[text];
		if (key) {
			return getTranslation($locale, key);
		}
		return text;
	}

	function translateQuestion(question: QuizQuestion): QuizQuestion {
		return {
			text: translateText(question.text),
			answers: question.answers.map(answer => {
				const translated: QuizAnswer = {
					text: translateText(answer.text),
				};
				if (answer.question) {
					translated.question = translateQuestion(answer.question);
				}
				if (answer.result) {
					translated.result = translateText(answer.result);
				}
				return translated;
			})
		};
	}

	$: if (isOpen) {
		startQuiz();
	}

	function startQuiz() {
		const quiz = quickTestData.test[0];
		if (quiz) {
			currentQuestion = translateQuestion(quiz.question);
			currentPath = [];
			result = null;
			isComplete = false;
		}
	}

	function selectAnswer(answer: QuizAnswer) {
		currentPath = [...currentPath, answer];

		if (answer.result) {
			result = translateText(answer.result);
			isComplete = true;
			currentQuestion = null;
		} else if (answer.question) {
			currentQuestion = translateQuestion(answer.question);
		}
	}

	function goBack() {
		if (currentPath.length > 0) {
			currentPath.pop();
			if (currentPath.length === 0) {
				startQuiz();
			} else {
				let target: QuizQuestion | null = translateQuestion(quickTestData.test[0].question);
				for (const answer of currentPath) {
					if (target) {
						const found: QuizAnswer | undefined = target.answers.find((a) => a.text === answer.text);
						if (found && found.question) {
							target = found.question;
						} else {
							target = null;
						}
					}
				}
				if (target) {
					currentQuestion = target;
					result = null;
					isComplete = false;
				}
			}
		}
	}

	function close() {
		dispatch('close');
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			close();
		}
	}

	function handleOverlayClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			close();
		}
	}

	onMount(() => {
		if (isOpen) {
			document.body.style.overflow = 'hidden';
		}
		return () => {
			document.body.style.overflow = '';
		};
	});

	$: if (isOpen) {
		document.body.style.overflow = 'hidden';
	} else {
		document.body.style.overflow = '';
	}
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
	<div
		class="modal-overlay"
		on:click={handleOverlayClick}
		on:keydown={handleKeydown}
		role="button"
		tabindex="0"
		transition:fade={{ duration: 150 }}
	>
		<div
			class="modal-content"
			role="dialog"
			aria-modal="true"
			aria-label={$t('quiz.title')}
			tabindex="-1"
		>
			<div class="modal-header">
				{#if !isComplete && currentPath.length > 0}
					<button class="back-btn" on:click={goBack} aria-label={$t('quiz.goBack')} type="button">
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<polyline points="15 18 9 12 15 6"></polyline>
						</svg>
					</button>
				{:else}
					<div class="spacer"></div>
				{/if}
				<h2>{$t('quiz.title')}</h2>
				<button class="close-btn" on:click={close} aria-label={$t('modal.close')} type="button">
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<line x1="18" y1="6" x2="6" y2="18"></line>
						<line x1="6" y1="6" x2="18" y2="18"></line>
					</svg>
				</button>
			</div>
			<div class="modal-body">
				{#if isComplete && result}
					<div class="result-container">
						<div class="result-icon">
							<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
								<polyline points="22 4 12 14.01 9 11.01"></polyline>
							</svg>
						</div>
						<h3>{$t('quiz.yourRecommendation')}</h3>
						<p class="result-text">{result}</p>
						<div class="result-actions">
							<button class="restart-btn" on:click={startQuiz} type="button">
								<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
									<polyline points="1 4 1 10 7 10"></polyline>
									<path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
								</svg>
								{$t('quiz.restartTest')}
							</button>
							<button class="close-result-btn" on:click={close} type="button">
								{$t('quiz.close')}
							</button>
						</div>
					</div>
				{:else if currentQuestion}
					<div class="question-container">
						<div class="progress-bar">
							<div class="progress" style="width: {Math.min(100, (currentPath.length + 1) * 20)}%"></div>
						</div>
						<p class="question-text">{currentQuestion.text}</p>
						<div class="answers-list">
							{#each currentQuestion.answers as answer, i}
								<button
									class="answer-btn"
									on:click={() => selectAnswer(answer)}
									type="button"
									style="animation-delay: {i * 50}ms"
								>
									<span class="answer-letter">{String.fromCharCode(65 + i)}</span>
									<span class="answer-text">{answer.text}</span>
								</button>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.7);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: var(--space-lg);
	}

	.modal-content {
		background: var(--color-surface);
		border: 2px solid var(--color-border);
		border-radius: var(--radius-lg);
		width: 100%;
		max-width: 600px;
		max-height: 80vh;
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-lg);
		border-bottom: 1px solid var(--color-border);
		flex-shrink: 0;
	}

	.modal-header h2 {
		font-size: var(--text-xl);
		color: var(--color-secondary);
		margin: 0;
		font-weight: var(--font-semibold);
		flex: 1;
		text-align: center;
	}

	.back-btn,
	.close-btn {
		background: none;
		border: none;
		color: var(--color-text-secondary);
		cursor: pointer;
		padding: var(--space-xs);
		border-radius: var(--radius-sm);
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all var(--transition-normal);
	}

	.back-btn:hover,
	.close-btn:hover {
		background: var(--color-background-secondary);
		color: var(--color-secondary);
	}

	.spacer {
		width: 36px;
	}

	.modal-body {
		padding: var(--space-xl);
		overflow-y: auto;
	}

	.question-container {
		display: flex;
		flex-direction: column;
		gap: var(--space-xl);
	}

	.progress-bar {
		height: 4px;
		background: var(--color-border);
		border-radius: var(--radius-full);
		overflow: hidden;
	}

	.progress {
		height: 100%;
		background: var(--color-secondary);
		border-radius: var(--radius-full);
		transition: width var(--transition-slow);
	}

	.question-text {
		font-size: var(--text-lg);
		color: var(--color-text);
		line-height: var(--line-height-relaxed);
		margin: 0;
	}

	.answers-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
	}

	.answer-btn {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		padding: var(--space-lg);
		background: var(--color-background-secondary);
		border: 2px solid var(--color-border);
		border-radius: var(--radius-md);
		cursor: pointer;
		transition: all var(--transition-normal);
		text-align: left;
		animation: fadeInUp 0.3s ease forwards;
		opacity: 0;
	}

	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.answer-btn:hover {
		border-color: var(--color-secondary);
		background: var(--color-background);
		transform: translateX(4px);
	}

	.answer-btn:focus {
		outline: none;
		border-color: var(--color-secondary);
		box-shadow: 0 0 0 3px rgba(44, 62, 80, 0.2);
	}

	.answer-letter {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		background: var(--color-secondary);
		color: var(--color-background);
		border-radius: var(--radius-sm);
		font-weight: var(--font-semibold);
		font-size: var(--text-sm);
		flex-shrink: 0;
	}

	.answer-text {
		color: var(--color-text);
		font-size: var(--text-base);
		line-height: var(--line-height-normal);
	}

	.result-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: var(--space-lg);
		padding: var(--space-xl) 0;
	}

	.result-icon {
		color: var(--color-success);
	}

	.result-container h3 {
		font-size: var(--text-xl);
		color: var(--color-secondary);
		margin: 0;
		font-weight: var(--font-semibold);
	}

	.result-text {
		font-size: var(--text-lg);
		color: var(--color-text);
		line-height: var(--line-height-relaxed);
		margin: 0;
		padding: var(--space-lg);
		background: var(--color-background-secondary);
		border-radius: var(--radius-md);
		border-left: 4px solid var(--color-secondary);
	}

	.result-actions {
		display: flex;
		gap: var(--space-md);
		margin-top: var(--space-md);
	}

	.restart-btn {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		padding: var(--space-md) var(--space-lg);
		background: transparent;
		border: 2px solid var(--color-secondary);
		border-radius: var(--radius-md);
		color: var(--color-secondary);
		font-size: var(--text-base);
		font-weight: var(--font-medium);
		cursor: pointer;
		transition: all var(--transition-normal);
	}

	.restart-btn:hover {
		background: var(--color-secondary);
		color: var(--color-background);
	}

	.close-result-btn {
		padding: var(--space-md) var(--space-lg);
		background: var(--color-secondary);
		border: 2px solid var(--color-secondary);
		border-radius: var(--radius-md);
		color: var(--color-background);
		font-size: var(--text-base);
		font-weight: var(--font-medium);
		cursor: pointer;
		transition: all var(--transition-normal);
	}

	.close-result-btn:hover {
		opacity: 0.9;
		transform: translateY(-1px);
	}

	@media (max-width: 640px) {
		.modal-body {
			padding: var(--space-lg);
		}

		.answer-btn {
			padding: var(--space-md);
		}

		.result-text {
			font-size: var(--text-base);
			padding: var(--space-md);
		}
	}
</style>
