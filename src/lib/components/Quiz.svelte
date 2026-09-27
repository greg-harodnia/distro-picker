<script lang="ts">
	import type { Snippet } from 'svelte';
	import { get } from 'svelte/store';
	import type { Language } from '$lib/locales/types';
	import type { QuizQuestion, QuizAnswer } from '$lib/types/quiz';
	import type { Distro } from '$lib/types';
	import { locale, t, localePath } from '$lib/i18n/locale';
	import { getNestedValue } from '$lib/i18n/translations';
	import { quizResultsFor, quizResultKey } from '$lib/quiz-results';
	import { distros as distroStore, distroActions } from '$lib/stores';
	import Confetti from '$lib/components/Confetti.svelte';
	import distrosData from '$lib/distros.json';

	/**
	 * Read-only view of the quiz state, handed to `onchange` and the `footer`
	 * snippet so a host (the quick-test modal) can render back/restart in its
	 * own chrome rather than using the inline controls.
	 */
	export interface QuizApi {
		readonly isComplete: boolean;
		readonly canGoBack: boolean;
		readonly resultDistros: readonly string[];
		goBack: () => void;
		restart: () => void;
	}

	interface Props {
		/**
		 * Called with the quiz state whenever it changes. The quick-test modal
		 * uses it to drive its own chrome — there the back arrow sits beside the
		 * title and restart lives in the modal footer. Setting this means the
		 * host owns those controls, so the inline back/restart buttons are
		 * suppressed.
		 */
		onchange?: ((api: QuizApi) => void) | undefined;
		footer?: Snippet<[QuizApi]> | undefined;
	}

	let { onchange, footer }: Props = $props();

	const byId = new Map(distrosData.distros.map((d) => [d.id, d]));

	let rootQuestion = $derived(getNestedValue<QuizQuestion>($locale, 'modals.quiz.question')!);

	let currentPath: QuizAnswer[] = $state([]);
	// Index of each picked answer inside its own `answers` array — the key into
	// QUIZ_RESULTS. Parallel to `currentPath`; both are pushed/popped together.
	let pathIndices: number[] = $state([]);
	let resultText: string | null = $state(null);
	let resultDistros: string[] = $state([]);
	let isComplete = $state(false);

	let currentQuestion = $derived.by(() => {
		let q = rootQuestion;
		for (const answer of currentPath) {
			if (answer.question) {
				q = answer.question;
			} else {
				return q;
			}
		}
		return q;
	});

	function startQuiz() {
		currentPath = [];
		pathIndices = [];
		resultText = null;
		resultDistros = [];
		isComplete = false;
	}

	startQuiz();

	function selectAnswer(answer: QuizAnswer, index: number) {
		currentPath = [...currentPath, answer];
		pathIndices = [...pathIndices, index];

		if (answer.result) {
			resultText = answer.result;
			// The recommended ids live in one locale-independent map, so the
			// list can't drift between languages; only ids that exist in
			// distros.json get a link (the prose may name a spin with no page).
			const recommended = quizResultsFor(pathIndices);
			if (!recommended && import.meta.env.DEV) {
				console.warn(`quiz-results: no entry for path "${quizResultKey(pathIndices)}"`);
			}
			resultDistros = [...(recommended ?? [])].filter((id) => byId.has(id));
			isComplete = true;
		}
	}

	/**
	 * Result links are a real `<a href>` — crawlable and middle-click /
	 * ctrl-click friendly — but a plain click opens the distro popup over the
	 * quiz instead of navigating away, so the recommendation stays on screen
	 * behind it. Same pattern as the grid cards.
	 */
	function openResult(e: MouseEvent, id: string) {
		const isModified =
			e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey;
		if (isModified) return; // let the browser follow the href
		e.preventDefault();
		// Prefer the hydrated copy from the store (likes / liked state), fall
		// back to the raw distros.json entry if the store isn't populated.
		const distro =
			get(distroStore).find((d) => d.id === id) ?? (byId.get(id) as Distro | undefined);
		if (distro) distroActions.select(distro);
	}

	function goBack() {
		if (currentPath.length > 0) {
			currentPath.pop();
			pathIndices.pop();
			resultText = null;
			resultDistros = [];
			isComplete = false;
		}
	}

	// `currentPath` holds answer objects taken from the *active* locale's data,
	// so a language switch (a client-side nav that keeps this component alive)
	// would leave the trail pointing into the previous language's questions —
	// the quiz would keep rendering English. Restart instead: the picked answers
	// only mean something against the copy they were picked from.
	// Plain (non-reactive) so the effect below only tracks `$locale`.
	let pathLocale: Language | undefined = $locale;

	$effect(() => {
		const lang = $locale;
		if (pathLocale !== lang) {
			pathLocale = lang;
			startQuiz();
		}
	});

	let api: QuizApi = {
		get isComplete() {
			return isComplete;
		},
		get canGoBack() {
			return !isComplete && currentPath.length > 0;
		},
		get resultDistros() {
			return resultDistros;
		},
		goBack,
		restart: startQuiz
	};

	$effect(() => {
		onchange?.(api);
	});
