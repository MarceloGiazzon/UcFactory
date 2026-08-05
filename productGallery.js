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
			el.style.cssText = 'margin-top:16px;width:700px;max-width:95vw;min-height:60px;font-family:Arial,sans-serif;';
			var pxtgAnchor = document.querySelector(".pxtg-box");
			(pxtgAnchor ? pxtgAnchor.parentNode : document.body).appendChild(el);
		}
		el.innerHTML = '';
		return el;
	}

	// Plain responsive image grid - no vendored lightbox library (PhotoSwipe
	// etc); the data-consumption story doesn't need the lightbox interaction.
	window.PXTG_Handlers['productgallery'] = function(pData)
	{
		var name = (pData && pData.ProductName) ? pData.ProductName : '';
		var d = (pData && pData.Data) ? pData.Data : {};
		var images = [];
		if (d.ImageUrl) images.push(d.ImageUrl);
		if (Array.isArray(d.Gallery)) images = images.concat(d.Gallery);

		console.log('productGallery (external GitHub js) || product: ' + name + ', images: ' + images.length);

		var el = pxtgVizContainer();
		var html = '<div style="font-weight:bold;margin-bottom:8px;">' + name + '</div>';
		html += '<div style="display:flex;gap:8px;flex-wrap:wrap;">';
		images.forEach(function(url)
		{
			html += '<img src="' + url + '" style="width:150px;height:150px;object-fit:cover;border-radius:6px;box-shadow:0 1px 4px rgba(0,0,0,.3);">';
		});
		html += '</div>';
		el.innerHTML = html;

		console.log('productGallery (external GitHub js) || grid rendered');

		return { Type: 'Rendered', ProductName: name, ImageCount: images.length };
	}
})();
