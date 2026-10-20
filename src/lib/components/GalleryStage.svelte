<script lang="ts">
	import { t } from '$lib/i18n/locale';
	import ChevronLeftIcon from '$lib/components/icons/ChevronLeftIcon.svelte';
	import ChevronRightIcon from '$lib/components/icons/ChevronRightIcon.svelte';

	let {
		src,
		alt,
		index = 0,
		total = 1,
		preloadSrcs = [],
		onprev,
		onnext,
		onexpand,
		expandLabel,
		zoom = false,
		swipe = true
	}: {
		src: string;
		alt: string;
		index?: number;
		total?: number;
		preloadSrcs?: string[];
		onprev?: (() => void) | undefined;
		onnext?: (() => void) | undefined;
		onexpand?: (() => void) | undefined;
		expandLabel?: string | undefined;
		zoom?: boolean;
		swipe?: boolean;
	} = $props();

	type GestureMode = 'none' | 'pinch' | 'pan' | 'swipe';

	const SWIPE_THRESHOLD = 40;
	const TAP_SLOP = 8;
	const ANCHOR_DRIFT = 20;
	const MAX_SCALE = 4;
	const DOUBLE_TAP_MS = 300;
	const CLICK_SUPPRESS_MS = 400;

	let frameEl: HTMLDivElement;

	let scale = $state(1);
	let translateX = $state(0);
	let translateY = $state(0);
	let gesturing = $state(false);

	let mode: GestureMode = 'none';
	let startDistance = 0;
	let startScale = 1;
	let startTx = 0;
	let startTy = 0;
	let panStartX = 0;
	let panStartY = 0;
	let swipeStartX = 0;
	let swipeStartY = 0;
	let gestureMoved = 0;
	let lastTapAt = 0;
	let suppressUntil = 0;
	let fingerStarts: Record<number, { x: number; y: number }> = {};

	$effect(() => {
		if (src) {
			scale = 1;
			translateX = 0;
			translateY = 0;
		}
	});

	let transformStyle = $derived(
		`transform: translate(${translateX}px, ${translateY}px) scale(${scale})`
	);

	function framePoint(clientX: number, clientY: number) {
		const rect = frameEl.getBoundingClientRect();
		return { x: clientX - rect.left, y: clientY - rect.top };
	}

	function fingerDistance(touches: TouchList) {
		return Math.hypot(
			touches[0].clientX - touches[1].clientX,
			touches[0].clientY - touches[1].clientY
		);
	}

	function fingerDrift(touch: Touch) {
		const start = fingerStarts[touch.identifier];
		return start ? Math.hypot(touch.clientX - start.x, touch.clientY - start.y) : Infinity;
	}

	function rememberFingers(touches: TouchList) {
		const next: Record<number, { x: number; y: number }> = {};
		for (const touch of Array.from(touches)) {
			next[touch.identifier] = { x: touch.clientX, y: touch.clientY };
		}
		fingerStarts = next;
	}

	function handleTouchStart(e: TouchEvent) {
		if (e.touches.length === 1) {
			gestureMoved = 0;
			swipeStartX = e.touches[0].clientX;
			swipeStartY = e.touches[0].clientY;
			rememberFingers(e.touches);

			if (zoom && scale > 1) {
				mode = 'pan';
				gesturing = true;
				startTx = translateX;
				startTy = translateY;
				panStartX = e.touches[0].clientX;
				panStartY = e.touches[0].clientY;
			} else {
				mode = swipe ? 'swipe' : 'none';
			}
			return;
		}

		if (zoom && e.touches.length >= 2) {
			mode = 'pinch';
			gesturing = true;
			startDistance = fingerDistance(e.touches) || 1;
			startScale = scale;
			rememberFingers(e.touches);
		}
	}

	// Scaling stays anchored to whichever finger did not move, so spreading
	// one finger away from a resting one zooms into the exact spot under the
	// resting finger. When both fingers travel equally the midpoint anchors
	// the zoom instead, which is the plain-pinch feel.
	function applyPinch(touches: TouchList) {
		const distance = fingerDistance(touches);
		const nextScale = Math.max(1, Math.min((startScale * distance) / startDistance, MAX_SCALE));

		const first = touches[0];
		const second = touches[1];
		const firstDrift = fingerDrift(first);
		const secondDrift = fingerDrift(second);
		gestureMoved = Math.max(gestureMoved, Math.max(firstDrift, secondDrift));

		let anchor: { x: number; y: number };
		if (Math.min(firstDrift, secondDrift) <= ANCHOR_DRIFT) {
			const still = firstDrift <= secondDrift ? first : second;
			anchor = framePoint(still.clientX, still.clientY);
		} else {
			anchor = framePoint(
				(first.clientX + second.clientX) / 2,
				(first.clientY + second.clientY) / 2
			);
		}

		if (nextScale === 1) {
			scale = 1;
			translateX = 0;
			translateY = 0;
			return;
		}

		const ratio = nextScale / scale;
		translateX = anchor.x - (anchor.x - translateX) * ratio;
		translateY = anchor.y - (anchor.y - translateY) * ratio;
		scale = nextScale;
	}

	function handleTouchMove(e: TouchEvent) {
		if (mode === 'pinch') {
			if (e.touches.length >= 2) {
				e.preventDefault();
				applyPinch(e.touches);
			}
			return;
		}

		if (mode === 'pan') {
			e.preventDefault();
			const dx = e.touches[0].clientX - panStartX;
			const dy = e.touches[0].clientY - panStartY;
			gestureMoved = Math.max(gestureMoved, Math.hypot(dx, dy));
			translateX = startTx + dx;
			translateY = startTy + dy;
			return;
		}

		if (mode === 'swipe' && e.touches.length >= 1) {
			const dx = e.touches[0].clientX - swipeStartX;
			const dy = e.touches[0].clientY - swipeStartY;
			gestureMoved = Math.max(gestureMoved, Math.hypot(dx, dy));
		}
	}

	function navigateBySwipe(touch: Touch) {
		if (total < 2 || !onnext || !onprev) return;
		const dx = touch.clientX - swipeStartX;
		const dy = touch.clientY - swipeStartY;
		if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy) * 1.5) {
			if (dx < 0) onnext();
			else onprev();
			suppressUntil = performance.now() + CLICK_SUPPRESS_MS;
		}
	}

	function handleDoubleTap() {
		const now = performance.now();
		if (now - lastTapAt < DOUBLE_TAP_MS) {
			scale = 1;
			translateX = 0;
			translateY = 0;
			lastTapAt = 0;
			suppressUntil = now + CLICK_SUPPRESS_MS;
		} else {
			lastTapAt = now;
		}
	}

	function endGesture() {
		if (gestureMoved > TAP_SLOP) {
			suppressUntil = performance.now() + CLICK_SUPPRESS_MS;
		}
		mode = 'none';
		gesturing = false;
	}

	function handleTouchEnd(e: TouchEvent) {
		if (mode === 'pinch') {
			if (e.touches.length >= 1) {
				const touch = e.touches[0];
				if (scale > 1) {
					mode = 'pan';
					startTx = translateX;
					startTy = translateY;
					panStartX = touch.clientX;
					panStartY = touch.clientY;
				} else {
					mode = 'swipe';
					swipeStartX = touch.clientX;
					swipeStartY = touch.clientY;
				}
				return;
			}
			endGesture();
			return;
		}

		if (mode === 'pan' || mode === 'swipe') {
			if (e.touches.length >= 1) return;
			if (mode === 'swipe') {
				navigateBySwipe(e.changedTouches[0]);
			} else if (scale > 1 && gestureMoved < TAP_SLOP) {
				handleDoubleTap();
			}
			endGesture();
		}
	}

	function handleHitClick() {
		if (performance.now() < suppressUntil) return;
		onexpand?.();
	}
