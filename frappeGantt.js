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
			el.style.cssText = 'margin-top:16px;width:900px;max-width:97vw;min-height:60px;';
			document.body.appendChild(el);
		}
		el.innerHTML = '<svg id="pxtg-gantt-svg"></svg>';
		return el;
	}

	function pxtgLoadScript(url, cb)
	{
		if (document.querySelector('script[data-pxtg-dep="' + url + '"]')) { cb(); return; }
		var s = document.createElement('script');
		s.src = url;
		s.setAttribute('data-pxtg-dep', url);
		s.onload = cb;
		s.onerror = function() { console.error('frappeGantt || failed to load dep: ' + url); };
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

	window.PXTG_Handlers['frappegantt'] = function(pData)
	{
		var invoices = (pData && pData.Invoices) ? pData.Invoices : [];
		console.log('frappeGantt (external GitHub js) || invoices received: ' + invoices.length);

		var recent = invoices.slice().sort(function(a, b) { return a.Start < b.Start ? 1 : -1; }).slice(0, 20);
		console.log('frappeGantt (external GitHub js) || tasks selected: ' + recent.length);

		pxtgLoadCss('https://cdn.jsdelivr.net/npm/frappe-gantt@0.6.1/dist/frappe-gantt.css');
		pxtgLoadScript('https://cdn.jsdelivr.net/npm/frappe-gantt@0.6.1/dist/frappe-gantt.min.js', function()
		{
			try
			{
				var el = pxtgVizContainer();
				var tasks = recent.map(function(inv, idx)
				{
					var start = inv.Start;
					var end = inv.End >= inv.Start ? inv.End : inv.Start;
					return { id: 'inv' + idx, name: inv.Number + ' ($' + Number(inv.Total).toFixed(0) + ')', start: start, end: end, progress: inv.End > inv.Start ? 50 : 100 };
				});
				new Gantt('#pxtg-gantt-svg', tasks, { view_mode: 'Day' });
				console.log('frappeGantt (external GitHub js) || Gantt rendered, tasks: ' + tasks.length);
			}
			catch (e) { console.error('frappeGantt (external GitHub js) || render error: ' + e.message); }
		});

		return { Type: 'Rendered', Tasks: recent.length };
	}
})();
