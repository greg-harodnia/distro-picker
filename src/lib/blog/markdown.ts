import { Marked } from 'marked';

// Trusted, statically compiled-in markdown. `marked` passes raw HTML through,
// so defensively strip script tags before handing the output to `{@html}`.
const marked = new Marked({ gfm: true, breaks: false });

export function renderMarkdown(markdown: string): string {
	return marked
		.parse(markdown, { async: false })
		.replace(/<script\b[\s\S]*?<\/script>/gi, '')
		.trim();
}