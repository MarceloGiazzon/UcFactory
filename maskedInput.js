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

	function pxtgLoadScript(url, cb)
	{
		if (document.querySelector('script[data-pxtg-dep="' + url + '"]')) { cb(); return; }
		var s = document.createElement('script');
		s.src = url;
		s.setAttribute('data-pxtg-dep', url);
		s.onload = cb;
		s.onerror = function() { console.error('maskedInput || failed to load dep: ' + url); };
		document.head.appendChild(s);
	}

	// UC10 IMaskInput - real ProductPrice values loaded into real IMask
	// currency-masked inputs (reuses BuildProductList as-is).
	window.PXTG_Handlers['maskedinput'] = function(pData)
	{
		var products = (pData && pData.Products) ? pData.Products.slice(0, 5) : [];
		console.log('maskedInput (external GitHub js) || products received: ' + (pData && pData.Products ? pData.Products.length : 0) + ', sample: ' + products.length);

		pxtgLoadScript('https://cdn.jsdelivr.net/npm/imask@7/dist/imask.min.js', function()
		{
			try
			{
				var el = pxtgVizContainer();
				var html = '<div style="font-weight:bold;margin-bottom:8px;">Precios (mascara de moneda real)</div>';
				products.forEach(function(p, idx)
				{
					html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">'
						+ '<span style="width:220px;">' + p.Name + '</span>'
						+ '<input id="pxtg-mask-' + idx + '" style="width:120px;text-align:right;padding:4px;">'
						+ '</div>';
				});
				el.innerHTML = html;
				products.forEach(function(p, idx)
				{
					var input = document.getElementById('pxtg-mask-' + idx);
					var mask = IMask(input, { mask: '$num', blocks: { num: { mask: Number, thousandsSeparator: '.', scale: 2, radix: ',' } } });
					mask.value = String(p.Price);
				});
				console.log('maskedInput (external GitHub js) || IMask mounted, inputs: ' + products.length);
			}
			catch (e) { console.error('maskedInput (external GitHub js) || render error: ' + e.message); }
		});

		return { Type: 'Rendered', Inputs: products.length };
	}
})();
