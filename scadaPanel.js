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
			el.style.cssText = 'margin-top:16px;width:760px;height:420px;max-width:95vw;position:relative;background:#1e2530;border-radius:8px;font-family:Arial,sans-serif;';
			var pxtgAnchor = document.querySelector(".pxtg-box");
			(pxtgAnchor ? pxtgAnchor.parentNode : document.body).appendChild(el);
		}
		el.innerHTML = '';
		return el;
	}

	var STATUS_COLOR = { Online: '#2ecc71', Alarm: '#e74c3c', Offline: '#7f8c8d' };

	// Floor-plan mimic panel - plain absolute-positioned HTML using the
	// terminals' own X/Y coordinates, no vendored SCADA/canvas library.
	window.PXTG_Handlers['scadapanel'] = function(pData)
	{
		var terminals = (pData && pData.Terminals) ? pData.Terminals : [];
		console.log('scadaPanel (external GitHub js) || terminals received: ' + terminals.length);

		var el = pxtgVizContainer();
		terminals.forEach(function(t)
		{
			var color = STATUS_COLOR[t.Status] || '#888';
			var node = document.createElement('div');
			node.style.cssText = 'position:absolute;left:' + t.X + 'px;top:' + t.Y + 'px;text-align:center;color:#fff;font-size:11px;';
			node.innerHTML = '<div style="width:36px;height:36px;border-radius:6px;background:' + color
				+ ';box-shadow:0 0 12px ' + color + ';margin:0 auto 4px;display:flex;align-items:center;justify-content:center;font-size:16px;">🖥️</div>'
				+ t.Name + '<br><span style="color:#aaa;">' + t.Status + '</span>';
			el.appendChild(node);
		});

		console.log('scadaPanel (external GitHub js) || panel rendered, nodes: ' + terminals.length);

		return { Type: 'Rendered', Terminals: terminals.length, Alarms: terminals.filter(function(t){return t.Status==='Alarm';}).length };
	}
})();
