import { Marked, Renderer, type Tokens } from 'marked';

// `marked`'s `use()` copies renderer overrides with `for…in`, which skips the
// non-enumerable methods of a `Renderer` subclass — a class instance passed as
// `renderer` is silently dropped, so tables came out unwrapped (no `.table-scroll`
// scroll container, no gap before the following block). Plain-object methods are
// own and enumerable, so they are picked up.
const renderer = {
	table(this: Renderer, token: Tokens.Table): string {
		const table = Renderer.prototype.table.call(this, token);
		return `<div class="table-scroll" role="region" aria-label="Scrollable table" tabindex="0">${table}</div>`;
	},
};

// Trusted, statically compiled-in markdown. `marked` passes raw HTML through,
// so defensively strip script tags before handing the output to `{@html}`.
const marked = new Marked({
	gfm: true,
	breaks: false,
	renderer,
});

export function renderMarkdown(markdown: string): string {
	return marked
		.parse(markdown, { async: false })
		.replace(/<script\b[\s\S]*?<\/script>/gi, '')
		.trim();
}