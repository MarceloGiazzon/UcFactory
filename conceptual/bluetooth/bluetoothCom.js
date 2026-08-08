/*
 * bluetoothCom.js - version 1
 * Two actions: request Bluetooth permission (device chooser) and list the
 * devices already granted to this origin. Everything is traced to the log box.
 */
(function () {
  'use strict';

  var el = {
    support: document.getElementById('support'),
    btnPermission: document.getElementById('btnPermission'),
    btnList: document.getElementById('btnList'),
    btnClearLog: document.getElementById('btnClearLog'),
    deviceList: document.getElementById('deviceList'),
    logBox: document.getElementById('logBox'),
    logCount: document.getElementById('logCount')
  };

  var logLines = 0;

  /* ---------------------------------------------------------------- log */

  function stamp() {
    var d = new Date();
    function p(n, w) { return String(n).padStart(w || 2, '0'); }
    return p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds()) +
           '.' + p(d.getMilliseconds(), 3);
  }

  function log(level, message) {
    var line = '[' + stamp() + '] ' + level.toUpperCase() + ' - ' + message;
    el.logBox.value += (el.logBox.value ? '\n' : '') + line;
    el.logBox.scrollTop = el.logBox.scrollHeight;
    logLines++;
    el.logCount.textContent = String(logLines);
  }

  var info = function (m) { log('info', m); };
  var ok = function (m) { log('ok', m); };
  var warn = function (m) { log('warn', m); };
  var err = function (m) { log('error', m); };

  function logError(context, e) {
    var name = (e && e.name) || 'Error';
    var msg = (e && e.message) || String(e);
    err(context + ' failed -> ' + name + ': ' + msg);
    if (name === 'NotFoundError') {
      info('NotFoundError usually means the chooser was cancelled or no device matched.');
    } else if (name === 'SecurityError') {
      info('SecurityError: the page must be served over HTTPS or from localhost.');
    } else if (name === 'NotAllowedError') {
      info('NotAllowedError: permission was denied, or the click was not a user gesture.');
    }
  }

  function setStatus(text, kind) {
    el.support.textContent = text;
    el.support.className = 'status status--' + kind;
  }

  /* ------------------------------------------------------------ support */

  function checkSupport() {
    info('Page loaded. Checking environment...');
    info('User agent: ' + navigator.userAgent);
    info('Origin: ' + location.origin + ' (secure context: ' + !!window.isSecureContext + ')');

    if (!window.isSecureContext) {
      warn('Not a secure context. Web Bluetooth requires HTTPS or localhost.');
    }

    if (!navigator.bluetooth) {
      setStatus('Web Bluetooth is NOT available in this browser.', 'err');
      err('navigator.bluetooth is undefined - Web Bluetooth not supported here.');
      info('Supported on Chrome / Edge / Opera (desktop and Android), not on Firefox or iOS Safari.');
      el.btnPermission.disabled = true;
      el.btnList.disabled = true;
      return;
    }

    ok('navigator.bluetooth is available.');

    if (typeof navigator.bluetooth.getDevices !== 'function') {
      warn('navigator.bluetooth.getDevices() is not available - listing paired devices may not work.');
      info('In Chrome enable chrome://flags/#enable-web-bluetooth-new-permissions-backend.');
    } else {
      ok('navigator.bluetooth.getDevices() is available.');
    }

    if (typeof navigator.bluetooth.getAvailability === 'function') {
      navigator.bluetooth.getAvailability().then(function (available) {
        if (available) {
          setStatus('Web Bluetooth supported and a Bluetooth adapter is available.', 'ok');
          ok('getAvailability() -> true (adapter present).');
        } else {
          setStatus('Web Bluetooth supported, but no Bluetooth adapter is available.', 'warn');
          warn('getAvailability() -> false (adapter missing or turned off).');
        }
      }).catch(function (e) {
        setStatus('Web Bluetooth supported (adapter state unknown).', 'warn');
        logError('getAvailability()', e);
      });
    } else {
      setStatus('Web Bluetooth supported (adapter state unknown).', 'warn');
      warn('getAvailability() is not implemented in this browser.');
    }

    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'bluetooth' }).then(function (st) {
        info('Permissions API - bluetooth state: ' + st.state);
      }).catch(function () {
        info('Permissions API does not expose the "bluetooth" permission here.');
      });
    }
  }

  /* ------------------------------------------------------------ devices */

  function describeDevice(device) {
    return (device.name || '(unnamed device)') + ' | id: ' + device.id;
  }

  function renderDevices(devices) {
    el.deviceList.innerHTML = '';

    if (!devices.length) {
      var empty = document.createElement('li');
      empty.className = 'devices__empty';
      empty.textContent = 'No devices listed yet.';
      el.deviceList.appendChild(empty);
      return;
    }

    devices.forEach(function (device) {
      var li = document.createElement('li');

      var name = document.createElement('span');
      name.className = 'devices__name';
      name.textContent = device.name || '(unnamed device)';

      var id = document.createElement('span');
      id.className = 'devices__id';
      id.textContent = 'id: ' + device.id +
        ' | connected: ' + (device.gatt ? device.gatt.connected : 'n/a');

      li.appendChild(name);
      li.appendChild(id);
      el.deviceList.appendChild(li);
    });
  }

  function watchDevice(device) {
    device.addEventListener('gattserverdisconnected', function () {
      warn('Device disconnected: ' + describeDevice(device));
    });
  }

  /* ------------------------------------------------------------ actions */

  function requestPermission() {
    info('--- Requesting Bluetooth access ---');
    info('Calling navigator.bluetooth.requestDevice({ acceptAllDevices: true })...');
    info('The browser chooser should open now. Pick a device or press Cancel.');

    el.btnPermission.disabled = true;

    navigator.bluetooth.requestDevice({ acceptAllDevices: true })
      .then(function (device) {
        ok('Permission granted for: ' + describeDevice(device));
        info('Device object received. GATT available: ' + !!device.gatt);
        watchDevice(device);
        info('Refreshing the device list...');
        return listDevices();
      })
      .catch(function (e) {
        logError('requestDevice()', e);
      })
      .then(function () {
        el.btnPermission.disabled = false;
        info('--- Request finished ---');
      });
  }

  function listDevices() {
    info('--- Listing paired / granted devices ---');

    if (typeof navigator.bluetooth.getDevices !== 'function') {
      err('navigator.bluetooth.getDevices() is not supported in this browser.');
      info('Use "Allow Bluetooth access" to pick a device through the chooser instead.');
      return Promise.resolve();
    }

    el.btnList.disabled = true;
    info('Calling navigator.bluetooth.getDevices()...');

    return navigator.bluetooth.getDevices()
      .then(function (devices) {
        ok('getDevices() returned ' + devices.length + ' device(s).');
        devices.forEach(function (device, i) {
          info('  #' + (i + 1) + ' ' + describeDevice(device));
          watchDevice(device);
        });
        if (!devices.length) {
          info('No devices granted to this origin yet. Use "Allow Bluetooth access" first.');
        }
        renderDevices(devices);
      })
      .catch(function (e) {
        logError('getDevices()', e);
      })
      .then(function () {
        el.btnList.disabled = false;
        info('--- Listing finished ---');
      });
  }

  function clearLog() {
    el.logBox.value = '';
    logLines = 0;
    el.logCount.textContent = '0';
    info('Log cleared.');
  }

  /* -------------------------------------------------------------- wire */

  el.btnPermission.addEventListener('click', requestPermission);
  el.btnList.addEventListener('click', function () { listDevices(); });
  el.btnClearLog.addEventListener('click', clearLog);

  checkSupport();
})();
