import { Marked, Renderer, type Tokens } from 'marked';

/** A section heading of a post, with the anchor id it got in the rendered HTML. */
export interface TocEntry {
	/** Anchor id of the heading, e.g. `how-to-fix-it`. */
	id: string;
	/** Heading text without markdown syntax. */
	text: string;
}

/** A rendered post body together with the headings a table of contents links to. */
export interface RenderedMarkdown {
	html: string;
	/** The `##` sections of the post, in document order. */
	headings: TocEntry[];
}

/** Heading text without markdown syntax: `**bold**` → `bold`, `[a](b)` → `a`. */
function plainText(markdown: string): string {
	return markdown
		.replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
		.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
		.replace(/[`*_~]/g, '')
		.replace(/\s+/g, ' ')
		.trim();
}

/**
 * Anchor id for a heading: lowercase words joined by dashes. Unicode letters
 * are kept, so non-Latin headings (Belarusian) stay readable in the URL
 * instead of collapsing into an empty string.
 */
function slugify(text: string): string {
	return text
		.toLowerCase()
		.replace(/[^\p{L}\p{N}]+/gu, '-')
		.replace(/^-+|-+$/g, '');
}

/**
 * Renders a post body to HTML and collects its section headings.
 *
 * Every heading gets an `id`, so any section can be linked to with a fragment
 * URL; only the `##` sections are collected, because those are the ones a
 * table of contents lists.
 */
export function renderMarkdown(markdown: string): RenderedMarkdown {
	const headings: TocEntry[] = [];
	const usedIds = new Set<string>();

	/** Keeps ids unique when two headings slugify to the same string. */
	function uniqueId(slug: string): string {
		let id = slug;
		let counter = 1;

		while (usedIds.has(id)) {
			counter += 1;
			id = `${slug}-${counter}`;
		}

		usedIds.add(id);
		return id;
	}

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
		heading(this: Renderer, token: Tokens.Heading): string {
			const html = Renderer.prototype.heading.call(this, token);
			const text = plainText(token.text);
			const id = uniqueId(slugify(text) || 'section');

			if (token.depth === 2) {
				headings.push({ id, text });
			}

			return html.replace(/^<h(\d)>/, `<h$1 id="${id}">`);
		},
	};

	// Trusted, statically compiled-in markdown. `marked` passes raw HTML through,
	// so defensively strip script tags before handing the output to `{@html}`.
	const marked = new Marked({
		gfm: true,
		breaks: false,
		renderer,
	});

	const html = marked
		.parse(markdown, { async: false })
		.replace(/<script\b[\s\S]*?<\/script>/gi, '')
		.trim();

	return { html, headings };
}
