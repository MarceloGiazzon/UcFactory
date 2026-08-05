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
			el.style.cssText = 'margin-top:16px;width:600px;max-width:95vw;min-height:60px;font-family:Arial,sans-serif;';
			var pxtgAnchor = document.querySelector(".pxtg-box");
			(pxtgAnchor ? pxtgAnchor.parentNode : document.body).appendChild(el);
		}
		el.innerHTML = '';
		return el;
	}

	// Dependency-free category x unit matrix (Canvas/D3-free cross-tab) -
	// generalizes the calendar-only heatmap (UC23) to an arbitrary pair of
	// business dimensions, per UC107's own "beyond calendar" premise.
	window.PXTG_Handlers['multidimheatmap'] = function(pData)
	{
		var products = (pData && pData.Products) ? pData.Products : [];
		console.log('multiDimHeatmap (external GitHub js) || products received: ' + products.length);

		var cells = {};
		var maxCell = 0;
		var units = {};
		for (var i = 0; i < products.length; i++)
		{
			var cat = products[i].Category;
			var unit = (products[i].Data && products[i].Data.Unit) ? products[i].Data.Unit : '?';
			units[unit] = true;
			var key = cat + '|' + unit;
			cells[key] = (cells[key] || 0) + 1;
			if (cells[key] > maxCell) maxCell = cells[key];
		}
		var cats = Object.keys(products.reduce(function(acc, p) { acc[p.Category] = true; return acc; }, {})).sort();
		var unitList = Object.keys(units).sort();
		console.log('multiDimHeatmap (external GitHub js) || dims: ' + cats.length + ' categories x ' + unitList.length + ' units');

		var el = pxtgVizContainer();
		var html = '<div style="font-weight:bold;margin-bottom:8px;">Productos: Categoria x Unidad</div>';
		html += '<table style="border-collapse:collapse;font-size:12px;">';
		html += '<tr><td></td>' + unitList.map(function(u) { return '<td style="padding:4px 8px;font-weight:bold;">' + u + '</td>'; }).join('') + '</tr>';
		cats.forEach(function(cat)
		{
			html += '<tr><td style="padding:4px 8px;font-weight:bold;white-space:nowrap;">' + cat + '</td>';
			unitList.forEach(function(unit)
			{
				var v = cells[cat + '|' + unit] || 0;
				var intensity = maxCell > 0 ? v / maxCell : 0;
				var bg = v === 0 ? '#f5f5f5' : ('rgba(42,111,151,' + (0.15 + intensity * 0.85).toFixed(2) + ')');
				var color = intensity > 0.6 ? '#fff' : '#333';
				html += '<td style="padding:8px 12px;text-align:center;background:' + bg + ';color:' + color + ';">' + (v || '') + '</td>';
			});
			html += '</tr>';
		});
		html += '</table>';
		el.innerHTML = html;

		console.log('multiDimHeatmap (external GitHub js) || matrix rendered');

		return { Type: 'Rendered', Categories: cats.length, Units: unitList.length };
	}
})();
