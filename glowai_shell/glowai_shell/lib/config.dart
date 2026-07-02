/// App-wide configuration for the Cream native shell.
class AppConfig {
  /// Production URL of the Next.js web app that the shell hosts.
  static const String productionUrl = 'https://app.creameai.online';

  /// Qonversion project key (Dashboard → Project → Settings).
  /// Override at build time:  --dart-define=QONVERSION_KEY=xxxx
  static const String qonversionProjectKey =
      String.fromEnvironment('QONVERSION_KEY', defaultValue: 'HWkNhSRMSFT5Q1IihdjzRKiBfRMINsR4');

  /// The **Web** Google OAuth client ID (the same one NextAuth uses as
  /// GOOGLE_CLIENT_ID). Passed to google_sign_in as serverClientId so the
  /// returned ID token's audience matches what the website verifies.
  ///   --dart-define=GOOGLE_WEB_CLIENT_ID=xxxxx.apps.googleusercontent.com
  static const String googleWebClientId =
      String.fromEnvironment('GOOGLE_WEB_CLIENT_ID', defaultValue: '');

  /// Hosts the WebView is allowed to load in-app. Anything else opens in the
  /// system browser (Google OAuth, external links, payment redirects, etc.).
  static const List<String> allowedHosts = <String>[
    'app.creameai.online',
    'creameai.online',
    'glowai-smart-skin.vercel.app',
  ];

  /// The JS object the web app talks to:  window.CreamNative.*
  static const String jsBridgeNamespace = 'CreamNative';

  /// The InAppWebView handler name used under the hood.
  static const String jsHandlerName = 'creamNative';
}