</script>

{#if isComplete && resultText}
	<div class="result-container">
		<Confetti />
		<div class="result-heading">
			<div class="result-icon">
				<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
					<polyline points="22 4 12 14.01 9 11.01"></polyline>
				</svg>
			</div>
			<h3>{$t('modals.quiz.yourRecommendation')}</h3>
		</div>

		{#if resultDistros.length > 0}
			<ul class="result-links">
				{#each resultDistros as id (id)}
					{@const distro = byId.get(id)}
					{#if distro}
						<li>
							<a class="result-link" href={localePath(`/distro/${id}`)} onclick={(e) => openResult(e, id)}>
								<img class="result-logo" src={distro.logo} alt="" width="24" height="24" loading="lazy" />
								<span>{distro.name}</span>
							</a>
						</li>
					{/if}
				{/each}
			</ul>
		{/if}

		<p class="result-text">{resultText}</p>

		{#if footer}
			<div class="result-actions">{@render footer(api)}</div>
		{:else if !onchange}
			<div class="result-actions">
				<button class="btn-outline restart-btn" onclick={startQuiz} type="button">
					{@render restartIcon()}
					{$t('modals.quiz.restartTest')}
				</button>
			</div>
		{/if}
	</div>
{:else}
	<div class="question-container">
		{#if !onchange && currentPath.length > 0}
			<button class="back-btn" onclick={goBack} aria-label={$t('modals.quiz.goBack')} type="button">
				{@render backIcon()}
			</button>
		{/if}
		<div class="progress-bar">
			<div class="progress" style="width: {Math.min(100, (currentPath.length + 1) * 100 / 3)}%"></div>
		</div>
		<p class="question-text">{currentQuestion.text}</p>
		<div class="answers-list">
			{#each currentQuestion.answers as answer, i (answer.text)}
				<button
					class="answer-btn"
					onclick={() => selectAnswer(answer, i)}
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

{#snippet backIcon()}
	<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
		<polyline points="15 18 9 12 15 6"></polyline>
	</svg>
{/snippet}

{#snippet restartIcon()}
	<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
		<polyline points="1 4 1 10 7 10"></polyline>
		<path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
	</svg>
{/snippet}

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
		align-self: flex-start;
	}

	@media (hover: hover) {
		.back-btn:hover {
			background: var(--color-background-secondary);
			color: var(--color-secondary);
		}
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

	@media (hover: hover) {
		.answer-btn:hover {
			border-color: var(--color-secondary);
			background: var(--color-background);
		}
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
		gap: var(--space-md);
		padding: var(--space-sm) 0;
	}

	.result-heading {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
	}

	.result-icon {
		color: var(--color-success);
		display: flex;
	}

	.result-heading h3 {
		font-size: var(--text-xl);
		color: var(--color-secondary);
		margin: 0;
		font-weight: var(--font-semibold);
	}

	.result-text {
		font-size: var(--text-lg);
		color: var(--color-text);
		line-height: var(--line-height-relaxed);
		text-align: left;
		margin: 0;
		padding: var(--space-md);
		background: var(--color-background-secondary);
		border-radius: var(--radius-md);
		border-left: 4px solid var(--color-secondary);
	}

	.result-links {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: var(--space-sm);
	}

	.result-link {
		display: inline-flex;
		align-items: center;
		gap: var(--space-sm);
		padding: var(--space-xs) var(--space-md);
		background: var(--color-background-secondary);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-full);
		color: var(--color-text);
		text-decoration: none;
		font-size: var(--text-sm);
		transition: all var(--transition-normal);
	}

	@media (hover: hover) {
		.result-link:hover {
			border-color: var(--color-secondary);
			background: var(--color-background);
		}
	}

	.result-link:focus-visible {
		outline: 2px solid var(--color-primary);
		outline-offset: 2px;
	}

	.result-logo {
		width: 24px;
		height: 24px;
		object-fit: contain;
	}

	.result-actions {
		display: flex;
		gap: var(--space-md);
		flex-wrap: wrap;
		width: 100%;
	}

	.result-actions :global(button) {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-sm);
	}

	@media (max-width: 640px) {
		.answer-btn {
			padding: var(--space-md);
		}

		.result-text {
			padding: var(--space-sm);
		}

		.result-actions {
			gap: var(--space-sm);
		}
	}
</style>
