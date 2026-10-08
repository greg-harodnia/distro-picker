/**
 * Locale-independent quiz outcome map.
 *
 * Which distros an answer recommends is *data*, not copy: it must be identical
 * for every language, so it lives here instead of being duplicated in
 * `locales/en.json` and `locales/be.json` (where the two copies could — and
 * did — drift apart).
 *
 * Keys are the dot-joined indices of the answer along the tree, e.g. `"1.0"`
 * = root answer 1 → its question's answer 0. Index 0 of the root is `"0"`.
 * Every leaf answer (one with a `result`) must have a key here; run
 * `npm run check:quiz` to verify that the locale trees still match this map.
 */
export const QUIZ_RESULTS = {
	/** I'm lazy, just tell me what to use */
	'0': ['zorin', 'tuxedo', 'ultramarine', 'aurora'],
	/** Just a regular user → Windows-like */
	'1.0': ['mint', 'zorin', 'kubuntu', 'tuxedo', 'ultramarine', 'aurora'],
	/** Just a regular user → macOS-like */
	'1.1': ['popos', 'zorin'],
	/** Preconfigured for gaming → don't care about editing system files */
	'2.0': ['bazzite', 'steamos', 'rakuos'],
	/** Preconfigured for gaming → yes, want to edit system files */
	'2.1': ['nobara', 'pikaos', 'cachyos'],
	/** I want to develop on it */
	'3': ['fedora', 'kubuntu'],
	/** Tech enthusiast, full control */
	'4': ['endeavouros', 'omarchy', 'cachyos'],
	/** Recover an old PC → sluggish, but not extremely old */
	'5.0': ['mint'],
	/** Recover an old PC → produced more than 15 years ago */
	'5.1': ['lubuntu'],
	/** Recover an old PC → truly ancient */
	'5.2': ['antiX'],
	/** Apple Silicon — Asahi has no page in distros.json yet */
	'6': [],
	/** Android console — Armada has no page in distros.json yet */
	'7': []
} as const satisfies Record<string, readonly string[]>;

/** Dot-joined index path of an answer, matching a {@link QUIZ_RESULTS} key. */
export function quizResultKey(path: readonly number[]): string {
	return path.join('.');
}

/**
 * Result ids for an answer path, or `undefined` when the map has no entry —
 * which `check:quiz` treats as a failure, but the component tolerates at
 * runtime rather than rendering a broken result page.
 */
export function quizResultsFor(path: readonly number[]): readonly string[] | undefined {
	return (QUIZ_RESULTS as Readonly<Record<string, readonly string[] | undefined>>)[
		quizResultKey(path)
	];
}
