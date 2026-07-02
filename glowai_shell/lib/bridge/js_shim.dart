import '../config.dart';

/// JavaScript injected at document start so the web app can talk to native:
///
///   if (window.CreamNative?.isNative) {
///     await window.CreamNative.call('analytics.logEvent', { name: 'face_scan' });
///     window.CreamNative.on('notification', (data) => { ... });
///   }
String creamNativeShim() => '''
(function () {
  if (window.${AppConfig.jsBridgeNamespace} && window.${AppConfig.jsBridgeNamespace}.isNative) return;
  var listeners = {};
  var ns = {
    isNative: true,
    platform: 'flutter',
    // JS -> native. Returns a Promise that resolves with the handler's data.
    call: function (action, payload) {
      try {
        return window.flutter_inappwebview
          .callHandler('${AppConfig.jsHandlerName}', { action: action, payload: payload || {} })
          .then(function (res) {
            if (res && res.ok) return res.data;
            return Promise.reject(new Error(res && res.error ? res.error : 'native error'));
          });
      } catch (e) {
        return Promise.reject(e);
      }
    },
    on: function (event, cb) {
      (listeners[event] = listeners[event] || []).push(cb);
      return function () { ns.off(event, cb); };
    },
    off: function (event, cb) {
      var a = listeners[event]; if (!a) return;
      listeners[event] = a.filter(function (f) { return f !== cb; });
    },
    // native -> JS (called by the shell).
    _emit: function (event, data) {
      (listeners[event] || []).forEach(function (cb) {
        try { cb(data); } catch (e) { console.error('CreamNative listener', e); }
      });
      try {
        window.dispatchEvent(new CustomEvent('creamnative:' + event, { detail: data }));
      } catch (e) {}
    },
  };
  window.${AppConfig.jsBridgeNamespace} = ns;
  try { window.dispatchEvent(new Event('creamnative:ready')); } catch (e) {}
})();
''';
