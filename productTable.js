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
			el.style.cssText = 'margin-top:16px;width:900px;max-width:97vw;min-height:60px;';
			var pxtgAnchor = document.querySelector(".pxtg-box");
			(pxtgAnchor ? pxtgAnchor.parentNode : document.body).appendChild(el);
		}
		el.innerHTML = '<div id="pxtg-tabulator"></div>';
		return el;
	}

	function pxtgLoadScript(url, cb)
	{
		if (document.querySelector('script[data-pxtg-dep="' + url + '"]')) { cb(); return; }
		var s = document.createElement('script');
		s.src = url;
		s.setAttribute('data-pxtg-dep', url);
		s.onload = cb;
		s.onerror = function() { console.error('productTable || failed to load dep: ' + url); };
		document.head.appendChild(s);
	}

	function pxtgLoadCss(url)
	{
		if (document.querySelector('link[data-pxtg-dep="' + url + '"]')) return;
		var l = document.createElement('link');
		l.rel = 'stylesheet';
		l.href = url;
		l.setAttribute('data-pxtg-dep', url);
		document.head.appendChild(l);
	}

	// UC27 TabulatorGrid - all 120 real products (Name/Category/Price/Stock/
	// Active) in a sortable, filterable Tabulator grid.
	window.PXTG_Handlers['producttable'] = function(pData)
	{
		var products = (pData && pData.Products) ? pData.Products : [];
		console.log('productTable (external GitHub js) || products received: ' + products.length);

		pxtgLoadCss('https://cdn.jsdelivr.net/npm/tabulator-tables@5/dist/css/tabulator.min.css');
		pxtgLoadScript('https://cdn.jsdelivr.net/npm/tabulator-tables@5/dist/js/tabulator.min.js', function()
		{
			try
			{
				pxtgVizContainer();
				new Tabulator('#pxtg-tabulator', {
					data: products,
					layout: 'fitColumns',
					height: '400px',
					columns: [
						{ title: 'Name', field: 'Name', headerFilter: true },
						{ title: 'Category', field: 'Category', headerFilter: true },
						{ title: 'Price', field: 'Price', formatter: 'money', formatterParams: { symbol: '$' }, sorter: 'number' },
						{ title: 'Stock', field: 'Stock', sorter: 'number' },
						{ title: 'Active', field: 'Active', formatter: 'tickCross' }
					]
				});
				console.log('productTable (external GitHub js) || Tabulator mounted, rows: ' + products.length);
			}
			catch (e) { console.error('productTable (external GitHub js) || render error: ' + e.message); }
		});

		return { Type: 'Rendered', Rows: products.length };
	}
})();
