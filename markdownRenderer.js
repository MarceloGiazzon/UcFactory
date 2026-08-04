(function()
{
	window.PXTG_Handlers = window.PXTG_Handlers || {};

	// Minimal markdown subset (headings, bold, italic, links) - no vendored
	// library, keeps this handler self-contained. Swap for marked.js + DOMPurify
	// (loaded the same dynamic-script way) if the real UC's full spec is needed.
	function tinyMarkdownToHtml(pMd)
	{
		return pMd
			.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
			.replace(/^### (.*)$/gm, '<h3>$1</h3>')
			.replace(/^## (.*)$/gm, '<h2>$1</h2>')
			.replace(/^# (.*)$/gm, '<h1>$1</h1>')
			.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
			.replace(/\*(.+?)\*/g, '<em>$1</em>')
			.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
	}

	window.PXTG_Handlers['markdownrenderer'] = function(pData)
	{
		var md = (pData && pData.Markdown) ? pData.Markdown : '';

		console.log('markdownRenderer (external GitHub js) || input markdown: ' + md);

		var html = tinyMarkdownToHtml(md);

		console.log('markdownRenderer (external GitHub js) || output html: ' + html);

		return { Type: 'RenderComplete', Html: html };
	}
})();
