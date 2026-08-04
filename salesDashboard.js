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
			el.style.cssText = 'margin-top:16px;width:760px;max-width:95vw;min-height:60px;';
			document.body.appendChild(el);
		}
		el.innerHTML = '';
		return el;
	}

	function pxtgLoadScript(url, cb)
	{
		if (document.querySelector('script[data-pxtg-dep="' + url + '"]')) { cb(); return; }
		var s = document.createElement('script');
		s.src = url;
		s.setAttribute('data-pxtg-dep', url);
		s.onload = cb;
		s.onerror = function() { console.error('salesDashboard || failed to load dep: ' + url); };
		document.head.appendChild(s);
	}

	function buildDailySeries(pInvoices)
	{
		var byDay = {};
		for (var i = 0; i < pInvoices.length; i++)
		{
			var day = (pInvoices[i].Date || '').substring(0, 10);
			if (!day) continue;
			byDay[day] = (byDay[day] || 0) + (Number(pInvoices[i].Total) || 0);
		}
		var days = Object.keys(byDay).sort();
		return { days: days, totals: days.map(function(d) { return Math.round(byDay[d] * 100) / 100; }) };
	}

	window.PXTG_Handlers['salesdashboard'] = function(pData)
	{
		var invoices = (pData && pData.Invoices) ? pData.Invoices : [];
		console.log('salesDashboard (external GitHub js) || invoices received: ' + invoices.length);

		var series = buildDailySeries(invoices);
		console.log('salesDashboard (external GitHub js) || days aggregated: ' + series.days.length);

		pxtgLoadScript('https://cdn.jsdelivr.net/npm/echarts@5/dist/echarts.min.js', function()
		{
			try
			{
				var el = pxtgVizContainer();
				el.style.height = '420px';
				var chart = echarts.init(el);
				chart.setOption({
					title: { text: 'Ventas por dia (Invoice.InvoiceTotal)', left: 'center', textStyle: { fontSize: 14 } },
					tooltip: { trigger: 'axis' },
					xAxis: { type: 'category', data: series.days, axisLabel: { rotate: 60, fontSize: 9 } },
					yAxis: { type: 'value' },
					grid: { bottom: 90 },
					series: [{ type: 'line', data: series.totals, smooth: true, areaStyle: {} }]
				});
				console.log('salesDashboard (external GitHub js) || ECharts rendered, ' + series.days.length + ' points');
			}
			catch (e) { console.error('salesDashboard (external GitHub js) || render error: ' + e.message); }
		});

		return { Type: 'Rendered', Days: series.days.length, TotalSum: Math.round(series.totals.reduce(function(a,b){return a+b;}, 0) * 100) / 100 };
	}
})();
