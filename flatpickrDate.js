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
			el.style.cssText = 'margin-top:16px;width:400px;max-width:90vw;min-height:60px;font-family:Arial,sans-serif;';
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
		s.onerror = function() { console.error('flatpickrDate || failed to load dep: ' + url); };
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

	// UC33 FlatpickrDate - real Flatpickr calendar with every real invoice
	// due-date marked (reuses BuildDueCalendar's Events as-is).
	window.PXTG_Handlers['flatpickrdate'] = function(pData)
	{
		var events = (pData && pData.Events) ? pData.Events : [];
		var dueDates = events.map(function(e) { return e.DueDate; }).filter(function(d) { return d; });
		console.log('flatpickrDate (external GitHub js) || events received: ' + events.length + ', due dates: ' + dueDates.length);

		pxtgLoadCss('https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css');
		pxtgLoadScript('https://cdn.jsdelivr.net/npm/flatpickr', function()
		{
			try
			{
				var el = pxtgVizContainer();
				el.innerHTML = '<div style="font-weight:bold;margin-bottom:8px;">Fechas de vencimiento (' + dueDates.length + ' facturas)</div><input id="pxtg-flatpickr-input">';
				flatpickr('#pxtg-flatpickr-input', { inline: true, enable: dueDates });
				console.log('flatpickrDate (external GitHub js) || Flatpickr mounted');
			}
			catch (e) { console.error('flatpickrDate (external GitHub js) || render error: ' + e.message); }
		});

		return { Type: 'Rendered', DueDates: dueDates.length };
	}
})();
