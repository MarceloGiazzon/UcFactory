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
			el.style.cssText = 'margin-top:16px;width:500px;max-width:95vw;min-height:60px;';
			var pxtgAnchor = document.querySelector(".pxtg-box");
			(pxtgAnchor ? pxtgAnchor.parentNode : document.body).appendChild(el);
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
		s.onerror = function() { console.error('lowStockAlert || failed to load dep: ' + url); };
		document.head.appendChild(s);
	}

	// UC34 SweetAlert2Dialogs - real low-stock products (reuses BuildAlarmWall's
	// LowStock array, already proven correct data) in a SweetAlert2 confirm dialog.
	window.PXTG_Handlers['lowstockalert'] = function(pData)
	{
		var lowStock = (pData && pData.LowStock) ? pData.LowStock : [];
		console.log('lowStockAlert (external GitHub js) || low-stock products received: ' + lowStock.length);

		pxtgLoadScript('https://cdn.jsdelivr.net/npm/sweetalert2@11', function()
		{
			try
			{
				pxtgVizContainer();
				var list = lowStock.map(function(p) { return p.Name + ' (' + p.Category + '): ' + Number(p.Stock).toFixed(0) + ' un.'; }).join('<br>');
				Swal.fire({
					icon: 'warning',
					title: 'Stock bajo (' + lowStock.length + ' productos)',
					html: list || '(ninguno)',
					confirmButtonText: 'Entendido'
				});
				console.log('lowStockAlert (external GitHub js) || SweetAlert2 shown');
			}
			catch (e) { console.error('lowStockAlert (external GitHub js) || render error: ' + e.message); }
		});

		return { Type: 'Rendered', LowStockCount: lowStock.length };
	}
})();
