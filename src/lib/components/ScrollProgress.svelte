<script lang="ts">
	/**
	 * `ScrollProgress` — a progress line pinned to the top of the viewport
	 * that shows how much of `target` (the post) has been scrolled through.
	 *
	 * Only the scrolled part is drawn: there is no track behind it, so a post
	 * that hasn't been scrolled shows no line at all.
	 *
	 * The bar is decorative (`aria-hidden`): it mirrors what the reader already
	 * sees in the text position, and a value that changes on every scroll frame
	 * would only be noise for assistive tech.
	 *
	 * Progress is measured against the target element rather than the document,
	 * so the line reaches 100% exactly when the last line of the post sits at
	 * the bottom of the screen — the page header above the post and the footer
	 * below it don't stretch the scale.
	 */
	let { target }: { target: HTMLElement | undefined } = $props();

	let progress = $state(0);
	let frame = 0;

	function measure() {
		if (!target) {
			progress = 0;
			return;
		}

		const rect = target.getBoundingClientRect();
		// How far the post has to travel through the viewport before its last
		// line reaches the bottom of the screen.
		const travel = rect.height - window.innerHeight;

		// The post fits in the viewport (or is hidden): there is nothing to
		// scroll through, so the line stays empty rather than claiming the
		// post is already read.
		if (travel <= 0) {
			progress = 0;
			return;
		}

		const scrolled = Math.min(Math.max(-rect.top, 0), travel);
		progress = scrolled / travel;
	}

	// Scrolling fires far more often than the line needs to move; one
	// measurement per animation frame is enough and keeps it smooth.
	function schedule() {
		if (frame) return;
		frame = requestAnimationFrame(() => {
			frame = 0;
			measure();
		});
	}

	$effect(() => {
		const element = target;
		if (!element) {
			// The post is gone (navigation): drop the stale value instead of
			// leaving the line where it was.
			progress = 0;
			return;
		}

		// Webfonts and late-loading images change the post's height after
		// mount, so the travel distance has to be measured again when they do.
		const observer = new ResizeObserver(schedule);
		observer.observe(element);
		schedule();

		return () => {
			observer.disconnect();
			cancelAnimationFrame(frame);
			frame = 0;
		};
	});
</script>

<svelte:window onscroll={schedule} onresize={schedule} />

<div class="scroll-progress" aria-hidden="true" style:--progress={progress}></div>

<style>
	/* A fixed 2px line across the top of the viewport, drawn only for the part
	   of the post that has been scrolled through: there is no track behind it,
	   so an untouched post shows nothing at all. `pointer-events: none` keeps it
	   from swallowing clicks, and the z-index parks it below the modal stack
	   (1000). */
	.scroll-progress {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		height: 2px;
		z-index: 100;
		pointer-events: none;
		background: var(--accent);
		/* `scaleX` instead of `width`: the line stays compositor-only, so it
		   never triggers layout while scrolling. */
		transform: scaleX(var(--progress, 0));
		transform-origin: left center;
	}
</style>
