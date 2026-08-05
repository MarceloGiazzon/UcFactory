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
			el.style.cssText = 'margin-top:16px;width:760px;max-width:95vw;min-height:60px;font-family:Arial,sans-serif;';
			var pxtgAnchor = document.querySelector(".pxtg-box");
			(pxtgAnchor ? pxtgAnchor.parentNode : document.body).appendChild(el);
		}
		el.innerHTML = '';
		return el;
	}

	// Custom CSS conic-gradient gauge - no vendored instrument-cluster library.
	function gaugeHtml(pLabel, pValue, pMax, pUnit, pColor)
	{
		var pct = Math.max(0, Math.min(1, pValue / pMax));
		var deg = Math.round(pct * 360);
		return '<div style="text-align:center;flex:1;">'
			+ '<div style="width:140px;height:140px;border-radius:50%;margin:0 auto;'
			+ 'background:conic-gradient(' + pColor + ' ' + deg + 'deg, #e0e0e0 ' + deg + 'deg);'
			+ 'display:flex;align-items:center;justify-content:center;">'
			+ '<div style="width:105px;height:105px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;flex-direction:column;">'
			+ '<div style="font-size:18px;font-weight:bold;">' + pValue + pUnit + '</div>'
			+ '</div></div>'
			+ '<div style="margin-top:6px;font-size:13px;color:#555;">' + pLabel + '</div></div>';
	}

	window.PXTG_Handlers['margingauge'] = function(pData)
	{
		var d = pData || {};
		console.log('marginGauge (external GitHub js) || input: ' + JSON.stringify(d));

		var el = pxtgVizContainer();
		var html = '<div style="display:flex;gap:12px;">'
			+ gaugeHtml('Ingresos totales', Math.round(d.TotalRevenue || 0), Math.max(d.TotalRevenue || 1, 1) * 1.15, '', '#2a6f97')
			+ gaugeHtml('Ticket promedio', Math.round(d.AvgInvoice || 0), Math.max(d.AvgInvoice || 1, 1) * 1.6, '', '#2a9d8f')
			+ gaugeHtml('Productos activos', d.ActiveProducts || 0, d.TotalProducts || 1, '/' + (d.TotalProducts || 0), '#e3a13a')
			+ '</div>';
		el.innerHTML = html;

		console.log('marginGauge (external GitHub js) || gauges rendered');

		return { Type: 'Rendered', TotalRevenue: d.TotalRevenue, AvgInvoice: d.AvgInvoice, ActiveProducts: d.ActiveProducts };
	}
})();
