import 'package:flutter/material.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:url_launcher/url_launcher.dart';

import 'bridge/js_shim.dart';
import 'bridge/native_bridge.dart';
import 'config.dart';

/// Full-screen WebView that hosts the Next.js production app + native bridge.
class WebShellPage extends StatefulWidget {
  const WebShellPage({super.key});

  @override
  State<WebShellPage> createState() => _WebShellPageState();
}

class _WebShellPageState extends State<WebShellPage> {
  InAppWebViewController? _controller;
  NativeBridge? _bridge;
  PullToRefreshController? _refresh;

  double _progress = 0;
  bool _offline = false;

  @override
  void initState() {
    super.initState();
    // NOTE: we deliberately do NOT wipe the cache on every launch — that forced
    // the whole site (JS/CSS/images) to re-download each time and made the app
    // slow. Instead the server sends `Cache-Control: no-cache` on the HTML
    // document (so the login page is always fresh) while heavy static assets
    // stay cached. Uninstalling the app still clears everything (Android does
    // that automatically), so there's no stale-data risk.
    _refresh = PullToRefreshController(
      settings: PullToRefreshSettings(color: const Color(0xFFC44E28)),
      onRefresh: () async => _controller?.reload(),
    );
  }

  // Hosts that must stay inside the WebView (our app + the OAuth providers it
  // redirects through), so the login round-trip keeps its cookies/session.
  static const List<String> _authHosts = [
    'accounts.google.com',
    'accounts.youtube.com',
    'oauth2.googleapis.com',
    'content.googleapis.com',
    'ssl.gstatic.com',
    'www.googleapis.com',
  ];

  bool _isInternal(Uri uri) {
    final host = uri.host;
    final ok = AppConfig.allowedHosts.any((h) => host == h || host.endsWith('.$h'));
    if (ok) return true;
    return _authHosts.any((h) => host == h || host.endsWith('.$h'));
  }

  Future<void> _openExternal(Uri uri) async {
    try {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } catch (_) {/* no handler */}
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, _) async {
        if (didPop) return;
        final controller = _controller;
        if (controller != null && await controller.canGoBack()) {
          await controller.goBack();
        }
        // else: stay in the app (don't background it on a single back)
      },
      child: _scaffold(),
    );
  }

  Widget _scaffold() {
    return Scaffold(
      backgroundColor: const Color(0xFFFAF8F6),
      body: SafeArea(
        // Pad BOTH top (status bar) and bottom (navigation bar / gesture pill)
        // so the web content never sits under the system navigation bar.
        bottom: true,
        child: Stack(
          children: [
            InAppWebView(
              initialUrlRequest: URLRequest(url: WebUri(AppConfig.productionUrl)),
              pullToRefreshController: _refresh,
              initialSettings: InAppWebViewSettings(
                javaScriptEnabled: true,
                // Keep the normal HTTP cache so static assets load instantly on
                // repeat visits (server controls HTML freshness via headers).
                cacheEnabled: true,
                clearCache: false,
                cacheMode: CacheMode.LOAD_DEFAULT,
                useShouldOverrideUrlLoading: true,
                mediaPlaybackRequiresUserGesture: false,
                allowsInlineMediaPlayback: true,
                // Opaque (not transparent) — a transparent WebView forces costly
                // per-frame alpha compositing that makes scrolling and page
                // transitions feel laggy/janky. Opaque renders much smoother.
                transparentBackground: false,
                // Android: hybrid composition = smoother WebView rendering.
                useHybridComposition: true,
                supportZoom: false,
                iframeAllow: 'camera; microphone',
                iframeAllowFullscreen: true,
                // Google blocks OAuth inside Android WebViews (the "; wv" UA token),
                // showing a "create account" screen. Present a clean Chrome UA so
                // sign-in is allowed. The web app still detects native via
                // window.CreamNative, not the UA.
                userAgent:
                    'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 '
                    '(KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36',
                thirdPartyCookiesEnabled: true,
                sharedCookiesEnabled: true,
              ),
              onWebViewCreated: (controller) {
                _controller = controller;
                _bridge = NativeBridge(controller)..register();
              },
              onLoadStart: (controller, url) async {
                await controller.evaluateJavascript(source: creamNativeShim());
              },
              onLoadStop: (controller, url) async {
                await controller.evaluateJavascript(source: creamNativeShim());
                _refresh?.endRefreshing();
                _bridge?.emit('ready', {'url': url?.toString()});
              },
              onProgressChanged: (controller, p) {
                if (p == 100) _refresh?.endRefreshing();
                setState(() => _progress = p / 100);
              },
              onReceivedError: (controller, request, error) {
                if (request.isForMainFrame ?? false) {
                  setState(() => _offline = true);
                }
              },
              onPermissionRequest: (controller, request) async {
                // The WebView only forwards getUserMedia to the page if the APP
                // itself holds the OS runtime permission. Without this the camera
                // silently never opens and no prompt appears. So map the requested
                // web resources to Android/iOS runtime permissions and ask first.
                final needed = <Permission>{};
                for (final r in request.resources) {
                  if (r == PermissionResourceType.CAMERA ||
                      r == PermissionResourceType.CAMERA_AND_MICROPHONE) {
                    needed.add(Permission.camera);
                  }
                  if (r == PermissionResourceType.MICROPHONE ||
                      r == PermissionResourceType.CAMERA_AND_MICROPHONE) {
                    needed.add(Permission.microphone);
                  }
                }

                var allGranted = true;
                for (final p in needed) {
                  var status = await p.status;
                  if (!status.isGranted) status = await p.request();
                  if (!status.isGranted) allGranted = false;
                }

                return PermissionResponse(
                  resources: request.resources,
                  action: allGranted
                      ? PermissionResponseAction.GRANT
                      : PermissionResponseAction.DENY,
                );
              },
              shouldOverrideUrlLoading: (controller, navAction) async {
                final uri = navAction.request.url;
                if (uri == null) return NavigationActionPolicy.ALLOW;
                final scheme = uri.scheme.toLowerCase();
                if (scheme == 'http' || scheme == 'https') {
                  if (_isInternal(uri)) return NavigationActionPolicy.ALLOW;
                  await _openExternal(uri);
                  return NavigationActionPolicy.CANCEL;
                }
                await _openExternal(uri);
                return NavigationActionPolicy.CANCEL;
              },
            ),
            if (_progress < 1.0)
              LinearProgressIndicator(
                value: _progress == 0 ? null : _progress,
                minHeight: 2.5,
                backgroundColor: Colors.transparent,
                color: const Color(0xFFC44E28),
              ),
            if (_offline)
              _OfflineView(onRetry: () {
                setState(() => _offline = false);
                _controller?.reload();
              }),
          ],
        ),
      ),
    );
  }
}

class _OfflineView extends StatelessWidget {
  const _OfflineView({required this.onRetry});
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return Container(
      color: const Color(0xFFFAF8F6),
      alignment: Alignment.center,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.wifi_off_rounded, size: 56, color: Color(0xFFC44E28)),
          const SizedBox(height: 16),
          const Text("You're offline",
              style: TextStyle(
                  fontSize: 20, fontWeight: FontWeight.w700, color: Color(0xFF2C1F1A))),
          const SizedBox(height: 6),
          const Text('Check your connection and try again.',
              style: TextStyle(color: Color(0xFF8B7B72))),
          const SizedBox(height: 22),
          FilledButton(
            style: FilledButton.styleFrom(backgroundColor: const Color(0xFFC44E28)),
            onPressed: onRetry,
            child: const Text('Retry'),
          ),
        ],
      ),
    );
  }
}
