/**
 * Guards the quiz's locale-independent outcome map.
 *
 * The distros an answer recommends live in `src/lib/quiz-results.ts`, keyed by
 * the dot-joined index path of the answer (e.g. `"1.0"`). That key is only
 * meaningful as long as:
 *
 *   1. every locale's quiz tree has the same shape (same nesting, same answer
 *      order — answers are referenced by index, so an insertion in one locale
 *      but not the other silently re-maps every later answer),
 *   2. every leaf answer (one with `result`) has an entry in QUIZ_RESULTS and
 *      vice versa,
 *   3. every distro id in QUIZ_RESULTS exists in distros.json.
 *
 * Run with `npm run check:quiz`.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { QUIZ_RESULTS } from '../src/lib/quiz-results.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (rel: string) => JSON.parse(readFileSync(join(root, rel), 'utf-8'));

const locales = {
	en: readJson('src/lib/locales/en.json'),
	be: readJson('src/lib/locales/be.json')
};
const distroIds: Set<string> = new Set(
	readJson('src/lib/distros.json').distros.map((d: { id: string }) => d.id)
);

type Answer = { text?: unknown; result?: unknown; question?: { answers: Answer[] } };
type Question = { answers: Answer[] };

const errors: string[] = [];

/** Structural fingerprint: keys and array lengths only, string values erased. */
function shape(node: unknown): unknown {
	if (Array.isArray(node)) return node.map(shape);
	if (node && typeof node === 'object') {
		return Object.fromEntries(
			Object.entries(node as Record<string, unknown>)
				.sort(([a], [b]) => a.localeCompare(b))
				.map(([k, v]) => [k, shape(v)])
		);
	}
	return typeof node;
}

/** Index paths of every leaf answer (an answer without a follow-up question). */
function leafPaths(question: Question, prefix: number[] = []): number[][] {
	const paths: number[][] = [];
	question.answers.forEach((answer, i) => {
		const path = [...prefix, i];
		if (answer.question) {
			paths.push(...leafPaths(answer.question, path));
		} else {
			paths.push(path);
		}
	});
	return paths;
}

const quizEn = locales.en.modals.quiz.question as Question;
const quizBe = locales.be.modals.quiz.question as Question;

// 1. Locales must be structurally identical — indexes are the map keys.
if (JSON.stringify(shape(quizEn)) !== JSON.stringify(shape(quizBe))) {
	errors.push('quiz tree shape differs between en and be (answer order/nesting must match)');
}

const enLeaves = leafPaths(quizEn);
const beLeaves = leafPaths(quizBe);
const enKeys = new Set(enLeaves.map((p) => p.join('.')));
const beKeys = new Set(beLeaves.map((p) => p.join('.')));
const mapKeys = new Set(Object.keys(QUIZ_RESULTS));

// 2. Every leaf ↔ every map entry, in both locales.
for (const [label, keys] of [['en', enKeys], ['be', beKeys]] as const) {
	for (const key of keys) {
		if (!mapKeys.has(key)) errors.push(`${label}: leaf answer "${key}" has no QUIZ_RESULTS entry`);
	}
}
for (const key of mapKeys) {
	if (!enKeys.has(key)) errors.push(`QUIZ_RESULTS key "${key}" matches no en leaf answer`);
	if (!beKeys.has(key)) errors.push(`QUIZ_RESULTS key "${key}" matches no be leaf answer`);
}

// Leaves must actually produce a recommendation (the quiz only completes on `result`).
for (const [label, quiz] of [['en', locales.en], ['be', locales.be]] as const) {
	const walk = (q: Question, path: number[] = []) => {
		q.answers.forEach((a, i) => {
			const p = [...path, i];
			if (a.question) walk(a.question, p);
			else if (typeof a.result !== 'string' || !a.result.trim())
				errors.push(`${label}: leaf answer "${p.join('.')}" has no result prose`);
		});
	};
	walk(quiz.modals.quiz.question as Question);
}

// 3. Every recommended id must have a distro page to link to.
for (const [key, ids] of Object.entries(QUIZ_RESULTS)) {
	for (const id of ids) {
		if (!distroIds.has(id)) errors.push(`QUIZ_RESULTS["${key}"]: unknown distro id "${id}"`);
	}
}

if (errors.length > 0) {
	console.error(`check:quiz failed (${errors.length}):`);
	for (const e of errors) console.error(`  - ${e}`);
	process.exit(1);
}

console.log(
	`check:quiz ok — ${enLeaves.length} leaf answers × ${Object.keys(locales).length} locales, ` +
		`${Object.keys(QUIZ_RESULTS).length} result entries, ${distroIds.size} distros`
);
