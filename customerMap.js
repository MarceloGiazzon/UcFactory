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
		s.onerror = function() { console.error('customerMap || failed to load dep: ' + url); };
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

	window.PXTG_Handlers['customermap'] = function(pData)
	{
		var customers = (pData && pData.Customers) ? pData.Customers : [];
		console.log('customerMap (external GitHub js) || customers received: ' + customers.length);

		pxtgLoadCss('https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css');
		pxtgLoadScript('https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js', function()
		{
			try
			{
				var el = pxtgVizContainer();
				el.style.height = '480px';
				var map = L.map(el).setView([-34.90, -56.16], 11);
				L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
					attribution: '&copy; OpenStreetMap contributors', maxZoom: 18
				}).addTo(map);

				var plotted = 0;
				for (var i = 0; i < customers.length; i++)
				{
					var d = customers[i].Data || {};
					if (!d.Lat || !d.Lng) continue;
					var marker = L.circleMarker([d.Lat, d.Lng], {
						radius: 6, color: d.BrandColor || '#2a6f97', fillOpacity: 0.8
					}).addTo(map);
					marker.bindPopup('<b>' + customers[i].Name + '</b><br>Puntos: ' + (d.Points || 0)
						+ '<br>Credito: $' + (d.CreditLimit || 0) + '<br>' + (d.Address || ''));
					plotted++;
				}
				console.log('customerMap (external GitHub js) || markers plotted: ' + plotted);
			}
			catch (e) { console.error('customerMap (external GitHub js) || render error: ' + e.message); }
		});

		return { Type: 'Rendered', Customers: customers.length };
	}
})();
