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
			var pxtgAnchor = document.querySelector(".pxtg-box");
			(pxtgAnchor ? pxtgAnchor.parentNode : document.body).appendChild(el);
		}
		el.innerHTML = '';
		return el;
	}

	// UC60 AddressAutocomplete - dependency-free typeahead over the real
	// Customer.Data.Address values already in the seed data (no external
	// geocoding API/key involved - the "autocomplete" candidate list is the
	// KB's own real address strings, same data-consumption story as every
	// other handler, just no vendored library since the value here is the
	// interaction pattern, not a specific geocoder).
	window.PXTG_Handlers['addressautocomplete'] = function(pData)
	{
		var customers = (pData && pData.Customers) ? pData.Customers : [];
		var addresses = customers.filter(function(c) { return c.Data && c.Data.Address; })
			.map(function(c) { return c.Data.Address; });
		console.log('addressAutocomplete (external GitHub js) || customers received: ' + customers.length + ', addresses: ' + addresses.length);

		var el = pxtgVizContainer();
		el.innerHTML = '<div style="font-weight:bold;margin-bottom:8px;">Buscar direccion (' + addresses.length + ' reales)</div>'
			+ '<input type="text" id="pxtg-addr-input" placeholder="Escriba para buscar..." style="width:100%;padding:6px;box-sizing:border-box;">'
			+ '<div id="pxtg-addr-list" style="border:1px solid #ddd;border-radius:4px;margin-top:4px;max-height:180px;overflow-y:auto;"></div>';

		var input = document.getElementById('pxtg-addr-input');
		var list = document.getElementById('pxtg-addr-list');

		function renderList(filter)
		{
			var matches = addresses.filter(function(a) { return a.toLowerCase().indexOf(filter.toLowerCase()) >= 0; }).slice(0, 8);
			list.innerHTML = matches.map(function(a) { return '<div style="padding:6px;border-bottom:1px solid #eee;cursor:pointer;">' + a + '</div>'; }).join('');
		}
		renderList('');
		input.addEventListener('input', function() { renderList(input.value); });

		console.log('addressAutocomplete (external GitHub js) || typeahead mounted');

		return { Type: 'Rendered', Addresses: addresses.length };
	}
})();
