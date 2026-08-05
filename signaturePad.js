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

	// UC06 SignaturePad - renders the real captured customer signature
	// (base64 PNG data URL) stored in Invoice.InvoiceData.Signature.
	window.PXTG_Handlers['signaturepad'] = function(pData)
	{
		var number = (pData && pData.Number) ? pData.Number : '';
		var d = (pData && pData.Data) ? pData.Data : {};
		var sig = d.Signature || '';

		console.log('signaturePad (external GitHub js) || invoice: ' + number + ', signature length: ' + sig.length);

		// Seed data stores a uniform 1x1px placeholder PNG (~114 chars) for
		// every invoice's Signature - there is no real varied scribble to
		// display. Render the actual pixel small (honest about what it is)
		// instead of stretching a 1x1 image to full width, which just paints
		// a solid color block that looks like a rendering bug.
		var isPlaceholder = sig.length > 0 && sig.length < 500;

		var el = pxtgVizContainer();
		var html = '<div style="font-weight:bold;margin-bottom:8px;">Firma - Factura ' + number + '</div>';
		if (sig && isPlaceholder)
		{
			html += '<img src="' + sig + '" style="width:24px;height:24px;border:1px solid #ccc;border-radius:4px;image-rendering:pixelated;">'
				+ '<div style="color:#999;font-size:12px;margin-top:6px;">(placeholder de firma en los datos semilla, ' + sig.length + ' caracteres - no es una firma real)</div>';
		}
		else if (sig)
		{
			html += '<img src="' + sig + '" style="width:100%;border:1px solid #ccc;border-radius:6px;background:#fff;">';
		}
		else
		{
			html += '<div style="color:#999;">(sin firma capturada)</div>';
		}
		el.innerHTML = html;

		console.log('signaturePad (external GitHub js) || rendered, hasSignature: ' + !!sig);

		return { Type: 'Rendered', Number: number, HasSignature: !!sig };
	}
})();
