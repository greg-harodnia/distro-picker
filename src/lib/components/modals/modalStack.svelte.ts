/**
 * Tracks open `<Modal>` instances so stacked overlays share one source of
 * truth: only the bottom-most one paints the scrim, and only the top-most one
 * reacts to Escape / overlay clicks. The body scroll lock is released when the
 * *last* modal leaves.
 */
let open = $state<number[]>([]);
let nextId = 0;

export function useModalStack() {
	const id = ++nextId;

	return {
		/** The bottom-most open modal paints the full-strength scrim. */
		get isBottom() {
			return open[0] === id;
		},
		/** Only the top-most modal may react to Escape / overlay clicks. */
		get isTopmost() {
			return open[open.length - 1] === id;
		},
		/** Registers this modal; the returned `leave` reports whether it was the last. */
		enter() {
			open.push(id);
			return () => {
				const i = open.indexOf(id);
				if (i !== -1) open.splice(i, 1);
				return open.length === 0;
			};
		},
	};
}
