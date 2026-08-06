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
			el.style.cssText = 'margin-top:16px;width:450px;max-width:95vw;min-height:60px;font-family:Arial,sans-serif;';
			var pxtgAnchor = document.querySelector(".pxtg-box");
			(pxtgAnchor ? pxtgAnchor.parentNode : document.body).appendChild(el);
		}
		el.innerHTML = '';
		return el;
	}

	// UC74 CommandPalette - dependency-free Ctrl+K-style fuzzy search over
	// all 120 real product names (reuses BuildProductList as-is).
	window.PXTG_Handlers['commandpalette'] = function(pData)
	{
		var products = (pData && pData.Products) ? pData.Products : [];
		console.log('commandPalette (external GitHub js) || products received: ' + products.length);

		var el = pxtgVizContainer();
		el.innerHTML = '<div style="font-weight:bold;margin-bottom:8px;">Paleta de comandos (Ctrl+K) - ' + products.length + ' productos</div>'
			+ '<input type="text" id="pxtg-cmdp-input" placeholder="Buscar producto..." style="width:100%;padding:8px;box-sizing:border-box;border:1px solid #ccc;border-radius:4px;">'
			+ '<div id="pxtg-cmdp-list" style="border:1px solid #ddd;border-radius:4px;margin-top:4px;max-height:220px;overflow-y:auto;"></div>';

		var input = document.getElementById('pxtg-cmdp-input');
		var list = document.getElementById('pxtg-cmdp-list');

		function renderList(filter)
		{
			var f = filter.toLowerCase();
			var matches = products.filter(function(p) { return p.Name.toLowerCase().indexOf(f) >= 0; }).slice(0, 8);
			list.innerHTML = matches.map(function(p)
			{
				return '<div style="display:flex;justify-content:space-between;padding:8px;border-bottom:1px solid #eee;">'
					+ '<span>' + p.Name + '</span><span style="color:#666;">' + p.Category + '</span></div>';
			}).join('');
		}
		renderList('a');
		input.value = 'a';
		input.addEventListener('input', function() { renderList(input.value); });

		console.log('commandPalette (external GitHub js) || palette mounted');

		return { Type: 'Rendered', Products: products.length };
	}
})();
