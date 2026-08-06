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

	// UC85 SpeechSynthesis - reads a real Product.Data.Description aloud via
	// the native browser Web Speech API (no CDN dep). Headless/CI browsers
	// have no audio output device, so the visible state (not the sound) is
	// what the demo/screenshot proves - shows the exact text being spoken
	// and the live speaking/idle status from the real SpeechSynthesis events.
	window.PXTG_Handlers['speechsynthesis'] = function(pData)
	{
		var products = (pData && pData.Products) ? pData.Products : [];
		var withDesc = products.filter(function(p) { return p.Data && p.Data.Description; });
		console.log('speechSynthesis (external GitHub js) || products received: ' + products.length + ', with description: ' + withDesc.length);

		var picked = withDesc[0] || { Name: '(none)', Data: { Description: '' } };
		var text = picked.Name + '. ' + picked.Data.Description;

		var el = pxtgVizContainer();
		el.innerHTML = '<div style="font-weight:bold;margin-bottom:8px;">' + picked.Name + '</div>'
			+ '<div style="background:#f7f7f7;padding:10px;border-radius:6px;margin-bottom:8px;">' + text + '</div>'
			+ '<button id="pxtg-speak-btn" style="padding:6px 12px;">Reproducir</button> '
			+ '<span id="pxtg-speak-status" style="margin-left:8px;color:#666;">idle</span>';

		try
		{
			if ('speechSynthesis' in window)
			{
				var btn = document.getElementById('pxtg-speak-btn');
				var status = document.getElementById('pxtg-speak-status');
				btn.addEventListener('click', function()
				{
					var utter = new SpeechSynthesisUtterance(text);
					utter.lang = 'es-ES';
					utter.onstart = function() { status.textContent = 'speaking...'; };
					utter.onend = function() { status.textContent = 'done'; };
					window.speechSynthesis.speak(utter);
					status.textContent = 'queued';
				});
				status.textContent = 'ready (Web Speech API available)';
				console.log('speechSynthesis (external GitHub js) || SpeechSynthesis API available, text length: ' + text.length);
			}
			else
			{
				document.getElementById('pxtg-speak-status').textContent = 'SpeechSynthesis not supported';
				console.log('speechSynthesis (external GitHub js) || SpeechSynthesis API NOT available in this browser');
			}
		}
		catch (e) { console.error('speechSynthesis (external GitHub js) || render error: ' + e.message); }

		return { Type: 'Rendered', Product: picked.Name, TextLength: text.length };
	}
})();
