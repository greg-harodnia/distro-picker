/**
 * `use:dragScroll` — click-and-drag to scroll a horizontally scrollable element
 * (e.g. the filter tag row on desktop).
 *
 * Mouse and pen pointers get manual drag scrolling; touch keeps its native
 * panning (and its smooth momentum/overscroll), so nothing has to be
 * re-implemented for mobile.
 *
 * After a real drag the click that follows is swallowed, so buttons inside the
 * row (tag toggles, group triggers) aren't unintentionally hit.
 *
 * The action is self-contained: it manages the grab/grabbing cursor and
 * disables text selection while dragging, so no extra CSS is required.
 */

const DRAG_THRESHOLD = 4; // px of movement before it counts as a drag

export function dragScroll(node: HTMLElement) {
	let isDown = false;
	let dragged = false;
	let startX = 0;
	let startScrollLeft = 0;
	let swallowClick: ((e: Event) => void) | null = null;

	const previousCursor = node.style.cursor;
	node.style.cursor = 'grab';

	const setSelectable = (selectable: boolean) => {
		if (selectable) {
			node.style.removeProperty('user-select');
			node.style.removeProperty('-webkit-user-select');
		} else {
			node.style.setProperty('user-select', 'none');
			node.style.setProperty('-webkit-user-select', 'none');
		}
	};

	const onPointerDown = (e: PointerEvent) => {
		// Touch already pans natively — don't interfere with it (and only the
		// primary button should start a drag).
		if (e.pointerType === 'touch' || e.button !== 0) return;

		isDown = true;
		dragged = false;
		startX = e.clientX;
		startScrollLeft = node.scrollLeft;
		node.style.cursor = 'grabbing';
		setSelectable(false);
	};

	// Move/up are listened on `window` instead of the node so a drag keeps
	// working even when the cursor leaves the element, and normal clicks on
	// child buttons are unaffected (no pointer capture / click retargeting).
	const onPointerMove = (e: PointerEvent) => {
		if (!isDown) return;
		const dx = e.clientX - startX;
		if (!dragged && Math.abs(dx) > DRAG_THRESHOLD) {
			dragged = true;
		}
		node.scrollLeft = startScrollLeft - dx;
	};

	const endDrag = () => {
		if (!isDown) return;
		isDown = false;
		node.style.cursor = 'grab';
		setSelectable(true);

		if (dragged) {
			// Swallow only the click that is dispatched right after this drag.
			swallowClick = (e: Event) => {
				e.preventDefault();
				e.stopPropagation();
			};
			node.addEventListener('click', swallowClick, true);
			// The click fires in the same task as pointerup, so unhooking on
			// the next tick keeps later, genuine clicks untouched.
			setTimeout(() => {
				if (swallowClick) {
					node.removeEventListener('click', swallowClick, true);
					swallowClick = null;
				}
			}, 0);
		}
		dragged = false;
	};

	node.addEventListener('pointerdown', onPointerDown);
	window.addEventListener('pointermove', onPointerMove);
	window.addEventListener('pointerup', endDrag);
	window.addEventListener('pointercancel', endDrag);

	return {
		destroy() {
			node.removeEventListener('pointerdown', onPointerDown);
			window.removeEventListener('pointermove', onPointerMove);
			window.removeEventListener('pointerup', endDrag);
			window.removeEventListener('pointercancel', endDrag);
			if (swallowClick) {
				node.removeEventListener('click', swallowClick, true);
			}
			setSelectable(true);
			node.style.cursor = previousCursor;
		},
	};
}