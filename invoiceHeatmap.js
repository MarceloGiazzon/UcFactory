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
			el.style.cssText = 'margin-top:16px;width:820px;max-width:95vw;min-height:60px;font-family:Arial,sans-serif;';
			var pxtgAnchor = document.querySelector(".pxtg-box");
			(pxtgAnchor ? pxtgAnchor.parentNode : document.body).appendChild(el);
		}
		el.innerHTML = '';
		return el;
	}

	// Dependency-free GitHub-contributions-style grid - no vendored lib.
	window.PXTG_Handlers['invoiceheatmap'] = function(pData)
	{
		var invoices = (pData && pData.Invoices) ? pData.Invoices : [];
		console.log('invoiceHeatmap (external GitHub js) || invoices received: ' + invoices.length);

		var byDay = {};
		var maxCount = 0;
		for (var i = 0; i < invoices.length; i++)
		{
			var day = (invoices[i].Date || '').substring(0, 10);
			if (!day) continue;
			byDay[day] = (byDay[day] || 0) + 1;
			if (byDay[day] > maxCount) maxCount = byDay[day];
		}
		var days = Object.keys(byDay).sort();
		console.log('invoiceHeatmap (external GitHub js) || days aggregated: ' + days.length + ', max/day: ' + maxCount);

		var el = pxtgVizContainer();
		var html = '<div style="font-weight:bold;margin-bottom:6px;">Invoices por dia (' + days.length + ' dias)</div>';
		html += '<div style="display:flex;flex-wrap:wrap;gap:2px;max-width:800px;">';
		for (var j = 0; j < days.length; j++)
		{
			var c = byDay[days[j]];
			var intensity = maxCount > 0 ? c / maxCount : 0;
			var bg = intensity === 0 ? '#ebedf0' : ('rgba(46,160,67,' + (0.25 + intensity * 0.75).toFixed(2) + ')');
			html += '<div title="' + days[j] + ': ' + c + '" style="width:12px;height:12px;background:' + bg + ';border-radius:2px;"></div>';
		}
		html += '</div>';
		el.innerHTML = html;

		console.log('invoiceHeatmap (external GitHub js) || grid rendered');

		return { Type: 'Rendered', Days: days.length, MaxPerDay: maxCount };
	}
})();
