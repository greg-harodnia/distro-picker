<script lang="ts">
	import { quickTestData } from '$lib/data/quickTest';
	import type { QuizQuestion, QuizAnswer, ResultKey } from '$lib/types/quiz';
	import { t } from '$lib/i18n/locale';
	import Modal from './Modal.svelte';

	interface Props {
		onclose?: () => void;
	}
	let { onclose = () => {} }: Props = $props();

	let currentPath: QuizAnswer[] = $state([]);
	let resultKey: ResultKey | null = $state(null);
	let isComplete = $state(false);

	function getCurrentQuestion(): QuizQuestion {
		let question = quickTestData.test[0].question;
		for (const answer of currentPath) {
			if (answer.question) {
				question = answer.question;
			} else {
				return question;
			}
		}
		return question;
	}

	function startQuiz() {
		currentPath = [];
		resultKey = null;
		isComplete = false;
	}

	startQuiz();

	function selectAnswer(answer: QuizAnswer) {
		currentPath = [...currentPath, answer];

		if (answer.result) {
			resultKey = answer.result;
			isComplete = true;
		}
	}

	function goBack() {
		if (currentPath.length > 0) {
			currentPath.pop();
			resultKey = null;
			isComplete = false;
		}
	}
</script>

<Modal {onclose} ariaLabel={$t('quiz.title') || ''}>
	{#snippet header()}
		{#if !isComplete && currentPath.length > 0}
			<button class="back-btn" onclick={goBack} aria-label={$t('quiz.goBack')} type="button">
				<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<polyline points="15 18 9 12 15 6"></polyline>
				</svg>
			</button>
		{:else}
			<div class="spacer"></div>
		{/if}
		<h2 class="modal-title">{$t('quiz.title')}</h2>
	{/snippet}

	{#if isComplete && resultKey}
		<div class="result-container">
			<div class="result-icon">
				<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
					<polyline points="22 4 12 14.01 9 11.01"></polyline>
				</svg>
			</div>
			<h3>{$t('quiz.yourRecommendation')}</h3>
			<p class="result-text">{$t(resultKey)}</p>
			<div class="result-actions">
				<button class="btn-outline restart-btn" onclick={startQuiz} type="button">
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<polyline points="1 4 1 10 7 10"></polyline>
						<path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
					</svg>
					{$t('quiz.restartTest')}
				</button>
				<button class="btn-primary" onclick={onclose} type="button">
					{$t('quiz.close')}
				</button>
			</div>
		</div>
	{:else}
		{@const currentQuestion = getCurrentQuestion()}
		<div class="question-container">
			<div class="progress-bar">
				<div class="progress" style="width: {Math.min(100, (currentPath.length + 1) * 100 / 3)}%"></div>
			</div>
			<p class="question-text">{$t(currentQuestion.text)}</p>
			<div class="answers-list">
			{#each currentQuestion.answers as answer, i (answer.text)}
				<button
					class="answer-btn"
					onclick={() => selectAnswer(answer)}
					type="button"
					style="animation-delay: {i * 50}ms"
				>
					<span class="answer-letter">{String.fromCharCode(65 + i)}</span>
					<span class="answer-text">{$t(answer.text)}</span>
				</button>
			{/each}
			</div>
		</div>
	{/if}
</Modal>

<style>
	.back-btn {
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

	.back-btn:hover {
		background: var(--color-background-secondary);
		color: var(--color-secondary);
	}

	.spacer {
		width: 36px;
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

	@media (max-width: 640px) {
		.answer-btn {
			padding: var(--space-md);
		}

		.result-text {
			font-size: var(--text-base);
			padding: var(--space-md);
		}
	}
</style>
