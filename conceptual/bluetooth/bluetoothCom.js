/*
 * bluetoothCom.js - version 3
 * Request Bluetooth permission (device chooser), list the devices already
 * granted to this origin, and send an ESC/POS job to a printer over either
 * Web Serial (Bluetooth Classic / SPP) or Web Bluetooth (BLE GATT).
 * Everything is traced to the log box.
 */
(function () {
  'use strict';

  var el = {
    support: document.getElementById('support'),
    btnPermission: document.getElementById('btnPermission'),
    btnList: document.getElementById('btnList'),
    btnClearLog: document.getElementById('btnClearLog'),
    deviceList: document.getElementById('deviceList'),
    btnPrint: document.getElementById('btnPrint'),
    btnFeed: document.getElementById('btnFeed'),
    btnPrinterDisconnect: document.getElementById('btnPrinterDisconnect'),
    btnForgetPrinter: document.getElementById('btnForgetPrinter'),
    btnConnectBle: document.getElementById('btnConnectBle'),
    printText: document.getElementById('printText'),
    printerState: document.getElementById('printerState'),
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
      warn('Not a secure context. Web Bluetooth and Web Serial require HTTPS or localhost.');
    }

    if (navigator.serial) {
      ok('navigator.serial is available - Bluetooth Classic (SPP) printers go through it.');
    } else {
      warn('navigator.serial is unavailable - no serial transport in this browser.');
      info('Web Serial needs Chrome or Edge on desktop.');
    }

    if (!navigator.bluetooth) {
      setStatus('Web Bluetooth is NOT available in this browser.', 'err');
      err('navigator.bluetooth is undefined - Web Bluetooth not supported here.');
      info('Supported on Chrome / Edge / Opera (desktop and Android), not on Firefox or iOS Safari.');
      el.btnPermission.disabled = true;
      el.btnList.disabled = true;
      el.btnConnectBle.disabled = true;
      info('Printing is unaffected: the serial transport does not depend on Web Bluetooth.');
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

  /* ------------------------------------------------------------ printer */

  /*
   * Web Bluetooth reaches BLE/GATT only, so a printer is usable when it exposes
   * a "serial bridge" service holding a writable characteristic. Every service
   * we may touch has to be declared up front in requestDevice(); anything left
   * out of this list is blocked later in getPrimaryServices().
   */
  var PRINTER_SERVICES = [
    '000018f0-0000-1000-8000-00805f9b34fb', // most ESC/POS thermal printers (char 2af1)
    '0000ff00-0000-1000-8000-00805f9b34fb', // Goojprt / 58mm clones (char ff02)
    '0000ffe0-0000-1000-8000-00805f9b34fb', // HM-10 style serial bridge (char ffe1)
    '0000ae30-0000-1000-8000-00805f9b34fb', // MX / "cat" pocket printers (char ae01)
    '0000fee7-0000-1000-8000-00805f9b34fb', // assorted Chinese BLE modules
    '49535343-fe7d-4ae5-8fa9-9fafd205e455', // ISSC transparent UART (Bixolon, Star)
    '6e400001-b5a3-f393-e0a9-e50e24dcca9e', // Nordic UART
    '38eb4a80-c570-11e3-9507-0002a5d5c51b', // Zebra
    'e7810a71-73ae-499d-8c15-faa9aef0c3f2'  // some label printers
  ];

  /*
   * Printers do not speak UTF-8. We select code page PC850 (ESC t 2) and map the
   * Latin-1 characters we actually use onto it; anything unmapped becomes '?'.
   */
  var CP850 = {
    'Ç': 128, 'ü': 129, 'é': 130, 'â': 131, 'ä': 132,
    'à': 133, 'å': 134, 'ç': 135, 'ê': 136, 'ë': 137,
    'è': 138, 'ï': 139, 'î': 140, 'ì': 141, 'Ä': 142,
    'Å': 143, 'É': 144, 'æ': 145, 'Æ': 146, 'ô': 147,
    'ö': 148, 'ò': 149, 'û': 150, 'ù': 151, 'ÿ': 152,
    'Ö': 153, 'Ü': 154, 'ø': 155, '£': 156, 'Ø': 157,
    'á': 160, 'í': 161, 'ó': 162, 'ú': 163, 'ñ': 164,
    'Ñ': 165, 'ª': 166, 'º': 167, '¿': 168, '®': 169,
    '½': 171, '¼': 172, '¡': 173, '«': 174, '»': 175,
    'Á': 181, 'Â': 182, 'À': 183, '©': 184, 'ã': 198,
    'Ã': 199, 'Ê': 210, 'Ë': 211, 'È': 212, 'Í': 214,
    'Î': 215, 'Ï': 216, 'Ì': 222, 'Ó': 224, 'ß': 225,
    'Ô': 226, 'Ò': 227, 'õ': 228, 'Õ': 229, 'Ú': 233,
    'Û': 234, 'Ù': 235, '±': 241, '¶': 244, '§': 245,
    '°': 248, '·': 250, '²': 253
  };

  /* Default ATT MTU only carries 20 bytes; printers also need time to drain
     their buffer, so a job goes out in small chunks with a short pause. RFCOMM
     already fragments for us, so the serial path can push bigger chunks. */
  var BLE_CHUNK_BYTES = 100;
  var SERIAL_CHUNK_BYTES = 256;
  var CHUNK_PAUSE_MS = 25;

  /* Ignored by a virtual COM port over RFCOMM, but the API demands a value. */
  var SERIAL_BAUD = 9600;

  /*
   * Two transports, because Web Bluetooth only reaches BLE/GATT: a Bluetooth
   * Classic (SPP) printer is invisible to it and has to go through Web Serial,
   * which sees the virtual COM port Windows created when the device was paired.
   */
  var printer = {
    kind: null,   // 'serial' | 'ble'
    port: null,   // SerialPort
    writer: null, // WritableStreamDefaultWriter over port.writable
    device: null, // BluetoothDevice
    chr: null,    // BluetoothRemoteGATTCharacteristic
    label: ''
  };

  function sleep(ms) {
    return new Promise(function (resolve) { setTimeout(resolve, ms); });
  }

  function setPrinterState(text) {
    el.printerState.textContent = text;
  }

  function setPrinterBusy(busy) {
    el.btnPrint.disabled = busy;
    el.btnFeed.disabled = busy;
    el.btnPrinterDisconnect.disabled = busy;
    el.btnForgetPrinter.disabled = busy;
  }

  /*
   * Neither a SerialPort nor a BluetoothDevice can be serialized, so what we
   * keep here is only enough to find the real object again: which transport was
   * used, a label to show, and the id/index to match on. The permission itself
   * lives in the browser, not in localStorage.
   */
  var STORAGE_KEY = 'bluetoothCom.printer';

  function readSaved() {
    var raw;
    try {
      raw = window.localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      warn('localStorage is not readable here: ' + ((e && e.message) || e));
      return null;
    }
    if (!raw) { return null; }

    var saved;
    try {
      saved = JSON.parse(raw);
    } catch (e) {
      warn('Discarding a corrupt saved printer entry: ' + ((e && e.message) || e));
      return null;
    }
    if (!saved) { return null; }

    /* Entries written before the serial transport existed only carried an id. */
    if (!saved.transport) { saved.transport = saved.id ? 'ble' : null; }
    if (saved.transport === 'ble' && !saved.id) { return null; }
    return saved.transport ? saved : null;
  }

  function writeSaved(entry) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entry));
      ok('Printer remembered for next time: ' + entry.name);
    } catch (e) {
      warn('Could not save the printer: ' + ((e && e.message) || e));
      info('Printing still works, but the chooser will open again after a reload.');
    }
  }

  function describePort(port, index) {
    var bits = [];
    var portInfo = {};
    try { portInfo = port.getInfo() || {}; } catch (e) { /* getInfo is optional */ }
    if (portInfo.usbVendorId !== undefined) {
      bits.push('USB ' + portInfo.usbVendorId + ':' + portInfo.usbProductId);
    }
    if (portInfo.bluetoothServiceClassId) {
      bits.push('BT service ' + portInfo.bluetoothServiceClassId);
    }
    return 'serial port #' + index + (bits.length ? ' (' + bits.join(', ') + ')' : '');
  }

  function restoreSerialPort(saved) {
    return navigator.serial.getPorts().then(function (ports) {
      if (!ports.length) {
        info('No serial port has been granted to this origin yet.');
        return false;
      }

      var index = 0;
      if (saved && typeof saved.index === 'number' && saved.index < ports.length) {
        index = saved.index;
      }
      if (ports.length > 1) {
        warn('There are ' + ports.length + ' granted serial ports; using #' + index + '.');
        info('Chrome does not expose the COM number to the page, so they cannot be told apart here.');
        info('If that is the wrong one, use "Forget saved printer" and choose again.');
      }

      printer.kind = 'serial';
      printer.port = ports[index];
      printer.writer = null;
      printer.label = (saved && saved.name) || describePort(ports[index], index);
      setPrinterState('saved');
      ok('Serial printer restored with no chooser: ' + printer.label);
      return true;
    });
  }

  function restoreBleDevice(saved) {
    if (!navigator.bluetooth || typeof navigator.bluetooth.getDevices !== 'function') {
      warn('getDevices() is unavailable, so the saved BLE id cannot be turned back into a device.');
      info('Only chrome://flags/#enable-web-bluetooth-new-permissions-backend unlocks it.');
      info('The serial transport has no such restriction.');
      return;
    }

    navigator.bluetooth.getDevices().then(function (devices) {
      var match = null;
      devices.forEach(function (d) {
        if (d.id === saved.id) { match = d; }
      });

      if (!match) {
        warn('The saved BLE printer is no longer granted to this origin.');
        setPrinterState('no printer');
        return;
      }

      printer.kind = 'ble';
      printer.device = match;
      printer.label = describeDevice(match);
      match.addEventListener('gattserverdisconnected', onPrinterLost);
      setPrinterState('saved');
      ok('Saved BLE printer restored: ' + printer.label);
    }).catch(function (e) {
      logError('getDevices() while restoring the saved printer', e);
    });
  }

  /*
   * Runs at load, never from a click: resolving a saved printer costs an async
   * hop, and requestPort()/requestDevice() need the user gesture still intact
   * if we end up falling back to a chooser.
   */
  function restoreSavedPrinter() {
    var saved = readSaved();

    if (saved) {
      info('Saved printer: ' + (saved.name || '(unnamed)') + ' | transport: ' + saved.transport);
    } else {
      info('No printer saved in localStorage yet.');
    }

    if (saved && saved.transport === 'ble') {
      restoreBleDevice(saved);
      return;
    }

    if (!navigator.serial) {
      warn('navigator.serial is unavailable, so a granted port cannot be restored.');
      info('Web Serial needs Chrome/Edge on desktop over HTTPS or localhost.');
      return;
    }

    restoreSerialPort(saved).then(function (found) {
      if (!found && saved) {
        warn('The saved serial port is no longer granted; the chooser will open on the next print.');
        setPrinterState('no printer');
      }
    }).catch(function (e) {
      logError('serial.getPorts()', e);
    });
  }

  function encodeText(text, out) {
    var i, ch, code;
    for (i = 0; i < text.length; i++) {
      ch = text.charAt(i);
      if (ch === '\r') { continue; }
      if (ch === '\n') { out.push(0x0a); continue; }
      code = text.charCodeAt(i);
      if (code < 0x80) {
        out.push(code);
      } else if (CP850[ch] !== undefined) {
        out.push(CP850[ch]);
      } else {
        out.push(0x3f); // '?'
      }
    }
  }

  function buildJob(text) {
    var out = [];
    out.push(0x1b, 0x40);       // ESC @   - reset the printer
    out.push(0x1b, 0x74, 0x02); // ESC t 2 - code page PC850
    encodeText(text, out);
    out.push(0x0a);             // make sure the last line is committed
    return new Uint8Array(out);
  }

  function writeChunks(sink, bytes) {
    var offset = 0;
    info('Sending ' + bytes.length + ' byte(s) in ' +
         Math.ceil(bytes.length / sink.chunk) + ' chunk(s) of up to ' + sink.chunk + '.');

    function next() {
      if (offset >= bytes.length) { return Promise.resolve(); }
      var slice = bytes.slice(offset, offset + sink.chunk);
      offset += slice.length;
      return sink.write(slice).then(function () { return sleep(CHUNK_PAUSE_MS); }).then(next);
    }

    return next();
  }

  function findWritable(server) {
    info('Discovering primary services...');
    return server.getPrimaryServices().then(function (services) {
      if (!services.length) {
        warn('No known printer service found on this device.');
        info('The printer may use a service missing from PRINTER_SERVICES in this file.');
        return null;
      }
      ok('Found ' + services.length + ' matching primary service(s).');

      var chain = Promise.resolve(null);
      services.forEach(function (svc) {
        chain = chain.then(function (found) {
          return svc.getCharacteristics().then(function (chrs) {
            var hit = found;
            chrs.forEach(function (c) {
              var p = c.properties;
              var flags = [];
              if (p.write) { flags.push('write'); }
              if (p.writeWithoutResponse) { flags.push('writeWithoutResponse'); }
              if (p.notify) { flags.push('notify'); }
              info('  ' + svc.uuid + ' / ' + c.uuid + ' [' + (flags.join(', ') || 'read only') + ']');
              if (!hit && (p.write || p.writeWithoutResponse)) { hit = c; }
            });
            return hit;
          }).catch(function (e) {
            warn('Could not read characteristics of ' + svc.uuid + ': ' +
                 ((e && e.message) || e));
            return found;
          });
        });
      });
      return chain;
    }, function (e) {
      /* Chrome rejects with NotFoundError when the device exposes none of the
         services we declared, rather than resolving to an empty list. */
      warn('getPrimaryServices() rejected -> ' + ((e && e.name) || 'Error') +
           ': ' + ((e && e.message) || e));
      info('This device exposes none of the services listed in PRINTER_SERVICES.');
      return null;
    });
  }

  function onPrinterLost() {
    warn('Printer disconnected: ' + printer.label);
    printer.chr = null;
    setPrinterState('saved');
  }

  /* ------------------------------------------------------- transport: serial */

  function openSerial() {
    if (printer.writer) { return Promise.resolve(); }

    setPrinterState('connecting');
    info('Opening the serial port at ' + SERIAL_BAUD + ' baud (ignored over RFCOMM)...');

    return printer.port.open({ baudRate: SERIAL_BAUD })
      .catch(function (e) {
        /* Already open from an earlier job in this same page load. */
        if (e && e.name === 'InvalidStateError') {
          info('The port was already open.');
          return;
        }
        throw e;
      })
      .then(function () {
        printer.writer = printer.port.writable.getWriter();
        setPrinterState('connected');
        ok('Serial port open: ' + printer.label);
      });
  }

  function serialSink() {
    return {
      chunk: SERIAL_CHUNK_BYTES,
      write: function (slice) { return printer.writer.write(slice); }
    };
  }

  function chooseSerialPort() {
    info('Opening the serial port chooser...');
    info('Pick the "Standard Serial over Bluetooth link" entry that belongs to the printer.');

    return navigator.serial.requestPort().then(function (port) {
      return navigator.serial.getPorts().then(function (ports) {
        var index = ports.indexOf(port);
        if (index < 0) { index = 0; }

        printer.kind = 'serial';
        printer.port = port;
        printer.writer = null;
        printer.label = describePort(port, index);
        ok('Serial port granted: ' + printer.label);

        writeSaved({ transport: 'serial', name: printer.label, index: index });
      });
    });
  }

  /* ---------------------------------------------------------- transport: BLE */

  function bleSink(chr) {
    var withoutResponse = chr.properties.writeWithoutResponse &&
                          typeof chr.writeValueWithoutResponse === 'function';
    info('Writing with ' + (withoutResponse ? 'writeValueWithoutResponse' : 'writeValue') + '.');
    return {
      chunk: BLE_CHUNK_BYTES,
      write: function (slice) {
        return withoutResponse ? chr.writeValueWithoutResponse(slice) : chr.writeValue(slice);
      }
    };
  }

  function connectBle() {
    if (printer.chr && printer.device.gatt.connected) {
      return Promise.resolve(bleSink(printer.chr));
    }

    setPrinterState('connecting');
    info('Connecting to GATT server...');

    return printer.device.gatt.connect().then(function (server) {
      ok('GATT connected.');
      return findWritable(server);
    }).then(function (chr) {
      if (!chr) {
        throw new Error('no writable characteristic available on this device');
      }
      printer.chr = chr;
      setPrinterState('connected');
      ok('Using ' + chr.uuid + ' on service ' + chr.service.uuid + '.');
      return bleSink(chr);
    });
  }

  function chooseBlePrinter() {
    if (!navigator.bluetooth) {
      err('Web Bluetooth is unavailable in this browser.');
      return;
    }
    info('--- Choosing a BLE printer ---');
    info('Only BLE printers appear here. A Bluetooth Classic (SPP) printer will not.');

    navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: PRINTER_SERVICES
    }).then(function (device) {
      printer.kind = 'ble';
      printer.device = device;
      printer.chr = null;
      printer.label = describeDevice(device);
      device.addEventListener('gattserverdisconnected', onPrinterLost);
      ok('BLE printer selected: ' + printer.label);
      writeSaved({ transport: 'ble', id: device.id, name: printer.label });
      setPrinterState('saved');
      warn('Reconnecting to a BLE printer after a reload needs getDevices(), which is flag-gated.');
    }).catch(function (e) {
      logError('requestDevice()', e);
    });
  }

  /* -------------------------------------------------------------- transport */

  /*
   * Called straight from the print click so that, when nothing is set up yet,
   * requestPort() still runs inside the user gesture. Serial is the fallback
   * because it is the transport whose permission survives a reload unaided.
   */
  function ensurePrinter() {
    if (printer.kind === 'serial' && printer.port) {
      return openSerial().then(serialSink);
    }
    if (printer.kind === 'ble' && printer.device) {
      return connectBle();
    }
    if (!navigator.serial) {
      return Promise.reject(new Error('no printer set up, and navigator.serial is unavailable'));
    }
    return chooseSerialPort().then(openSerial).then(serialSink);
  }

  function closeSerial() {
    var chain = Promise.resolve();
    if (printer.writer) {
      chain = printer.writer.close()
        .catch(function () { /* already errored out; port.close() still applies */ })
        .then(function () { printer.writer = null; });
    }
    return chain.then(function () {
      return printer.port.close();
    });
  }

  function disconnectPrinter() {
    if (printer.kind === 'serial' && printer.port) {
      info('Closing the serial port...');
      setPrinterBusy(true);
      closeSerial().then(function () {
        ok('Serial port closed. It stays granted, so the next print reopens it silently.');
      }).catch(function (e) {
        warn('Could not close the port: ' + ((e && e.message) || e));
      }).then(function () {
        printer.writer = null;
        setPrinterState('saved');
        setPrinterBusy(false);
      });
      return;
    }

    if (printer.kind === 'ble' && printer.device) {
      if (printer.device.gatt.connected) {
        info('Disconnecting ' + printer.label + '...');
        printer.device.gatt.disconnect();
      } else {
        info('Printer is already disconnected.');
      }
      printer.chr = null;
      setPrinterState('saved');
      return;
    }

    info('No printer selected yet.');
  }

  function clearPrinterState() {
    printer.kind = null;
    printer.port = null;
    printer.writer = null;
    printer.device = null;
    printer.chr = null;
    printer.label = '';
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      warn('Could not clear the saved printer: ' + ((e && e.message) || e));
    }
    setPrinterState('no printer');
    ok('Saved printer cleared. The next print opens the chooser.');
  }

  /*
   * Dropping the localStorage entry is not enough: the port permission lives in
   * the browser, so getPorts() would hand the same port back on the next load.
   * forget() revokes it for real.
   */
  function forgetPrinter() {
    if (printer.kind === 'serial' && printer.port) {
      var port = printer.port;
      setPrinterBusy(true);
      closeSerial().catch(function () { /* closing is best effort here */ }).then(function () {
        if (typeof port.forget === 'function') {
          return port.forget().then(function () {
            info('Serial port permission revoked with forget().');
          }).catch(function (e) {
            warn('forget() failed: ' + ((e && e.message) || e));
          });
        }
        warn('SerialPort.forget() is unavailable in this browser.');
        info('The port stays granted; revoke it in the site settings if you need to switch.');
      }).then(function () {
        clearPrinterState();
        setPrinterBusy(false);
      });
      return;
    }

    if (printer.kind === 'ble' && printer.device && printer.device.gatt.connected) {
      info('Disconnecting ' + printer.label + ' before forgetting it...');
      printer.device.gatt.disconnect();
    }
    clearPrinterState();
  }

  function sendJob(label, bytesFor) {
    info('--- ' + label + ' ---');
    setPrinterBusy(true);

    return ensurePrinter()
      .then(function (sink) {
        var bytes = bytesFor();
        return writeChunks(sink, bytes);
      })
      .then(function () {
        ok(label + ' sent to the printer.');
      })
      .catch(function (e) {
        logError(label, e);
        if (e && e.message && e.message.indexOf('no writable characteristic') === 0) {
          info('A Bluetooth Classic (SPP) printer cannot be reached over BLE at all.');
          info('Use "Forget saved printer" and let the print button open the serial chooser instead.');
        }
      })
      .then(function () {
        setPrinterBusy(false);
        info('--- ' + label + ' finished ---');
      });
  }

  function printTextJob() {
    var text = el.printText.value;
    if (!text.trim()) {
      warn('Nothing to print - the text box is empty.');
      return;
    }
    sendJob('Print text', function () { return buildJob(text); });
  }

  function feedAndCut() {
    sendJob('Feed & cut', function () {
      return new Uint8Array([
        0x1b, 0x64, 0x03, // ESC d 3 - feed 3 lines
        0x1d, 0x56, 0x00  // GS V 0  - full cut, ignored when there is no cutter
      ]);
    });
  }

  /* -------------------------------------------------------------- wire */

  el.btnPermission.addEventListener('click', requestPermission);
  el.btnList.addEventListener('click', function () { listDevices(); });
  el.btnClearLog.addEventListener('click', clearLog);
  el.btnPrint.addEventListener('click', printTextJob);
  el.btnFeed.addEventListener('click', feedAndCut);
  el.btnPrinterDisconnect.addEventListener('click', disconnectPrinter);
  el.btnForgetPrinter.addEventListener('click', forgetPrinter);
  el.btnConnectBle.addEventListener('click', chooseBlePrinter);

  checkSupport();
  restoreSavedPrinter();
})();
