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
			el.style.cssText = 'margin-top:32px;width:500px;max-width:90vw;min-height:80px;font-family:Arial,sans-serif;';
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
		s.onerror = function() { console.error('creditLimitSlider || failed to load dep: ' + url); };
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

	// UC30 NoUiSlider - real range of Customer.Data.CreditLimit values across
	// all customers, rendered as a dual-handle range slider (reuses the same
	// Customer data BuildCustomerList already returns for customermap/countrymap).
	window.PXTG_Handlers['creditlimitslider'] = function(pData)
	{
		var customers = (pData && pData.Customers) ? pData.Customers : [];
		var limits = customers.map(function(c) { return (c.Data && c.Data.CreditLimit) ? Number(c.Data.CreditLimit) : 0; }).filter(function(n) { return n > 0; });
		var min = limits.length ? Math.min.apply(null, limits) : 0;
		var max = limits.length ? Math.max.apply(null, limits) : 1000;
		console.log('creditLimitSlider (external GitHub js) || customers received: ' + customers.length + ', credit limits: ' + limits.length + ', range: ' + min + '-' + max);

		pxtgLoadCss('https://cdn.jsdelivr.net/npm/nouislider@15/dist/nouislider.min.css');
		pxtgLoadScript('https://cdn.jsdelivr.net/npm/nouislider@15/dist/nouislider.min.js', function()
		{
			try
			{
				var el = pxtgVizContainer();
				el.innerHTML = '<div style="font-weight:bold;margin-bottom:20px;">Rango de limite de credito (' + limits.length + ' clientes)</div>'
					+ '<div id="pxtg-noui-slider"></div>';
				var slider = document.getElementById('pxtg-noui-slider');
				noUiSlider.create(slider, {
					start: [min, max],
					connect: true,
					range: { min: min, max: max }
				});
				console.log('creditLimitSlider (external GitHub js) || noUiSlider mounted');
			}
			catch (e) { console.error('creditLimitSlider (external GitHub js) || render error: ' + e.message); }
		});

		return { Type: 'Rendered', Customers: limits.length, Min: min, Max: max };
	}
})();
