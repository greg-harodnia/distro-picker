export function lockBodyScroll(lock: boolean): void {
	if (typeof document !== 'undefined') {
		document.body.style.overflow = lock ? 'hidden' : '';
	}
}
