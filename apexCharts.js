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
		s.onerror = function() { console.error('apexCharts || failed to load dep: ' + url); };
		document.head.appendChild(s);
	}

	window.PXTG_Handlers['apexcharts'] = function(pData)
	{
		var products = (pData && pData.Products) ? pData.Products : [];
		console.log('apexCharts (external GitHub js) || products received: ' + products.length);

		var byCat = {};
		for (var i = 0; i < products.length; i++)
		{
			var c = products[i].Category;
			if (!byCat[c]) byCat[c] = { sum: 0, count: 0 };
			byCat[c].sum += Number(products[i].Price) || 0;
			byCat[c].count += 1;
		}
		var cats = Object.keys(byCat).sort();
		var avgPrices = cats.map(function(c) { return Math.round((byCat[c].sum / byCat[c].count) * 100) / 100; });
		var counts = cats.map(function(c) { return byCat[c].count; });
		console.log('apexCharts (external GitHub js) || categories aggregated: ' + cats.length);

		pxtgLoadScript('https://cdn.jsdelivr.net/npm/apexcharts@3/dist/apexcharts.min.js', function()
		{
			try
			{
				var el = pxtgVizContainer();
				var chart = new ApexCharts(el, {
					chart: { type: 'bar', height: 380 },
					title: { text: 'Precio promedio por categoria (Product)' },
					series: [
						{ name: 'Precio promedio', data: avgPrices },
						{ name: 'Cantidad de productos', data: counts }
					],
					xaxis: { categories: cats, labels: { rotate: -45 } },
					yaxis: [{ title: { text: '$' } }]
				});
				chart.render();
				console.log('apexCharts (external GitHub js) || ApexCharts rendered, ' + cats.length + ' categories');
			}
			catch (e) { console.error('apexCharts (external GitHub js) || render error: ' + e.message); }
		});

		return { Type: 'Rendered', Categories: cats.length };
	}
})();
