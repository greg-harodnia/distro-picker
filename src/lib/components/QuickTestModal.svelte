<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { fade, scale } from 'svelte/transition';
	import { quickTestData } from '$lib/data/quickTest';
	import type { QuizQuestion, QuizAnswer } from '$lib/types/quiz';

	export let isOpen = false;

	const dispatch = createEventDispatcher();

	let currentQuestion: QuizQuestion | null = null;
	let currentPath: QuizAnswer[] = [];
	let result: string | null = null;
	let isComplete = false;

	$: if (isOpen) {
		startQuiz();
	}

	function startQuiz() {
		const quiz = quickTestData.test[0];
		if (quiz) {
			currentQuestion = quiz.question;
			currentPath = [];
			result = null;
			isComplete = false;
		}
	}

	function selectAnswer(answer: QuizAnswer) {
		currentPath = [...currentPath, answer];

		if (answer.result) {
			result = answer.result;
			isComplete = true;
			currentQuestion = null;
		} else if (answer.question) {
			currentQuestion = answer.question;
		}
	}

	function goBack() {
		if (currentPath.length > 0) {
			currentPath.pop();
			if (currentPath.length === 0) {
				startQuiz();
			} else {
				let target: { question: QuizQuestion } | null = quickTestData.test[0];
				for (const answer of currentPath) {
					if (target) {
						const found: QuizAnswer | undefined = target.question.answers.find((a) => a.text === answer.text);
						target = found && 'question' in found ? { question: found.question } : null;
					}
				}
				if (target) {
					currentQuestion = target.question;
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
		transition:fade={{ duration: 200 }}
	>
		<div
			class="modal-content"
			role="dialog"
			aria-modal="true"
			aria-label="Quick Quiz"
			tabindex="-1"
			transition:scale={{ duration: 200, start: 0.95 }}
		>
			<div class="modal-header">
				{#if !isComplete && currentPath.length > 0}
					<button class="back-btn" on:click={goBack} aria-label="Go back" type="button">
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<polyline points="15 18 9 12 15 6"></polyline>
						</svg>
					</button>
				{:else}
					<div class="spacer"></div>
				{/if}
				<h2>Quick Quiz</h2>
				<button class="close-btn" on:click={close} aria-label="Close" type="button">
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<line x1="18" y1="6" x2="6" y2="18"></line>
						<line x1="6" y1="6" x2="18" y2="18"></line>
					</svg>
				</button>
			</div>
			<div class="modal-body">
				{#if isComplete && result}
					<div class="result-container" transition:fade={{ duration: 200 }}>
						<div class="result-icon">
							<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
								<polyline points="22 4 12 14.01 9 11.01"></polyline>
							</svg>
						</div>
						<h3>Your Recommendation</h3>
						<p class="result-text">{result}</p>
						<div class="result-actions">
							<button class="restart-btn" on:click={startQuiz} type="button">
								<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
									<polyline points="1 4 1 10 7 10"></polyline>
									<path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
								</svg>
								Restart Test
							</button>
							<button class="close-result-btn" on:click={close} type="button">
								Close
							</button>
						</div>
					</div>
				{:else if currentQuestion}
					<div class="question-container" transition:fade={{ duration: 200 }}>
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
