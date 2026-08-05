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
			el.style.cssText = 'margin-top:16px;width:900px;max-width:97vw;height:450px;';
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
		s.onerror = function() { console.error('customerNetwork || failed to load dep: ' + url); };
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

	// UC25 VisNetworkGraph - real Customer <-> segment-Tag network built from
	// Customer.Data.Tags (reuses BuildCustomerList's full payload).
	window.PXTG_Handlers['customernetwork'] = function(pData)
	{
		var customers = (pData && pData.Customers) ? pData.Customers : [];
		console.log('customerNetwork (external GitHub js) || customers received: ' + customers.length);

		var nodes = [];
		var edges = [];
		var tagIds = {};
		var nextId = 1;

		customers.forEach(function(c)
		{
			var custId = nextId++;
			nodes.push({ id: custId, label: c.Name, shape: 'dot', color: '#4a7dbd', size: 10 });
			var tags = (c.Data && Array.isArray(c.Data.Tags)) ? c.Data.Tags : [];
			tags.forEach(function(tag)
			{
				if (!tagIds[tag])
				{
					tagIds[tag] = nextId++;
					nodes.push({ id: tagIds[tag], label: tag, shape: 'box', color: '#e3a13a' });
				}
				edges.push({ from: custId, to: tagIds[tag] });
			});
		});
		console.log('customerNetwork (external GitHub js) || nodes: ' + nodes.length + ', edges: ' + edges.length + ', distinct tags: ' + Object.keys(tagIds).length);

		pxtgLoadScript('https://cdn.jsdelivr.net/npm/vis-network@9/standalone/umd/vis-network.min.js', function()
		{
			try
			{
				var el = pxtgVizContainer();
				new vis.Network(el, { nodes: new vis.DataSet(nodes), edges: new vis.DataSet(edges) }, { physics: { stabilization: true } });
				console.log('customerNetwork (external GitHub js) || vis-network mounted');
			}
			catch (e) { console.error('customerNetwork (external GitHub js) || render error: ' + e.message); }
		});

		return { Type: 'Rendered', Customers: customers.length, Tags: Object.keys(tagIds).length };
	}
})();
