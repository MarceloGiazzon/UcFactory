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
		s.onerror = function() { console.error('intlTelInput || failed to load dep: ' + url); };
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

	// UC31 IntlTelInput - real Customer.Data.Phone (E.164) loaded into a real
	// international phone input widget (reuses BuildCustomerList as-is).
	window.PXTG_Handlers['intltelinput'] = function(pData)
	{
		var customers = (pData && pData.Customers) ? pData.Customers : [];
		var withPhone = customers.filter(function(c) { return c.Data && c.Data.Phone; });
		console.log('intlTelInput (external GitHub js) || customers received: ' + customers.length + ', with phone: ' + withPhone.length);

		var picked = withPhone[0] || { Name: '(none)', Data: { Phone: '' } };

		pxtgLoadCss('https://cdn.jsdelivr.net/npm/intl-tel-input@23/build/css/intlTelInput.css');
		pxtgLoadScript('https://cdn.jsdelivr.net/npm/intl-tel-input@23/build/js/intlTelInputWithUtils.min.js', function()
		{
			try
			{
				var el = pxtgVizContainer();
				el.innerHTML = '<div style="font-weight:bold;margin-bottom:8px;">' + picked.Name + '</div><input type="tel" id="pxtg-iti-input">';
				var input = document.getElementById('pxtg-iti-input');
				window.intlTelInput(input, { initialCountry: 'auto', geoIpLookup: function(cb) { cb('uy'); }, utilsScript: 'https://cdn.jsdelivr.net/npm/intl-tel-input@23/build/js/utils.js' });
				input.value = picked.Data.Phone;
				console.log('intlTelInput (external GitHub js) || widget mounted, phone: ' + picked.Data.Phone);
			}
			catch (e) { console.error('intlTelInput (external GitHub js) || render error: ' + e.message); }
		});

		return { Type: 'Rendered', Customer: picked.Name, Phone: picked.Data.Phone || '' };
	}
})();
