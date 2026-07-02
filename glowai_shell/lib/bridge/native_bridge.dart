import 'dart:convert';

import 'package:flutter/services.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:share_plus/share_plus.dart';
import 'package:url_launcher/url_launcher.dart';

import '../config.dart';
import '../services/analytics_service.dart';
import '../services/auth_service.dart';
import '../services/notification_service.dart';
import '../services/permission_service.dart';
import '../services/purchase_service.dart';

/// Routes messages between the web app (window.CreamNative) and native services.
///
/// JS → native:   await CreamNative.call('<action>', payload)   // returns a value
/// native → JS:   bridge.emit('<event>', data)                  // CreamNative.on('<event>', cb)
class NativeBridge {
  NativeBridge(this.controller) {
    NotificationService.instance.onMessageJson =
        (json) => emit('notification', jsonDecode(json));
  }

  final InAppWebViewController controller;

  /// Register the handler the injected JS shim calls.
  void register() {
    controller.addJavaScriptHandler(
      handlerName: AppConfig.jsHandlerName,
      callback: (args) async {
        final msg = (args.isNotEmpty && args.first is Map)
            ? Map<String, dynamic>.from(args.first as Map)
            : <String, dynamic>{};
        final action = (msg['action'] ?? '').toString();
        final payload = (msg['payload'] is Map)
            ? Map<String, dynamic>.from(msg['payload'] as Map)
            : <String, dynamic>{};
        try {
          final data = await _route(action, payload);
          return {'ok': true, 'data': data};
        } catch (e) {
          return {'ok': false, 'error': e.toString()};
        }
      },
    );
  }

  /// Push an event down to the web app.
  Future<void> emit(String event, Object? data) async {
    final js =
        'window.${AppConfig.jsBridgeNamespace} && window.${AppConfig.jsBridgeNamespace}._emit('
        '${jsonEncode(event)}, ${jsonEncode(data)});';
    try {
      await controller.evaluateJavascript(source: js);
    } catch (_) {/* page not ready */}
  }

  Future<Object?> _route(String action, Map<String, dynamic> p) async {
    switch (action) {
      // ── app / device ──
      case 'app.info':
        final info = await PackageInfo.fromPlatform();
        return {
          'platform': 'flutter',
          'appVersion': info.version,
          'build': info.buildNumber,
          'package': info.packageName,
        };
      case 'app.openExternal':
        final url = (p['url'] ?? '').toString();
        if (url.isEmpty) throw 'url required';
        await launchUrl(Uri.parse(url), mode: LaunchMode.externalApplication);
        return true;
      case 'app.share':
        await Share.share((p['text'] ?? '').toString(), subject: p['subject']?.toString());
        return true;
      case 'haptics.vibrate':
        await HapticFeedback.mediumImpact();
        return true;

      // ── native Google sign-in ──
      case 'auth.googleSignIn':
        return AuthService.instance.signIn(); // null if cancelled
      case 'auth.signOut':
        await AuthService.instance.signOut();
        return true;

      // ── analytics ──
      case 'analytics.logEvent':
        await AnalyticsService.instance.logEvent(
          (p['name'] ?? 'event').toString(),
          (p['params'] is Map) ? Map<String, Object?>.from(p['params'] as Map) : null,
        );
        return true;
      case 'analytics.setUserId':
        await AnalyticsService.instance.setUserId(p['userId']?.toString());
        return true;
      case 'analytics.setUserProperty':
        await AnalyticsService.instance
            .setUserProperty((p['name'] ?? '').toString(), p['value']?.toString());
        return true;
      case 'analytics.screen':
        await AnalyticsService.instance.setScreen((p['name'] ?? '').toString());
        return true;

      // ── permissions ──
      case 'permissions.status':
        return PermissionService.instance.status((p['type'] ?? '').toString());
      case 'permissions.request':
        return PermissionService.instance.request((p['type'] ?? '').toString());
      case 'permissions.openSettings':
        return PermissionService.instance.openSettings();

      // ── notifications / push ──
      case 'notifications.requestPermission':
        return NotificationService.instance.requestPermission();
      case 'notifications.getToken':
        return NotificationService.instance.getToken();
      case 'notifications.subscribe':
        await NotificationService.instance.subscribe((p['topic'] ?? '').toString());
        return true;
      case 'notifications.unsubscribe':
        await NotificationService.instance.unsubscribe((p['topic'] ?? '').toString());
        return true;
      case 'notifications.local':
        await NotificationService.instance.showLocal(
          title: (p['title'] ?? 'Cream').toString(),
          body: (p['body'] ?? '').toString(),
          payload: p['payload']?.toString(),
        );
        return true;

      // ── reminders + ringtones ──
      case 'reminders.setWater':
        await NotificationService.instance.setWaterReminder(
          enabled: p['enabled'] == true,
          intervalMinutes: (p['intervalMinutes'] as num?)?.toInt() ?? 60,
          ringtone: (p['ringtone'] as num?)?.toInt() ?? 1,
          sleepEnabled: p['sleepEnabled'] == true,
          sleepStartMin: (p['sleepStartMin'] as num?)?.toInt() ?? 1320,
          sleepEndMin: (p['sleepEndMin'] as num?)?.toInt() ?? 420,
        );
        return true;
      case 'ringtone.preview':
        await NotificationService.instance
            .previewRingtone((p['ringtone'] as num?)?.toInt() ?? 1);
        return true;
      case 'ringtone.stop':
        await NotificationService.instance.stopPreview();
        return true;
      case 'ringtone.set':
        await NotificationService.instance
            .setDefaultRingtone((p['ringtone'] as num?)?.toInt() ?? 1);
        return true;

      // ── purchases (Qonversion) ──
      case 'purchases.configured':
        return PurchaseService.instance.isConfigured;
      case 'purchases.identify':
        await PurchaseService.instance.identify((p['userId'] ?? '').toString());
        return true;
      case 'purchases.logout':
        await PurchaseService.instance.logout();
        return true;
      case 'purchases.offerings':
        return PurchaseService.instance.offerings();
      case 'purchases.purchase':
        return PurchaseService.instance.purchase((p['productId'] ?? '').toString());
      case 'purchases.restore':
        return PurchaseService.instance.restore();
      case 'purchases.entitlements':
        return PurchaseService.instance.entitlements();

      default:
        throw 'unknown action: $action';
    }
  }
}
