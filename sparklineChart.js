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
			el.style.cssText = 'margin-top:16px;width:340px;max-width:95vw;min-height:60px;font-family:Arial,sans-serif;';
			document.body.appendChild(el);
		}
		el.innerHTML = '';
		return el;
	}

	// Dependency-free inline SVG sparkline (<3KB spec) - no axes/legend/grid by
	// design, matching UC28's own "too small for a real chart lib" rationale.
	function buildSparklineSvg(pValues, pWidth, pHeight)
	{
		if (pValues.length < 2) return '';
		var min = Math.min.apply(null, pValues);
		var max = Math.max.apply(null, pValues);
		var range = (max - min) || 1;
		var stepX = pWidth / (pValues.length - 1);
		var points = pValues.map(function(v, i)
		{
			var x = Math.round(i * stepX);
			var y = Math.round(pHeight - ((v - min) / range) * pHeight);
			return x + ',' + y;
		}).join(' ');
		var lastX = Math.round((pValues.length - 1) * stepX);
		var lastY = Math.round(pHeight - ((pValues[pValues.length - 1] - min) / range) * pHeight);
		return '<svg width="' + pWidth + '" height="' + pHeight + '" viewBox="0 0 ' + pWidth + ' ' + pHeight + '">'
			+ '<polyline fill="none" stroke="#2a6f97" stroke-width="1.5" points="' + points + '"/>'
			+ '<circle cx="' + lastX + '" cy="' + lastY + '" r="3" fill="#e3a13a"/>'
			+ '</svg>';
	}

	window.PXTG_Handlers['sparkline'] = function(pData)
	{
		var invoices = (pData && pData.Invoices) ? pData.Invoices : [];
		console.log('sparklineChart (external GitHub js) || invoices received: ' + invoices.length);

		var byDay = {};
		for (var i = 0; i < invoices.length; i++)
		{
			var day = (invoices[i].Date || '').substring(0, 10);
			if (!day) continue;
			byDay[day] = (byDay[day] || 0) + (Number(invoices[i].Total) || 0);
		}
		var days = Object.keys(byDay).sort();
		var last30 = days.slice(-30);
		var values = last30.map(function(d) { return Math.round(byDay[d] * 100) / 100; });
		console.log('sparklineChart (external GitHub js) || days in sparkline: ' + values.length);

		var el = pxtgVizContainer();
		var svg = buildSparklineSvg(values, 300, 40);
		el.innerHTML = '<div style="font-size:12px;color:#666;margin-bottom:4px;">Ventas - ultimos ' + values.length + ' dias</div>'
			+ svg
			+ '<div style="font-size:11px;color:#888;margin-top:2px;">' + (last30[0] || '') + ' &rarr; ' + (last30[last30.length - 1] || '') + '</div>';

		console.log('sparklineChart (external GitHub js) || sparkline rendered');

		return { Type: 'Rendered', Points: values.length };
	}
})();
