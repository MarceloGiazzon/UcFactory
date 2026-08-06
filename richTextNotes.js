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
			el.style.cssText = 'margin-top:16px;width:600px;max-width:95vw;min-height:200px;';
			var pxtgAnchor = document.querySelector(".pxtg-box");
			(pxtgAnchor ? pxtgAnchor.parentNode : document.body).appendChild(el);
		}
		el.innerHTML = '<div id="pxtg-quill-title" style="font-weight:bold;margin-bottom:8px;font-family:Arial,sans-serif;"></div><div id="pxtg-quill-editor" style="height:150px;"></div>';
		return el;
	}

	function pxtgLoadScript(url, cb)
	{
		if (document.querySelector('script[data-pxtg-dep="' + url + '"]')) { cb(); return; }
		var s = document.createElement('script');
		s.src = url;
		s.setAttribute('data-pxtg-dep', url);
		s.onload = cb;
		s.onerror = function() { console.error('richTextNotes || failed to load dep: ' + url); };
		document.head.appendChild(s);
	}

	function pxtgLoadCss(url)
	{
		if (document.querySelector('link[data-pxtg-dep="' + url + '"]')) return;
		var l = document.createElement('link');
		l.rel = 'stylesheet';
		l.href = url;
		l.setAttribute('data-pxtg-dep', url);
		document.head.appendChild(l);
	}

	// UC03 QuillRichText - real Customer.Data.Notes edited in a real Quill
	// editor (reuses BuildCustomerList as-is).
	window.PXTG_Handlers['richtextnotes'] = function(pData)
	{
		var customers = (pData && pData.Customers) ? pData.Customers : [];
		var withNotes = customers.filter(function(c) { return c.Data && c.Data.Notes; });
		console.log('richTextNotes (external GitHub js) || customers received: ' + customers.length + ', with notes: ' + withNotes.length);

		var picked = withNotes[0] || { Name: '(none)', Data: { Notes: '' } };

		pxtgLoadCss('https://cdn.jsdelivr.net/npm/quill@2/dist/quill.snow.css');
		pxtgLoadScript('https://cdn.jsdelivr.net/npm/quill@2/dist/quill.js', function()
		{
			try
			{
				pxtgVizContainer();
				document.getElementById('pxtg-quill-title').textContent = 'Notas - ' + picked.Name;
				var quill = new Quill('#pxtg-quill-editor', { theme: 'snow' });
				quill.setText(picked.Data.Notes);
				console.log('richTextNotes (external GitHub js) || Quill mounted, notes length: ' + picked.Data.Notes.length);
			}
			catch (e) { console.error('richTextNotes (external GitHub js) || render error: ' + e.message); }
		});

		return { Type: 'Rendered', Customer: picked.Name, NotesLength: (picked.Data.Notes || '').length };
	}
})();
