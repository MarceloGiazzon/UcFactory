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
			el.style.cssText = 'margin-top:16px;width:700px;max-width:95vw;min-height:60px;';
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
		s.onerror = function() { console.error('productCarousel || failed to load dep: ' + url); };
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

	// UC17 SplideCarousel - featured-products carousel, one slide per product
	// with a real ImageUrl (reuses the same Product data BuildProductList
	// already returns for apexcharts/multidimheatmap/whatifsimulator).
	window.PXTG_Handlers['productcarousel'] = function(pData)
	{
		var products = (pData && pData.Products) ? pData.Products : [];
		var withImages = products.filter(function(p) { return p.Data && p.Data.ImageUrl; }).slice(0, 10);
		console.log('productCarousel (external GitHub js) || products received: ' + products.length + ', with image: ' + withImages.length);

		pxtgLoadCss('https://cdn.jsdelivr.net/npm/@splidejs/splide@4/dist/css/splide.min.css');
		pxtgLoadScript('https://cdn.jsdelivr.net/npm/@splidejs/splide@4/dist/js/splide.min.js', function()
		{
			try
			{
				var el = pxtgVizContainer();
				var html = '<div id="pxtg-splide" class="splide"><div class="splide__track"><ul class="splide__list">';
				withImages.forEach(function(p)
				{
					html += '<li class="splide__slide"><div style="text-align:center;">'
						+ '<img src="' + p.Data.ImageUrl + '" style="height:220px;object-fit:cover;border-radius:6px;">'
						+ '<div style="margin-top:6px;font-weight:bold;">' + p.Name + ' ($' + Number(p.Price).toFixed(2) + ')</div>'
						+ '</div></li>';
				});
				html += '</ul></div></div>';
				el.innerHTML = html;
				new Splide('#pxtg-splide', { perPage: 3, gap: '1rem', pagination: false }).mount();
				console.log('productCarousel (external GitHub js) || Splide mounted, slides: ' + withImages.length);
			}
			catch (e) { console.error('productCarousel (external GitHub js) || render error: ' + e.message); }
		});

		return { Type: 'Rendered', Slides: withImages.length };
	}
})();
