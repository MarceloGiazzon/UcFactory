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
			el.style.cssText = 'margin-top:16px;width:900px;max-width:97vw;min-height:60px;font-family:Arial,sans-serif;';
			var pxtgAnchor = document.querySelector(".pxtg-box");
			(pxtgAnchor ? pxtgAnchor.parentNode : document.body).appendChild(el);
		}
		el.innerHTML = '';
		return el;
	}

	var COLUMNS = ['Draft', 'Pending', 'Paid', 'Delivered', 'Void'];
	var COLORS  = { Draft: '#999', Pending: '#e3a13a', Paid: '#2a9d8f', Delivered: '#2a6f97', Void: '#c0392b' };

	// Static (non-drag) kanban board - the data-consumption story doesn't need
	// reordering interaction, so no vendored drag lib is loaded.
	window.PXTG_Handlers['invoicekanban'] = function(pData)
	{
		var invoices = (pData && pData.Invoices) ? pData.Invoices : [];
		console.log('invoiceKanban (external GitHub js) || invoices received: ' + invoices.length);

		var byStatus = {};
		COLUMNS.forEach(function(c) { byStatus[c] = []; });
		for (var i = 0; i < invoices.length; i++)
		{
			// InvoiceStatus is a fixed-length GX Character(15), so the raw JSON
			// value arrives right-padded with spaces ("Paid           ") - trim
			// before matching against the column keys.
			var s = (invoices[i].Status || '').trim();
			if (byStatus[s]) byStatus[s].push(invoices[i]);
		}
		console.log('invoiceKanban (external GitHub js) || column counts: ' + COLUMNS.map(function(c){return c+'='+byStatus[c].length;}).join(', '));

		var el = pxtgVizContainer();
		var html = '<div style="display:flex;gap:8px;">';
		COLUMNS.forEach(function(col)
		{
			html += '<div style="flex:1;background:#f4f4f4;border-radius:6px;padding:6px;min-width:0;">'
				+ '<div style="font-weight:bold;color:' + COLORS[col] + ';border-bottom:2px solid ' + COLORS[col] + ';padding-bottom:4px;margin-bottom:6px;">'
				+ col + ' (' + byStatus[col].length + ')</div>';
			byStatus[col].slice(0, 8).forEach(function(inv)
			{
				html += '<div style="background:#fff;border-radius:4px;padding:6px;margin-bottom:5px;box-shadow:0 1px 2px rgba(0,0,0,.15);font-size:11px;">'
					+ '<div style="font-weight:bold;">' + inv.Number + '</div>'
					+ '<div>$' + Number(inv.Total).toFixed(2) + '</div></div>';
			});
			if (byStatus[col].length > 8) html += '<div style="font-size:11px;color:#888;">+' + (byStatus[col].length - 8) + ' mas</div>';
			html += '</div>';
		});
		html += '</div>';
		el.innerHTML = html;

		console.log('invoiceKanban (external GitHub js) || board rendered');

		return { Type: 'Rendered', Columns: COLUMNS.map(function(c) { return { Status: c, Count: byStatus[c].length }; }) };
	}
})();
