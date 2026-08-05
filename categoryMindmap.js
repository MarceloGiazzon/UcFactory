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
			el.style.cssText = 'margin-top:16px;width:900px;max-width:97vw;min-height:400px;';
			var pxtgAnchor = document.querySelector(".pxtg-box");
			(pxtgAnchor ? pxtgAnchor.parentNode : document.body).appendChild(el);
		}
		el.innerHTML = '<svg id="pxtg-markmap" style="width:100%;height:400px;"></svg>';
		return el;
	}

	function pxtgLoadScript(url, cb)
	{
		if (document.querySelector('script[data-pxtg-dep="' + url + '"]')) { cb(); return; }
		var s = document.createElement('script');
		s.src = url;
		s.setAttribute('data-pxtg-dep', url);
		s.onload = cb;
		s.onerror = function() { console.error('categoryMindmap || failed to load dep: ' + url); };
		document.head.appendChild(s);
	}

	// Dynamically-created <script> tags default to async=true, so loading
	// multiple interdependent CDN bundles via a parallel forEach does not
	// guarantee execution order (markmap-view's UMD footer references a bare
	// `d3` global that must already exist). Chain them strictly sequentially.
	function loadChain(urls, cb)
	{
		if (urls.length === 0) { cb(); return; }
		pxtgLoadScript(urls[0], function() { loadChain(urls.slice(1), cb); });
	}

	// UC93 MarkmapMindmap - real Category -> Product hierarchy built from the
	// same full Product list BuildProductList already returns.
	window.PXTG_Handlers['categorymindmap'] = function(pData)
	{
		var products = (pData && pData.Products) ? pData.Products : [];
		console.log('categoryMindmap (external GitHub js) || products received: ' + products.length);

		var byCategory = {};
		products.forEach(function(p)
		{
			if (!byCategory[p.Category]) byCategory[p.Category] = [];
			byCategory[p.Category].push(p.Name);
		});
		var categories = Object.keys(byCategory);

		var md = '# Products\n';
		categories.forEach(function(cat)
		{
			md += '## ' + cat + '\n';
			byCategory[cat].forEach(function(name) { md += '- ' + name + '\n'; });
		});

		loadChain([
			'https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js',
			'https://cdn.jsdelivr.net/npm/markmap-lib@0.15/dist/browser/index.js',
			'https://cdn.jsdelivr.net/npm/markmap-view@0.15/dist/browser/index.js'
		], function()
		{
			try
			{
				var el = pxtgVizContainer();
				var svgEl = document.getElementById('pxtg-markmap');
				var transformer = new markmap.Transformer();
				var result = transformer.transform(md);
				markmap.Markmap.create(svgEl, null, result.root);
				console.log('categoryMindmap (external GitHub js) || Markmap rendered, categories: ' + categories.length);
			}
			catch (e) { console.error('categoryMindmap (external GitHub js) || render error: ' + e.message); }
		});

		return { Type: 'Rendered', Categories: categories.length, Products: products.length };
	}
})();
