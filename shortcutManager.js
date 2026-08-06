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
			el.style.cssText = 'margin-top:16px;width:500px;max-width:95vw;min-height:60px;font-family:Arial,sans-serif;';
			var pxtgAnchor = document.querySelector(".pxtg-box");
			(pxtgAnchor ? pxtgAnchor.parentNode : document.body).appendChild(el);
		}
		el.innerHTML = '';
		return el;
	}

	// UC94 ShortcutManager - real keyboard shortcuts (digits 1-9) jump to
	// real product categories (reuses BuildProductList's distinct
	// categories, same first-seen pattern as tagchips/colorpicker).
	window.PXTG_Handlers['shortcutmanager'] = function(pData)
	{
		var products = (pData && pData.Products) ? pData.Products : [];
		var categories = [];
		products.forEach(function(p) { if (categories.indexOf(p.Category) < 0) categories.push(p.Category); });
		categories = categories.slice(0, 9);
		console.log('shortcutManager (external GitHub js) || products received: ' + products.length + ', categories bound to shortcuts: ' + categories.length);

		var el = pxtgVizContainer();
		var rows = categories.map(function(cat, idx)
		{
			return '<div class="pxtg-sm-row" data-idx="' + idx + '" style="display:flex;gap:10px;align-items:center;padding:6px;border-bottom:1px solid #eee;">'
				+ '<kbd style="background:#eee;border:1px solid #ccc;border-radius:4px;padding:2px 8px;font-family:monospace;">' + (idx + 1) + '</kbd>'
				+ '<span>' + cat + '</span></div>';
		}).join('');
		el.innerHTML = '<div style="font-weight:bold;margin-bottom:8px;">Atajos de teclado (presione 1-' + categories.length + ')</div>'
			+ rows + '<div id="pxtg-sm-status" style="margin-top:10px;color:#2a9d8f;font-weight:bold;"></div>';

		var status = document.getElementById('pxtg-sm-status');
		function activate(idx)
		{
			Array.prototype.forEach.call(el.querySelectorAll('.pxtg-sm-row'), function(r) { r.style.background = ''; });
			var row = el.querySelector('.pxtg-sm-row[data-idx="' + idx + '"]');
			if (row) row.style.background = '#eaf5f2';
			status.textContent = 'Categoria activa: ' + categories[idx];
		}
		document.addEventListener('keydown', function(ev)
		{
			var n = parseInt(ev.key, 10);
			if (n >= 1 && n <= categories.length) activate(n - 1);
		});
		activate(0);

		console.log('shortcutManager (external GitHub js) || shortcuts mounted');

		return { Type: 'Rendered', Shortcuts: categories.length };
	}
})();
