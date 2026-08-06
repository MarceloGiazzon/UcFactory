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
			el.style.cssText = 'margin-top:16px;width:800px;max-width:96vw;height:320px;display:flex;border:1px solid #ccc;border-radius:6px;overflow:hidden;font-family:Arial,sans-serif;';
			var pxtgAnchor = document.querySelector(".pxtg-box");
			(pxtgAnchor ? pxtgAnchor.parentNode : document.body).appendChild(el);
		}
		el.innerHTML = '';
		return el;
	}

	// UC41 SplitPanes - dependency-free draggable split view: real product
	// list on the left, selected product's real JSON detail on the right
	// (reuses BuildProductList as-is).
	window.PXTG_Handlers['splitpanes'] = function(pData)
	{
		var products = (pData && pData.Products) ? pData.Products : [];
		console.log('splitPanes (external GitHub js) || products received: ' + products.length);

		var el = pxtgVizContainer();
		var listHtml = products.slice(0, 15).map(function(p, idx)
		{
			return '<div class="pxtg-sp-item" data-idx="' + idx + '" style="padding:8px;border-bottom:1px solid #eee;cursor:pointer;">' + p.Name + '</div>';
		}).join('');

		el.innerHTML = '<div id="pxtg-sp-left" style="width:40%;overflow-y:auto;border-right:1px solid #ccc;">' + listHtml + '</div>'
			+ '<div id="pxtg-sp-divider" style="width:6px;background:#ddd;cursor:col-resize;"></div>'
			+ '<div id="pxtg-sp-right" style="flex:1;padding:10px;overflow-y:auto;white-space:pre-wrap;font-family:monospace;font-size:12px;background:#f7f7f7;"></div>';

		var right = document.getElementById('pxtg-sp-right');
		function select(idx)
		{
			right.textContent = JSON.stringify(products[idx], null, 2);
		}
		Array.prototype.forEach.call(el.querySelectorAll('.pxtg-sp-item'), function(item)
		{
			item.addEventListener('click', function() { select(Number(item.getAttribute('data-idx'))); });
		});
		select(0);

		// draggable divider
		var left = document.getElementById('pxtg-sp-left');
		var divider = document.getElementById('pxtg-sp-divider');
		var dragging = false;
		divider.addEventListener('mousedown', function() { dragging = true; });
		document.addEventListener('mouseup', function() { dragging = false; });
		document.addEventListener('mousemove', function(ev)
		{
			if (!dragging) return;
			var rect = el.getBoundingClientRect();
			var pct = Math.min(80, Math.max(15, ((ev.clientX - rect.left) / rect.width) * 100));
			left.style.width = pct + '%';
		});

		console.log('splitPanes (external GitHub js) || split view mounted, items: ' + products.length);

		return { Type: 'Rendered', Items: products.length };
	}
})();