</script>

<div class="stage" class:zoomable={zoom} class:gesturing bind:this={frameEl}>
	{#snippet picture()}
		<img
			class="stage-img"
			{src}
			{alt}
			loading="eager"
			decoding="async"
			draggable="false"
			style={transformStyle}
			ontouchstart={handleTouchStart}
			ontouchmove={handleTouchMove}
			ontouchend={handleTouchEnd}
			ontouchcancel={handleTouchEnd}
		/>
	{/snippet}

	{#if onexpand}
		<button class="shot-hit" type="button" onclick={handleHitClick} aria-label={expandLabel}>
			{@render picture()}
			<span class="stage-pill expand-badge" aria-hidden="true">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="14"
					height="14"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="M15 3h6v6"></path>
					<path d="M9 21H3v-6"></path>
					<path d="M21 3l-7 7"></path>
					<path d="M3 21l7-7"></path>
				</svg>
			</span>
		</button>
	{:else}
		{@render picture()}
	{/if}

	{#each preloadSrcs as href (href)}
		<link rel="preload" as="image" {href} />
	{/each}

	{#if total > 1 && onprev && onnext}
		<button
			class="stage-nav left"
			onclick={onprev}
			aria-label={$t('modals.gallery.previousImage')}
			type="button"
		>
			<ChevronLeftIcon size={24} />
		</button>
		<button
			class="stage-nav right"
			onclick={onnext}
			aria-label={$t('modals.gallery.nextImage')}
			type="button"
		>
			<ChevronRightIcon size={24} />
		</button>
	{/if}

	{#if total > 1}
		<span class="stage-pill stage-count" aria-hidden="true">{index + 1} / {total}</span>
	{/if}
</div>

<style>
	.stage {
		position: relative;
		flex: 1;
		min-height: 0;
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
		touch-action: pan-y;
	}

	.stage.zoomable {
		touch-action: none;
	}

	.stage-img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: contain;
		user-select: none;
		-webkit-user-drag: none;
		transform-origin: 0 0;
		transition: transform 0.18s ease-out;
	}

	.stage.gesturing .stage-img {
		transition: none;
	}

	.shot-hit {
		position: absolute;
		inset: 0;
		padding: 0;
		border: none;
		background: none;
		cursor: zoom-in;
	}

	.stage-nav {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 44px;
		min-height: 44px;
		padding: var(--space-sm);
		background: color-mix(in srgb, var(--color-surface) 88%, transparent);
		border: 1px solid var(--line-strong);
		color: var(--color-text-secondary);
		border-radius: var(--radius-full);
		cursor: pointer;
		transition: all var(--transition-normal);
	}

	.stage-nav.left {
		left: var(--space-md);
	}

	.stage-nav.right {
		right: var(--space-md);
	}

	@media (hover: hover) {
		.stage-nav:hover {
			background: var(--color-secondary);
			border-color: var(--color-secondary);
			color: var(--color-background);
		}
	}

	.stage-pill {
		position: absolute;
		display: flex;
		align-items: center;
		gap: var(--space-2xs);
		padding: var(--space-2xs) var(--space-sm);
		background: color-mix(in srgb, var(--color-surface) 88%, transparent);
		border: 1px solid var(--line);
		border-radius: var(--radius-full);
		color: var(--color-text-secondary);
		font-family: var(--font-mono);
		font-size: var(--text-sm);
		line-height: 1;
		pointer-events: none;
	}

	.stage-count {
		top: var(--space-md);
		right: var(--space-md);
	}

	.expand-badge {
		top: var(--space-md);
		left: var(--space-md);
	}

	@media (max-width: 640px) {
		.stage-nav {
			padding: var(--space-xs);
		}

		.stage-nav :global(svg) {
			width: 20px;
			height: 20px;
		}

		.stage-nav.left {
			left: var(--space-xs);
		}

		.stage-nav.right {
			right: var(--space-xs);
		}

		.stage-count {
			top: var(--space-sm);
			right: var(--space-sm);
		}

		.expand-badge {
			top: var(--space-sm);
			left: var(--space-sm);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.stage-img {
			transition: none;
		}
	}
</style>
