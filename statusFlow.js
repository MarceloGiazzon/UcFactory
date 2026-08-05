(function()
{
	window.PXTG_Handlers = window.PXTG_Handlers || {};

	function pxtgVizContainer()
	{
		var el = document.getElementById('pxtg-viz');
		if (!el)
		{
			el = document.createElement('div');
			el.id = 'pxtg-viz';
			el.style.cssText = 'margin-top:16px;width:700px;max-width:95vw;min-height:60px;';
			var pxtgAnchor = document.querySelector(".pxtg-box");
			(pxtgAnchor ? pxtgAnchor.parentNode : document.body).appendChild(el);
		}
		el.innerHTML = '<pre class="mermaid" id="pxtg-mermaid"></pre>';
		return el;
	}

	function pxtgLoadScript(url, cb)
	{
		if (document.querySelector('script[data-pxtg-dep="' + url + '"]')) { cb(); return; }
		var s = document.createElement('script');
		s.src = url;
		s.setAttribute('data-pxtg-dep', url);
		s.onload = cb;
		s.onerror = function() { console.error('statusFlow || failed to load dep: ' + url); };
		document.head.appendChild(s);
	}

	// UC54 MermaidDiagrams - real invoice-status pipeline with real per-status
	// counts, aggregated client-side from BuildInvoiceKanban's raw Invoices
	// array (same {Number,Status,Total} rows invoiceKanban.js consumes -
	// Status is a fixed-length Character(15), so trim before counting).
	window.PXTG_Handlers['statusflow'] = function(pData)
	{
		var invoices = (pData && pData.Invoices) ? pData.Invoices : [];
		console.log('statusFlow (external GitHub js) || invoices received: ' + invoices.length);

		var byStatus = {};
		invoices.forEach(function(inv)
		{
			var s = (inv.Status || '').trim();
			byStatus[s] = (byStatus[s] || 0) + 1;
		});
		console.log('statusFlow (external GitHub js) || status counts: ' + JSON.stringify(byStatus));

		var def = 'flowchart LR\n'
			+ 'Draft["Draft (' + (byStatus['Draft'] || 0) + ')"] --> Pending["Pending (' + (byStatus['Pending'] || 0) + ')"]\n'
			+ 'Pending --> Paid["Paid (' + (byStatus['Paid'] || 0) + ')"]\n'
			+ 'Paid --> Delivered["Delivered (' + (byStatus['Delivered'] || 0) + ')"]\n'
			+ 'Draft --> Void["Void (' + (byStatus['Void'] || 0) + ')"]\n'
			+ 'Pending --> Void';

		pxtgLoadScript('https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js', function()
		{
			try
			{
				var el = pxtgVizContainer();
				document.getElementById('pxtg-mermaid').textContent = def;
				mermaid.initialize({ startOnLoad: false });
				mermaid.run({ nodes: [document.getElementById('pxtg-mermaid')] });
				console.log('statusFlow (external GitHub js) || Mermaid rendered');
			}
			catch (e) { console.error('statusFlow (external GitHub js) || render error: ' + e.message); }
		});

		return { Type: 'Rendered', Statuses: Object.keys(byStatus).length };
	}
})();
