import 'package:qonversion_flutter/qonversion_flutter.dart';

import '../config.dart';

/// In-app purchases / subscriptions via Qonversion.
///
/// The web app drives everything through the bridge:
///   await CreamNative.call('purchases.offerings')
///   await CreamNative.call('purchases.purchase', { productId: 'premium_yearly' })
///   await CreamNative.call('purchases.restore')
///   await CreamNative.call('purchases.entitlements')
class PurchaseService {
  PurchaseService._();
  static final PurchaseService instance = PurchaseService._();

  bool _initialized = false;

  /// Safe field read for SDK objects whose getters vary across versions.
  static String? _s(dynamic Function() f) {
    try {
      final v = f();
      return v?.toString();
    } catch (_) {
      return null;
    }
  }

  void init() {
    if (_initialized) return;
    const key = AppConfig.qonversionProjectKey;
    if (key.isEmpty) return; // not configured yet — no-op
    final config = QonversionConfigBuilder(
      key,
      QLaunchMode.subscriptionManagement,
    ).build();
    Qonversion.initialize(config);
    _initialized = true;
  }

  bool get isConfigured => _initialized;

  Future<void> identify(String userId) async {
    if (!_initialized) return;
    await Qonversion.getSharedInstance().identify(userId);
  }

  Future<void> logout() async {
    if (!_initialized) return;
    await Qonversion.getSharedInstance().logout();
  }

  Future<Map<String, dynamic>> offerings() async {
    _ensure();
    final offerings = await Qonversion.getSharedInstance().offerings();
    List productsOf(dynamic offering) {
      if (offering == null) return const [];
      try {
        return (offering.products as List).map(_productJson).toList();
      } catch (_) {
        return const [];
      }
    }

    final dynamic o = offerings;
    return {
      'main': productsOf(_s(() => o.main) == null ? null : o.main),
      'all': () {
        try {
          return (o.availableOfferings as List)
              .map((off) => {
                    'id': _s(() => off.id),
                    'products': productsOf(off),
                  })
              .toList();
        } catch (_) {
          return const [];
        }
      }(),
    };
  }

  Future<Map<String, dynamic>> purchase(String productId) async {
    _ensure();
    final model = QPurchaseModel(productId);
    final entitlements = await Qonversion.getSharedInstance().purchase(model);
    return {'success': true, 'entitlements': _entMap(entitlements)};
  }

  Future<Map<String, dynamic>> restore() async {
    _ensure();
    final entitlements = await Qonversion.getSharedInstance().restore();
    return {'success': true, 'entitlements': _entMap(entitlements)};
  }

  Future<Map<String, dynamic>> entitlements() async {
    _ensure();
    final entitlements = await Qonversion.getSharedInstance().checkEntitlements();
    return {'entitlements': _entMap(entitlements)};
  }

  void _ensure() {
    if (!_initialized) {
      throw StateError(
          'Qonversion is not configured. Pass --dart-define=QONVERSION_KEY=...');
    }
  }

  Map<String, dynamic> _entMap(Map<String, dynamic> ents) {
    final out = <String, dynamic>{};
    ents.forEach((key, e) {
      out[key] = {
        'id': _s(() => e.id),
        'active': () {
          try {
            return e.isActive == true;
          } catch (_) {
            return false;
          }
        }(),
        'productId': _s(() => e.productId),
        'startedAt': _s(() => e.startedDate?.toIso8601String()),
        'expiresAt': _s(() => e.expirationDate?.toIso8601String()),
        'renewState': _s(() => e.renewState),
      };
    });
    return out;
  }

  Map<String, dynamic> _productJson(dynamic p) {
    return {
      'id': _s(() => p.qonversionId),
      'storeId': _s(() => p.storeId),
      'title': _s(() => p.storeTitle) ?? _s(() => p.prettyPrice),
      'price': _s(() => p.prettyPrice),
      'currency': _s(() => p.currencyCode),
      'description': _s(() => p.storeDescription),
    };
  }
}
