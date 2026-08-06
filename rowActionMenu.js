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

	// UC122 RowActionMenu - dependency-free per-row "..." action menu over
	// real invoice rows (reuses BuildInvoiceKanban's raw Invoices array).
	window.PXTG_Handlers['rowactionmenu'] = function(pData)
	{
		var invoices = (pData && pData.Invoices) ? pData.Invoices.slice(0, 10) : [];
		console.log('rowActionMenu (external GitHub js) || invoices received: ' + invoices.length);

		var el = pxtgVizContainer();
		var rows = invoices.map(function(inv, idx)
		{
			var s = (inv.Status || '').trim();
			return '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px;border-bottom:1px solid #eee;position:relative;">'
				+ '<span>' + inv.Number.trim() + ' - <span style="color:#666;">' + s + '</span></span>'
				+ '<button class="pxtg-ram-btn" data-idx="' + idx + '" style="border:none;background:none;font-size:18px;cursor:pointer;">&#8942;</button>'
				+ '<div class="pxtg-ram-menu" id="pxtg-ram-menu-' + idx + '" style="display:none;position:absolute;right:0;top:32px;background:#fff;border:1px solid #ccc;border-radius:4px;box-shadow:0 2px 8px rgba(0,0,0,.15);z-index:10;min-width:120px;">'
				+ '<div style="padding:8px;cursor:pointer;">Ver detalle</div>'
				+ '<div style="padding:8px;cursor:pointer;">Marcar pagada</div>'
				+ '<div style="padding:8px;cursor:pointer;color:#c0392b;">Anular</div>'
				+ '</div></div>';
		}).join('');
		el.innerHTML = '<div style="font-weight:bold;margin-bottom:8px;">Facturas recientes (menu de acciones)</div>' + rows;

		Array.prototype.forEach.call(el.querySelectorAll('.pxtg-ram-btn'), function(btn)
		{
			btn.addEventListener('click', function()
			{
				var menu = document.getElementById('pxtg-ram-menu-' + btn.getAttribute('data-idx'));
				menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
			});
		});

		// open the first row's menu so the screenshot shows it working
		var firstMenu = document.getElementById('pxtg-ram-menu-0');
		if (firstMenu) firstMenu.style.display = 'block';

		console.log('rowActionMenu (external GitHub js) || menu rendered, rows: ' + invoices.length);

		return { Type: 'Rendered', Rows: invoices.length };
	}
})();
