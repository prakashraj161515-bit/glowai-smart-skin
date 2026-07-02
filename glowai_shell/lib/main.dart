import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'services/notification_service.dart';
import 'services/purchase_service.dart';
import 'web_shell_page.dart';

/// Background/terminated push handler (must be a top-level function).
@pragma('vm:entry-point')
Future<void> _firebaseBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp();
}

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Make the system bars blend with the app (light bg, dark icons) so the
  // bottom navigation bar no longer overlaps / clashes with the web content.
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.dark,
    statusBarBrightness: Brightness.light,
    systemNavigationBarColor: Color(0xFFFAF8F6),
    systemNavigationBarIconBrightness: Brightness.dark,
    systemNavigationBarDividerColor: Color(0xFFFAF8F6),
  ));

  // Notifications/reminders work WITHOUT Firebase — init them first, always.
  try {
    NotificationService.initForegroundTask(); // configure the FG service
    await NotificationService.instance.init();
  } catch (e) {
    debugPrint('Notification init failed: $e');
  }

  // Re-arm the water reminder (restart its foreground service) once the app is
  // actually in the foreground — Android forbids starting a foreground service
  // from the background, so this must run AFTER the first frame, not in early
  // main(). Silent: no permission popups.
  WidgetsBinding.instance.addPostFrameCallback((_) async {
    try {
      await NotificationService.instance.rearmWaterReminder();
      // Show the setup card once per app-open (only if the reminder is on and
      // background access isn't granted yet). Small delay so the web UI settles.
      await Future.delayed(const Duration(milliseconds: 900));
      await NotificationService.instance.showReminderSetupPopup();
    } catch (_) {}
  });

  // Firebase is optional until google-services.json / GoogleService-Info.plist
  // are added — the shell still runs without them.
  try {
    await Firebase.initializeApp();
    FirebaseMessaging.onBackgroundMessage(_firebaseBackgroundHandler);
  } catch (e) {
    debugPrint('Firebase not configured yet: $e');
  }

  // Qonversion is a no-op until QONVERSION_KEY is provided.
  PurchaseService.instance.init();

  runApp(const CreamShellApp());
}

class CreamShellApp extends StatelessWidget {
  const CreamShellApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Cream — AI Skin Care & Scanner',
      debugShowCheckedModeBanner: false,
      navigatorKey: NotificationService.navigatorKey,
      theme: ThemeData(
        useMaterial3: true,
        colorSchemeSeed: const Color(0xFFC44E28),
        scaffoldBackgroundColor: const Color(0xFFFAF8F6),
      ),
      home: const WebShellPage(),
    );
  }
}
