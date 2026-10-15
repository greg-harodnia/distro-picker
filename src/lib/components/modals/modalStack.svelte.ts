/**
 * Tracks open `<Modal>` instances so stacked overlays can share one
 * effective scrim strength instead of compositing into a near-solid wash.
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
		/** The topmost modal is the interactive one; others recede. */
		get isTop() {
			return open[open.length - 1] === id;
		},
		enter() {
			open.push(id);
			return () => {
				const i = open.indexOf(id);
				if (i !== -1) open.splice(i, 1);
			};
		},
	};
}
