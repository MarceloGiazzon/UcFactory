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

	function pxtgLoadScript(url, cb)
	{
		if (document.querySelector('script[data-pxtg-dep="' + url + '"]')) { cb(); return; }
		var s = document.createElement('script');
		s.src = url;
		s.setAttribute('data-pxtg-dep', url);
		s.onload = cb;
		s.onerror = function() { console.error('colorPicker || failed to load dep: ' + url); };
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

	// UC08 ColorisPicker - real Product.Data.Color swatches (one per
	// category, first-seen) wired to an actual Coloris color picker input.
	window.PXTG_Handlers['colorpicker'] = function(pData)
	{
		var products = (pData && pData.Products) ? pData.Products : [];
		var seen = {};
		var sample = [];
		for (var i = 0; i < products.length; i++)
		{
			var cat = products[i].Category;
			if (!seen[cat] && products[i].Data && products[i].Data.Color)
			{
				seen[cat] = true;
				sample.push(products[i]);
			}
		}
		console.log('colorPicker (external GitHub js) || products received: ' + products.length + ', sample (1/category with color): ' + sample.length);

		pxtgLoadCss('https://cdn.jsdelivr.net/gh/mdbassit/Coloris@main/dist/coloris.min.css');
		pxtgLoadScript('https://cdn.jsdelivr.net/gh/mdbassit/Coloris@main/dist/coloris.min.js', function()
		{
			try
			{
				var el = pxtgVizContainer();
				var html = '<div style="font-weight:bold;margin-bottom:8px;">Colores por categoria</div>';
				sample.forEach(function(p, idx)
				{
					html += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">'
						+ '<span style="width:120px;">' + p.Category + '</span>'
						+ '<input class="coloris" type="text" id="pxtg-color-' + idx + '" value="' + p.Data.Color + '">'
						+ '</div>';
				});
				el.innerHTML = html;
				Coloris({ el: '.coloris' });
				console.log('colorPicker (external GitHub js) || Coloris mounted, swatches: ' + sample.length);
			}
			catch (e) { console.error('colorPicker (external GitHub js) || render error: ' + e.message); }
		});

		return { Type: 'Rendered', Swatches: sample.length };
	}
})();
