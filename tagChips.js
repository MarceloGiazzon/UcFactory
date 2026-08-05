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
			el.style.cssText = 'margin-top:16px;width:600px;max-width:95vw;min-height:60px;font-family:Arial,sans-serif;';
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
		s.onerror = function() { console.error('tagChips || failed to load dep: ' + url); };
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

	// UC29 TagifyChips - real Product.Data.Tags rendered as an editable chip
	// input (Tagify), one instance per product with tags, first product with
	// a non-empty Tags array picked from the same BuildProductList payload.
	window.PXTG_Handlers['tagchips'] = function(pData)
	{
		var products = (pData && pData.Products) ? pData.Products : [];
		var withTags = products.filter(function(p) { return p.Data && Array.isArray(p.Data.Tags) && p.Data.Tags.length > 0; });
		console.log('tagChips (external GitHub js) || products received: ' + products.length + ', with tags: ' + withTags.length);

		var picked = withTags[0] || { Name: '(none)', Data: { Tags: [] } };

		pxtgLoadCss('https://cdn.jsdelivr.net/npm/@yaireo/tagify/dist/tagify.css');
		pxtgLoadScript('https://cdn.jsdelivr.net/npm/@yaireo/tagify', function()
		{
			try
			{
				var el = pxtgVizContainer();
				el.innerHTML = '<div style="font-weight:bold;margin-bottom:8px;">' + picked.Name + ' - tags</div>'
					+ '<input id="pxtg-tagify-input" value="' + picked.Data.Tags.join(',') + '">';
				new Tagify(document.getElementById('pxtg-tagify-input'));
				console.log('tagChips (external GitHub js) || Tagify mounted, tags: ' + picked.Data.Tags.length);
			}
			catch (e) { console.error('tagChips (external GitHub js) || render error: ' + e.message); }
		});

		return { Type: 'Rendered', Product: picked.Name, Tags: picked.Data.Tags.length };
	}
})();
