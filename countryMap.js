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

	var FLAGS = { UY: '🇺🇾', AR: '🇦🇷', BR: '🇧🇷', PY: '🇵🇾', CL: '🇨🇱', ES: '🇪🇸' };

	// Dependency-free country breakdown (bar list) - a lighter-weight stand-in
	// for a full vendored choropleth (jsvectormap + world topology data),
	// avoiding that extra dependency surface for this demo.
	window.PXTG_Handlers['countrymap'] = function(pData)
	{
		var customers = (pData && pData.Customers) ? pData.Customers : [];
		console.log('countryMap (external GitHub js) || customers received: ' + customers.length);

		var byCountry = {};
		for (var i = 0; i < customers.length; i++)
		{
			var iso = (customers[i].Data && customers[i].Data.CountryISO) ? customers[i].Data.CountryISO : '??';
			byCountry[iso] = (byCountry[iso] || 0) + 1;
		}
		var countries = Object.keys(byCountry).sort(function(a, b) { return byCountry[b] - byCountry[a]; });
		var maxCount = countries.length ? byCountry[countries[0]] : 1;
		console.log('countryMap (external GitHub js) || countries: ' + JSON.stringify(byCountry));

		var el = pxtgVizContainer();
		var html = '<div style="font-weight:bold;margin-bottom:8px;">Clientes por pais</div>';
		for (var j = 0; j < countries.length; j++)
		{
			var c = countries[j];
			var n = byCountry[c];
			var pct = Math.round((n / maxCount) * 100);
			html += '<div style="display:flex;align-items:center;margin-bottom:4px;">'
				+ '<span style="width:40px;font-size:18px;">' + (FLAGS[c] || '🏳️') + '</span>'
				+ '<span style="width:30px;">' + c + '</span>'
				+ '<div style="flex:1;background:#eee;border-radius:3px;overflow:hidden;height:16px;">'
				+ '<div style="width:' + pct + '%;background:#2a6f97;height:100%;"></div></div>'
				+ '<span style="width:30px;text-align:right;">' + n + '</span>'
				+ '</div>';
		}
		el.innerHTML = html;

		console.log('countryMap (external GitHub js) || rendered ' + countries.length + ' countries');

		return { Type: 'Rendered', Countries: countries.length };
	}
})();
