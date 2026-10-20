function wrap(index: number, length: number): number {
	if (length <= 0) return 0;
	return ((index % length) + length) % length;
}

/**
 * Per-instance navigation state for a screenshot collection: current index,
 * wrapping prev/next and the adjacent images worth preloading. Shared by the
 * inline panel (`ScreenshotGallery`) and the fullscreen lightbox
 * (`GalleryModal`) so both surfaces navigate identically.
 */
export function createGalleryState(images: readonly string[], startIndex = 0) {
	let index = $state(wrap(startIndex, images.length));

	const jumpTo = (nextIndex: number) => {
		index = wrap(nextIndex, images.length);
	};

	const next = () => jumpTo(index + 1);
	const prev = () => jumpTo(index - 1);

	let preloadSrcs = $derived.by(() => {
		const length = images.length;
		if (length < 2) return [];
		const neighbors = new Set([wrap(index - 1, length), wrap(index + 1, length)]);
		return [...neighbors].map((i) => images[i]);
	});

	return {
		images,
		get index() {
			return index;
		},
		get hasMultiple() {
			return images.length > 1;
		},
		get preloadSrcs() {
			return preloadSrcs;
		},
		jumpTo,
		next,
		prev,
	};
}
