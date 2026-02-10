import { onMount, onDestroy } from 'svelte';

export function createFocusTrap(element: any) {
	let previousFocus: any = null;
	let focusableElements: any[] = [];

	function getFocusableElements() {
		const selector = [
			'button:not([disabled])',
			'input:not([disabled])',
			'select:not([disabled])',
			'textarea:not([disabled])',
			'a[href]',
			'[tabindex]:not([tabindex="-1"])',
			'[contenteditable="true"]'
		].join(', ');

		return Array.from(element.querySelectorAll(selector));
	}

	function handleKeyDown(e: any) {
		if (e.key !== 'Tab') return;

		focusableElements = getFocusableElements();

		if (focusableElements.length === 0) return;

		const firstElement = focusableElements[0];
		const lastElement = focusableElements[focusableElements.length - 1];

		if (e.shiftKey) {
			if (globalThis.document?.activeElement === firstElement) {
				e.preventDefault();
				lastElement.focus();
			}
		} else {
			if (globalThis.document?.activeElement === lastElement) {
				e.preventDefault();
				firstElement.focus();
			}
		}
	}

	function activate() {
		previousFocus = globalThis.document?.activeElement;
		focusableElements = getFocusableElements();

		if (focusableElements.length > 0) {
			focusableElements[0].focus();
		}

		element.addEventListener('keydown', handleKeyDown);
	}

	function deactivate() {
		element.removeEventListener('keydown', handleKeyDown);

		if (previousFocus) {
			previousFocus.focus();
		}
	}

	onMount(() => {
		activate();
	});

	onDestroy(() => {
		deactivate();
	});

	return {
		activate,
		deactivate,
		update: () => {
			focusableElements = getFocusableElements();
		}
	};
}