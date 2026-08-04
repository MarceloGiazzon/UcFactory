(function()
{
	window.PXTG_Handlers = window.PXTG_Handlers || {};

	// Note: navigator.clipboard.writeText is async, but this handler contract is
	// synchronous (return value = result). We fire the write and report success
	// optimistically, since the call itself is issued synchronously inside the
	// click-driven event chain (required for the permission gesture to count).
	window.PXTG_Handlers['clipboardcopy'] = function(pData)
	{
		var text = (pData && pData.Text) ? pData.Text : '';

		console.log('clipboardCopy (external GitHub js) || CopyText: ' + text);

		if (!text)
			return { Type: 'CopyFailed', Reason: 'empty-text' };

		if (!(window.isSecureContext && navigator.clipboard))
		{
			console.warn('clipboardCopy (external GitHub js) || not a secure context, cannot copy');
			return { Type: 'CopyFailed', Reason: 'not-secure-context' };
		}

		try
		{
			navigator.clipboard.writeText(text);
			console.log('clipboardCopy (external GitHub js) || Copied OK');
			return { Type: 'Copied', Text: text };
		}
		catch (e)
		{
			console.error('clipboardCopy (external GitHub js) || error: ' + e.message);
			return { Type: 'CopyFailed', Reason: e.message };
		}
	}
})();
