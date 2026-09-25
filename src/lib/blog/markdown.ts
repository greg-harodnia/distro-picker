import { Marked, Renderer, type Tokens } from 'marked';

class ResponsiveRenderer extends Renderer {
	override table(token: Tokens.Table): string {
		return `<div class="table-scroll" role="region" aria-label="Scrollable table" tabindex="0">${super.table(token)}</div>`;
	}
}

// Trusted, statically compiled-in markdown. `marked` passes raw HTML through,
// so defensively strip script tags before handing the output to `{@html}`.
const marked = new Marked({
	gfm: true,
	breaks: false,
	renderer: new ResponsiveRenderer(),
});

export function renderMarkdown(markdown: string): string {
	return marked
		.parse(markdown, { async: false })
		.replace(/<script\b[\s\S]*?<\/script>/gi, '')
		.trim();
}