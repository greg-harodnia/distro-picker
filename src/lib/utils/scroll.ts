/**
 * `frameThrottle` — wraps `callback` so it runs at most once per animation
 * frame, however often the caller fires it.
 *
 * Scroll and resize events fire far more often than the screen refreshes, and
 * measuring on every event would multiply the layout reads for no visible
 * gain. The returned function schedules the work; `cancel()` drops a frame
 * that is still pending.
 */
export function frameThrottle(callback: () => void): (() => void) & { cancel: () => void } {
	let frame = 0;

	function schedule() {
		if (typeof requestAnimationFrame === 'undefined') {
			callback();
			return;
		}

		if (frame) return;

		frame = requestAnimationFrame(() => {
			frame = 0;
			callback();
		});
	}

	schedule.cancel = () => {
		if (typeof cancelAnimationFrame !== 'undefined' && frame) {
			cancelAnimationFrame(frame);
		}

		frame = 0;
	};

	return schedule;
}
