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
			el.style.cssText = 'margin-top:16px;width:760px;max-width:95vw;min-height:60px;font-family:Arial,sans-serif;';
			document.body.appendChild(el);
		}
		el.innerHTML = '';
		return el;
	}

	var STATUS_COLOR = { Online: '#2a9d8f', Alarm: '#c0392b', Offline: '#888' };

	window.PXTG_Handlers['alarmwall'] = function(pData)
	{
		var lowStock  = (pData && pData.LowStock)  ? pData.LowStock  : [];
		var terminals = (pData && pData.Terminals) ? pData.Terminals : [];
		console.log('alarmWall (external GitHub js) || low-stock products: ' + lowStock.length + ', terminals: ' + terminals.length);

		var el = pxtgVizContainer();
		var html = '<div style="display:flex;gap:16px;flex-wrap:wrap;">';

		html += '<div style="flex:1;min-width:280px;">';
		html += '<div style="font-weight:bold;margin-bottom:6px;">⚠️ Stock bajo (' + lowStock.length + ')</div>';
		lowStock.forEach(function(p)
		{
			html += '<div style="background:#fff3cd;border-left:4px solid #e3a13a;padding:6px 10px;margin-bottom:4px;border-radius:3px;">'
				+ '<b>' + p.Name + '</b><br><span style="font-size:12px;color:#666;">' + p.Category + ' - Stock: ' + p.Stock + '</span></div>';
		});
		html += '</div>';

		html += '<div style="flex:1;min-width:280px;">';
		html += '<div style="font-weight:bold;margin-bottom:6px;">🖥️ Terminales</div>';
		terminals.forEach(function(t)
		{
			var color = STATUS_COLOR[t.Status] || '#888';
			html += '<div style="display:flex;align-items:center;background:#f4f4f4;padding:6px 10px;margin-bottom:4px;border-radius:3px;">'
				+ '<span style="width:12px;height:12px;border-radius:50%;background:' + color + ';display:inline-block;margin-right:8px;"></span>'
				+ '<b>' + t.Name + '</b>&nbsp;<span style="color:' + color + ';">(' + t.Status + ')</span>'
				+ '<span style="margin-left:auto;font-size:12px;">$' + Number(t.CashDrawer).toFixed(2) + '</span></div>';
		});
		html += '</div></div>';
		el.innerHTML = html;

		console.log('alarmWall (external GitHub js) || rendered');

		return { Type: 'Rendered', LowStockCount: lowStock.length, TerminalAlerts: terminals.filter(function(t){return t.Status!=='Online';}).length };
	}
})();
