import { browser } from '$app/environment';
import { preloadCode, preloadData } from '$app/navigation';

/**
 * Chunks a page only fetches the first time it's opened (the homepage wraps
 * them in `{#await import(...)}`). Importing them with the *same* specifier
 * warms the identical chunk, so the first open renders right away instead of
 * waiting for a network round-trip.
 */
const LAZY_CHUNKS: ReadonlyArray<() => Promise<unknown>> = [
	() => import('$lib/components/modals/InfoModal.svelte'), // "Additional Information"
	() => import('$lib/components/modals/QuickTestModal.svelte'), // "Quick Quiz"
	() => import('$lib/components/modals/ContactModal.svelte'), // header contact button
];

export interface WarmUpTargets {
	/** Paths to warm up fully (route code + load data), e.g. `/blog`. */
	pages?: readonly string[];
	/** Pathname patterns to import route code for, e.g. `/blog/*`. */
	codes?: readonly string[];
}

type WarmUpTask = () => Promise<unknown>;

/** Tasks waiting for the next idle flush. */
const queue = new Map<string, WarmUpTask>();
/** Keys already handed to the browser — warming is one-shot per target. */
const done = new Set<string>();
let flushScheduled = false;

/** Network Information API (Chromium only); absent elsewhere -> no preference. */
function prefersSaveData(): boolean {
	const connection = (navigator as unknown as { connection?: { saveData?: boolean } }).connection;
	return connection?.saveData === true;
}

function enqueue(key: string, task: WarmUpTask): void {
	if (done.has(key)) return;
	queue.set(key, task);
}

/**
 * Warm up routes and lazy chunks in the background so the first navigation or
 * click isn't a network round-trip. The work runs once the page has loaded and
 * the browser is idle (never for Save-Data users), and repeat calls are
 * deduplicated per target, so it's safe to call from an `$effect`.
 *
 * Everything is best-effort: a failed preload is swallowed, because a warm-up
 * that lost the race with the user's click should look exactly like not having
 * warmed up at all.
 */
export function warmUp(targets: WarmUpTargets = {}): void {
	if (!browser || prefersSaveData()) return;

	for (const path of targets.pages ?? []) {
		enqueue(`page:${path}`, () => preloadData(path));
		enqueue(`code:${path}`, () => preloadCode(path));
	}
	for (const pattern of targets.codes ?? []) {
		enqueue(`code:${pattern}`, () => preloadCode(pattern));
	}
	enqueue('lazy-chunks', async () => {
		await Promise.all(LAZY_CHUNKS.map((load) => load()));
	});

	if (flushScheduled || queue.size === 0) return;
	flushScheduled = true;
	whenIdle(flush);
}

function flush(): void {
	flushScheduled = false;
	for (const [key, task] of queue) {
		queue.delete(key);
		done.add(key);
		task().catch(() => {});
	}
}

/** Run `fn` after the page has loaded, at the first idle moment. */
function whenIdle(fn: () => void): void {
	let scheduled = false;
	const go = () => {
		if (scheduled) return;
		scheduled = true;

		const requestIdle = (
			globalThis as typeof globalThis & {
				requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
			}
		).requestIdleCallback;

		if (typeof requestIdle === 'function') requestIdle(fn, { timeout: 2000 });
		else setTimeout(fn, 1500);
	};

	if (document.readyState === 'complete') {
		go();
	} else {
		window.addEventListener('load', go, { once: true });
		// ...but don't let a slow or hung asset postpone the warm-up forever.
		setTimeout(go, 5000);
	}
}
