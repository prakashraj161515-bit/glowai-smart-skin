import 'package:firebase_analytics/firebase_analytics.dart';

/// Thin wrapper around Firebase Analytics, driven from the web app via the bridge.
class AnalyticsService {
  AnalyticsService._();
  static final AnalyticsService instance = AnalyticsService._();

  final FirebaseAnalytics _analytics = FirebaseAnalytics.instance;

  FirebaseAnalytics get raw => _analytics;

  Future<void> logEvent(String name, [Map<String, Object?>? params]) async {
    // Firebase only accepts String/num values; coerce everything else.
    final clean = <String, Object>{};
    params?.forEach((k, v) {
      if (v == null) return;
      if (v is num || v is String) {
        clean[k] = v;
      } else {
        clean[k] = v.toString();
      }
    });
    await _analytics.logEvent(name: name, parameters: clean.isEmpty ? null : clean);
  }

  Future<void> setUserId(String? id) => _analytics.setUserId(id: id);

  Future<void> setUserProperty(String name, String? value) =>
      _analytics.setUserProperty(name: name, value: value);

  Future<void> setScreen(String screenName) =>
      _analytics.logScreenView(screenName: screenName);
}
