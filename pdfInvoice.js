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

	function pxtgLoadScript(url, cb)
	{
		if (document.querySelector('script[data-pxtg-dep="' + url + '"]')) { cb(); return; }
		var s = document.createElement('script');
		s.src = url;
		s.setAttribute('data-pxtg-dep', url);
		s.onload = cb;
		s.onerror = function() { console.error('pdfInvoice || failed to load dep: ' + url); };
		document.head.appendChild(s);
	}

	// UC71 PdfLibGenerator - generates a real PDF (via pdf-lib) from a real
	// invoice row (new BuildInvoicePrintable Sub), embedded inline for preview.
	window.PXTG_Handlers['pdfinvoice'] = function(pData)
	{
		var number = (pData && pData.Number) ? pData.Number : '';
		var status = (pData && pData.Status) ? pData.Status.trim() : '';
		var date = (pData && pData.Date) ? pData.Date : '';
		var d = (pData && pData.Data) ? pData.Data : {};
		var payMethod = d.PayMethod || '';
		console.log('pdfInvoice (external GitHub js) || invoice: ' + number + ', status: ' + status);

		pxtgLoadScript('https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js', function()
		{
			try
			{
				PDFLib.PDFDocument.create().then(function(doc)
				{
					var page = doc.addPage([300, 220]);
					page.drawText('FACTURA', { x: 20, y: 190, size: 18 });
					page.drawText('Numero: ' + number, { x: 20, y: 160, size: 12 });
					page.drawText('Fecha: ' + date, { x: 20, y: 140, size: 12 });
					page.drawText('Estado: ' + status, { x: 20, y: 120, size: 12 });
					page.drawText('Metodo de pago: ' + payMethod, { x: 20, y: 100, size: 12 });
					return doc.saveAsBase64({ dataUri: true });
				}).then(function(dataUri)
				{
					var el = pxtgVizContainer();
					el.innerHTML = '<div style="font-weight:bold;margin-bottom:8px;">PDF generado - Factura ' + number + '</div>'
						+ '<div style="color:#2a9d8f;font-size:13px;margin-bottom:8px;">PDF real generado con pdf-lib: ' + dataUri.length + ' bytes (base64)</div>'
						+ '<embed src="' + dataUri + '" type="application/pdf" width="100%" height="280px" style="border:1px solid #ccc;border-radius:6px;">';
					console.log('pdfInvoice (external GitHub js) || PDF generated and embedded, bytes: ' + dataUri.length);
				});
			}
			catch (e) { console.error('pdfInvoice (external GitHub js) || render error: ' + e.message); }
		});

		return { Type: 'Rendered', Number: number };
	}
})();
