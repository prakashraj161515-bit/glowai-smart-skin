import 'package:permission_handler/permission_handler.dart';

/// Maps web-friendly permission names to native permissions and requests them.
class PermissionService {
  PermissionService._();
  static final PermissionService instance = PermissionService._();

  Permission? _map(String name) {
    switch (name.toLowerCase()) {
      case 'camera':
        return Permission.camera;
      case 'microphone':
      case 'mic':
        return Permission.microphone;
      case 'photos':
      case 'gallery':
        return Permission.photos;
      case 'notifications':
      case 'notification':
        return Permission.notification;
      case 'storage':
        return Permission.storage;
      default:
        return null;
    }
  }

  Future<String> status(String name) async {
    final p = _map(name);
    if (p == null) return 'unsupported';
    return _statusToString(await p.status);
  }

  Future<String> request(String name) async {
    final p = _map(name);
    if (p == null) return 'unsupported';
    return _statusToString(await p.request());
  }

  Future<bool> openSettings() => openAppSettings();

  String _statusToString(PermissionStatus s) {
    if (s.isGranted) return 'granted';
    if (s.isPermanentlyDenied) return 'permanently_denied';
    if (s.isRestricted) return 'restricted';
    if (s.isLimited) return 'limited';
    return 'denied';
  }
}
