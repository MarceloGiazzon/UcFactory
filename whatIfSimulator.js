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
			el.style.cssText = 'margin-top:16px;width:500px;max-width:95vw;min-height:60px;font-family:Arial,sans-serif;';
			document.body.appendChild(el);
		}
		el.innerHTML = '';
		return el;
	}

	function renderRow(pProduct)
	{
		var price = Number(pProduct.Price) || 0;
		var cost = (pProduct.Data && pProduct.Data.Cost) ? Number(pProduct.Data.Cost) : 0;
		var id = 'whatif_' + pProduct.Name.replace(/[^a-z0-9]/gi, '_');
		return '<div style="margin-bottom:14px;padding:10px;background:#f7f7f7;border-radius:6px;">'
			+ '<div style="font-weight:bold;margin-bottom:4px;">' + pProduct.Name + '</div>'
			+ '<input type="range" id="' + id + '" min="' + Math.round(cost) + '" max="' + Math.round(price * 2) + '" value="' + Math.round(price) + '" style="width:100%;" '
			+ 'oninput="'
			+ "document.getElementById('" + id + "_val').innerText = this.value;"
			+ "var margin = ((this.value - " + cost + ") / this.value * 100).toFixed(1);"
			+ "document.getElementById('" + id + "_margin').innerText = margin + '%';"
			+ "document.getElementById('" + id + "_margin').style.color = margin >= 20 ? '#2a9d8f' : (margin >= 0 ? '#e3a13a' : '#c0392b');"
			+ '">'
			+ '<div style="display:flex;justify-content:space-between;font-size:12px;color:#666;">'
			+ '<span>Costo: $' + cost.toFixed(2) + '</span>'
			+ '<span>Precio: $<span id="' + id + '_val">' + Math.round(price) + '</span></span>'
			+ '<span>Margen: <span id="' + id + '_margin" style="font-weight:bold;color:#2a9d8f;">' + (price > 0 ? ((price - cost) / price * 100).toFixed(1) : 0) + '%</span></span>'
			+ '</div></div>';
	}

	window.PXTG_Handlers['whatifsimulator'] = function(pData)
	{
		var products = (pData && pData.Products) ? pData.Products : [];
		console.log('whatIfSimulator (external GitHub js) || products received: ' + products.length);

		// one representative product per category, first-seen
		var seen = {};
		var sample = [];
		for (var i = 0; i < products.length; i++)
		{
			if (!seen[products[i].Category])
			{
				seen[products[i].Category] = true;
				sample.push(products[i]);
			}
		}
		console.log('whatIfSimulator (external GitHub js) || sample products (1 per category): ' + sample.length);

		var el = pxtgVizContainer();
		el.innerHTML = '<div style="font-weight:bold;margin-bottom:10px;">Simulador de margen (arrastra el precio)</div>'
			+ sample.map(renderRow).join('');

		console.log('whatIfSimulator (external GitHub js) || sliders rendered');

		return { Type: 'Rendered', Products: sample.length };
	}
})();
