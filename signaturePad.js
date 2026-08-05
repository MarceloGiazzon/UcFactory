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

		var el = pxtgVizContainer();
		var html = '<div style="font-weight:bold;margin-bottom:8px;">Firma - Factura ' + number + '</div>';
		if (sig)
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
