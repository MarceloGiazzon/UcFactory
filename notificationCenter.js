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

	// UC87 NotificationCenter - dependency-free notification feed built from
	// the real soonest-due invoices (reuses BuildDueCalendar's Events,
	// sorted ascending by real DueDate, first 8 shown).
	window.PXTG_Handlers['notificationcenter'] = function(pData)
	{
		var events = (pData && pData.Events) ? pData.Events : [];
		console.log('notificationCenter (external GitHub js) || events received: ' + events.length);

		var sorted = events.slice().sort(function(a, b) { return a.DueDate < b.DueDate ? -1 : 1; }).slice(0, 8);
		console.log('notificationCenter (external GitHub js) || soonest due: ' + sorted.length);

		var el = pxtgVizContainer();
		var items = sorted.map(function(e)
		{
			return '<div style="display:flex;gap:10px;padding:10px;border-bottom:1px solid #eee;">'
				+ '<div style="width:8px;height:8px;border-radius:50%;background:#e3a13a;margin-top:6px;flex-shrink:0;"></div>'
				+ '<div><div style="font-weight:bold;">Factura ' + e.Number.trim() + ' vence</div>'
				+ '<div style="color:#666;font-size:12px;">' + e.DueDate + '</div></div></div>';
		}).join('');
		el.innerHTML = '<div style="font-weight:bold;margin-bottom:8px;">Notificaciones - proximos vencimientos</div>' + (items || '<div style="color:#999;">(sin vencimientos)</div>');

		console.log('notificationCenter (external GitHub js) || feed rendered');

		return { Type: 'Rendered', Notifications: sorted.length };
	}
})();
