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
			el.style.cssText = 'margin-top:16px;width:760px;max-width:95vw;min-height:60px;';
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
		s.onerror = function() { console.error('dueCalendar || failed to load dep: ' + url); };
		document.head.appendChild(s);
	}

	window.PXTG_Handlers['duecalendar'] = function(pData)
	{
		var events = (pData && pData.Events) ? pData.Events : [];
		console.log('dueCalendar (external GitHub js) || events received: ' + events.length);

		pxtgLoadScript('https://cdn.jsdelivr.net/npm/fullcalendar@6.1.11/index.global.min.js', function()
		{
			try
			{
				var el = pxtgVizContainer();
				var calEvents = events.map(function(e)
				{
					return { title: e.Number + ' ($' + Number(e.Total).toFixed(0) + ')', date: e.DueDate };
				});
				var calendar = new FullCalendar.Calendar(el, {
					initialView: 'dayGridMonth',
					height: 'auto',
					events: calEvents,
					initialDate: events.length ? events[0].DueDate : undefined
				});
				calendar.render();
				console.log('dueCalendar (external GitHub js) || FullCalendar rendered, events: ' + calEvents.length);
			}
			catch (e) { console.error('dueCalendar (external GitHub js) || render error: ' + e.message); }
		});

		return { Type: 'Rendered', Events: events.length };
	}
})();
