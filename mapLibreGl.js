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
			el.style.cssText = 'margin-top:16px;width:800px;max-width:96vw;height:450px;';
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
		s.onerror = function() { console.error('mapLibreGl || failed to load dep: ' + url); };
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

	// UC88 MapLibreGL - second real map library (vs. UC19's Leaflet) over the
	// same real Customer.Data.Lat/Lng values (reuses BuildCustomerList).
	window.PXTG_Handlers['maplibregl'] = function(pData)
	{
		var customers = (pData && pData.Customers) ? pData.Customers : [];
		var withGeo = customers.filter(function(c) { return c.Data && c.Data.Lat && c.Data.Lng; });
		console.log('mapLibreGl (external GitHub js) || customers received: ' + customers.length + ', with geo: ' + withGeo.length);

		pxtgLoadCss('https://cdn.jsdelivr.net/npm/maplibre-gl@3/dist/maplibre-gl.css');
		pxtgLoadScript('https://cdn.jsdelivr.net/npm/maplibre-gl@3/dist/maplibre-gl.js', function()
		{
			try
			{
				var el = pxtgVizContainer();
				var center = withGeo.length ? [Number(withGeo[0].Data.Lng), Number(withGeo[0].Data.Lat)] : [-56.16, -34.9];
				var map = new maplibregl.Map({ container: el, style: 'https://demotiles.maplibre.org/style.json', center: center, zoom: 4 });
				map.on('load', function()
				{
					withGeo.forEach(function(c)
					{
						new maplibregl.Marker().setLngLat([Number(c.Data.Lng), Number(c.Data.Lat)])
							.setPopup(new maplibregl.Popup().setText(c.Name)).addTo(map);
					});
					console.log('mapLibreGl (external GitHub js) || map loaded, markers: ' + withGeo.length);
				});
			}
			catch (e) { console.error('mapLibreGl (external GitHub js) || render error: ' + e.message); }
		});

		return { Type: 'Rendered', Markers: withGeo.length };
	}
})();
