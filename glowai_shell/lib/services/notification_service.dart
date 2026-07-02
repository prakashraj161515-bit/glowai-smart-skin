import 'dart:convert';
import 'dart:typed_data';

import 'package:audioplayers/audioplayers.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:android_intent_plus/android_intent.dart';
import 'package:android_intent_plus/flag.dart';
import 'package:device_info_plus/device_info_plus.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:flutter_foreground_task/flutter_foreground_task.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:flutter_timezone/flutter_timezone.dart';
import 'package:permission_handler/permission_handler.dart';

import 'water_reminder_task.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:timezone/data/latest.dart' as tzdata;
import 'package:timezone/timezone.dart' as tz;

/// Handles push (FCM) + local notifications. Push payloads are forwarded to the
/// web app via [onMessageJson] so the website can react (deep-link, refresh…).
class NotificationService {
  NotificationService._();
  static final NotificationService instance = NotificationService._();

  /// Wired to MaterialApp so we can show native dialogs (e.g. the one-time
  /// "enable Auto-start" setup guide) over the web content.
  static final GlobalKey<NavigatorState> navigatorKey =
      GlobalKey<NavigatorState>();

  // Lazy: accessing FirebaseMessaging.instance throws if Firebase isn't
  // configured yet. Keeping it a getter means just *constructing* this service
  // (e.g. from the bridge) never throws — only real push calls touch Firebase.
  FirebaseMessaging get _fcm => FirebaseMessaging.instance;
  final FlutterLocalNotificationsPlugin _local =
      FlutterLocalNotificationsPlugin();

  /// Called with a JSON string whenever a push/local notification arrives or is tapped.
  void Function(String json)? onMessageJson;

  bool _ready = false;

  /// Configure the foreground-service options. Call once at app startup BEFORE
  /// starting the service.
  static void initForegroundTask() {
    FlutterForegroundTask.initCommunicationPort();
    FlutterForegroundTask.init(
      androidNotificationOptions: AndroidNotificationOptions(
        channelId: 'cream_water_fg',
        channelName: 'Water reminder service',
        channelDescription: 'Keeps your water reminders running on time.',
        channelImportance: NotificationChannelImportance.LOW,
        priority: NotificationPriority.LOW,
        onlyAlertOnce: true,
      ),
      iosNotificationOptions: const IOSNotificationOptions(),
      foregroundTaskOptions: ForegroundTaskOptions(
        // The exact alarms do the actual ringing; the service just refreshes the
        // rolling alarm window every 30 min so it never runs out.
        eventAction: ForegroundTaskEventAction.repeat(1800000),
        autoRunOnBoot: true,
        autoRunOnMyPackageReplaced: true,
        allowWakeLock: true,
        allowWifiLock: false,
      ),
    );
  }

  Future<void> init() async {
    if (_ready) return;
    _ready = true;

    // Timezone setup so we can schedule reminders at real clock-times.
    try {
      tzdata.initializeTimeZones();
      final localTz = await FlutterTimezone.getLocalTimezone();
      tz.setLocalLocation(tz.getLocation(localTz));
    } catch (_) {}

    try {
      _defaultRing =
          (await SharedPreferences.getInstance()).getInt('cream_default_ring') ?? 1;
    } catch (_) {}

    const androidInit = AndroidInitializationSettings('@mipmap/ic_launcher');
    const iosInit = DarwinInitializationSettings(
      requestAlertPermission: false,
      requestBadgePermission: false,
      requestSoundPermission: false,
    );
    await _local.initialize(
      const InitializationSettings(android: androidInit, iOS: iosInit),
      onDidReceiveNotificationResponse: (resp) {
        if (resp.payload != null) onMessageJson?.call(resp.payload!);
      },
    );

    // Push (FCM) is optional — only wire it if Firebase is configured. Wrapped
    // so a missing Firebase never breaks local notifications / reminders.
    try {
      FirebaseMessaging.onMessage.listen((m) {
        _showLocal(m);
        _emit(m, tapped: false);
      });
      FirebaseMessaging.onMessageOpenedApp.listen((m) => _emit(m, tapped: true));
      final initial = await _fcm.getInitialMessage();
      if (initial != null) _emit(initial, tapped: true);
    } catch (_) {/* Firebase not configured — push disabled, local still works */}
  }

  Future<String> requestPermission() async {
    final settings = await _fcm.requestPermission(alert: true, badge: true, sound: true);
    switch (settings.authorizationStatus) {
      case AuthorizationStatus.authorized:
      case AuthorizationStatus.provisional:
        return 'granted';
      case AuthorizationStatus.denied:
        return 'denied';
      default:
        return 'not_determined';
    }
  }

  Future<String?> getToken() => _fcm.getToken();

  Future<void> subscribe(String topic) => _fcm.subscribeToTopic(topic);
  Future<void> unsubscribe(String topic) => _fcm.unsubscribeFromTopic(topic);

  Future<void> showLocal({
    required String title,
    required String body,
    String? payload,
  }) async {
    await init();
    // Use the user's chosen ringtone for EVERY notification, not just water.
    final android = await _ringChannel(_defaultRing);
    final details = NotificationDetails(
      android: android,
      iOS: const DarwinNotificationDetails(),
    );
    await _local.show(
      DateTime.now().millisecondsSinceEpoch ~/ 1000, title, body, details,
      payload: payload,
    );
  }

  Future<void> _showLocal(RemoteMessage m) async {
    final n = m.notification;
    if (n == null) return;
    await showLocal(
      title: n.title ?? 'Cream',
      body: n.body ?? '',
      payload: jsonEncode(m.data),
    );
  }

  void _emit(RemoteMessage m, {required bool tapped}) {
    onMessageJson?.call(jsonEncode({
      'tapped': tapped,
      'title': m.notification?.title,
      'body': m.notification?.body,
      'data': m.data,
    }));
  }

  // ───────────────────────── Ringtones + Water reminder ─────────────────────
  // 15 bundled tones live in android/res/raw/ring_1..ring_15 (for the alarm
  // sound) and assets/ringtones/ring_*.wav (for in-app preview playback).
  static const int waterReminderId = 1001;
  final AudioPlayer _player = AudioPlayer();
  // The ringtone the user picked — used for ALL notifications. Persisted so it
  // survives restarts and applies even to notifications shown later.
  int _defaultRing = 1;

  int _clampRing(int r) => (r < 1 || r > 15) ? 1 : r;

  /// Create (if needed) the channel for [ring] and return matching details.
  /// Android binds a sound to a CHANNEL at creation, so each tone has its own.
  /// When [insistent] is true the sound LOOPS (FLAG_INSISTENT) until the
  /// notification is dismissed — used by the water reminder so it keeps ringing.
  Future<AndroidNotificationDetails> _ringChannel(int ring,
      {bool insistent = false}) async {
    ring = _clampRing(ring);
    final id = 'cream_ring_$ring';
    final name = 'Cream Reminders (tone $ring)';
    final sound = RawResourceAndroidNotificationSound('ring_$ring');
    await _local
        .resolvePlatformSpecificImplementation<
            AndroidFlutterLocalNotificationsPlugin>()
        ?.createNotificationChannel(AndroidNotificationChannel(
      id, name,
      description: 'Cream notifications & reminders',
      importance: Importance.max, playSound: true, sound: sound,
      enableVibration: true,
      audioAttributesUsage: AudioAttributesUsage.alarm, // ALARM volume (loud)
    ));
    return AndroidNotificationDetails(
      id, name,
      channelDescription: 'Cream notifications & reminders',
      importance: Importance.max, priority: Priority.max,
      playSound: true, sound: sound,
      enableVibration: true,
      category: AndroidNotificationCategory.alarm,
      audioAttributesUsage: AudioAttributesUsage.alarm,
      // Clean water-drop status-bar icon, tinted water-blue.
      icon: 'ic_water_notification',
      color: const Color(0xFF2E9BE6), // water blue accent
      // The reminder behaves like a real alarm: pop up on top (heads-up + full
      // screen), keep ringing (FLAG_INSISTENT loops the sound), and STAY on the
      // screen — it can't be swiped away and never auto-disappears. Only the
      // "Stop" button silences it and removes it.
      additionalFlags: insistent ? Int32List.fromList(<int>[4]) : null,
      ongoing: insistent,        // can't be swiped away
      autoCancel: !insistent,    // and doesn't auto-dismiss while ringing
      fullScreenIntent: insistent, // show prominently on top / over lock screen
      actions: insistent
          ? <AndroidNotificationAction>[
              const AndroidNotificationAction(
                'cream_stop', 'Stop',
                cancelNotification: true, // the only way to silence + dismiss
                showsUserInterface: false,
              ),
            ]
          : null,
    );
  }

  /// Ask the OS for POST_NOTIFICATIONS permission (Android 13+).
  Future<void> requestNotificationPermission() async {
    try {
      await _local
          .resolvePlatformSpecificImplementation<
              AndroidFlutterLocalNotificationsPlugin>()
          ?.requestNotificationsPermission();
    } catch (_) {}
  }

  /// Ask the OS for exact-alarm permission (needed on Android 13+ so reminders
  /// fire on time when the app is closed). Safe to call repeatedly.
  Future<void> _ensureExactAlarms() async {
    try {
      await _local
          .resolvePlatformSpecificImplementation<
              AndroidFlutterLocalNotificationsPlugin>()
          ?.requestExactAlarmsPermission();
    } catch (_) {}
  }

  static const List<String> _aggressiveOems = [
    'xiaomi', 'redmi', 'poco', 'oppo', 'realme', 'vivo', 'iqoo',
    'oneplus', 'huawei', 'honor', 'letv', 'asus', 'meizu',
  ];
  /// On aggressive OEMs (Vivo/Oppo/Xiaomi/Realme…) scheduled reminders don't fire
  /// when the screen is LOCKED unless the app is (1) exempt from battery
  /// optimisation AND (2) allowed background activity. We prompt for BOTH — each
  /// using Android's / the OEM's own screen, no custom popups — and EXACTLY ONCE
  /// each (`cream_batt_asked` / `cream_bg_asked` flags) so they never nag again.
  /// Only runs on aggressive OEMs while the reminder is ON (stock Android is fine
  /// without any of this).
  Future<void> showReminderSetupPopup() async {
    try {
      final mfr =
          (await DeviceInfoPlugin().androidInfo).manufacturer.toLowerCase();
      if (!_aggressiveOems.any(mfr.contains)) return; // stock Android is fine

      final prefs = await SharedPreferences.getInstance();
      await prefs.reload();

      final raw = prefs.getString(_waterCfgKey);
      if (raw == null) return;
      if ((jsonDecode(raw) as Map)['enabled'] != true) return; // reminder off

      // 1) Battery optimisation — Android's own one-tap Allow dialog, once.
      final battOk = await Permission.ignoreBatteryOptimizations.isGranted;
      if (!battOk && prefs.getBool('cream_batt_asked') != true) {
        await prefs.setBool('cream_batt_asked', true);
        await Permission.ignoreBatteryOptimizations.request();
      }

      // 2) Background activity — the OEM "Allow background activity / No
      //    restrictions" screen (no Android dialog exists for this), once.
      if (prefs.getBool('cream_bg_asked') != true) {
        await prefs.setBool('cream_bg_asked', true);
        await _openBackgroundSettings();
      }
    } catch (_) {}
  }

  /// Open the OEM "background activity / auto-start" screen (or the app's info
  /// page as a fallback) with a floating hint of what to toggle there.
  Future<void> _openBackgroundSettings() async {
    try {
      const pkg = 'package:com.cream.skincare.glowai_shell';
      const candidates = <List<String>>[
        ['com.miui.securitycenter', 'com.miui.permcenter.autostart.AutoStartManagementActivity'],
        ['com.coloros.safecenter', 'com.coloros.safecenter.permission.startup.StartupAppListActivity'],
        ['com.coloros.safecenter', 'com.coloros.safecenter.startupapp.StartupAppListActivity'],
        ['com.oppo.safe', 'com.oppo.safe.permission.startup.StartupAppListActivity'],
        ['com.vivo.permissionmanager', 'com.vivo.permissionmanager.activity.BgStartUpManagerActivity'],
        ['com.iqoo.secure', 'com.iqoo.secure.ui.phoneoptimize.BgStartUpManager'],
        ['com.iqoo.secure', 'com.iqoo.secure.ui.phoneoptimize.AddWhiteListActivity'],
        ['com.huawei.systemmanager', 'com.huawei.systemmanager.startupmgr.ui.StartupNormalAppListActivity'],
        ['com.oneplus.security', 'com.oneplus.security.chainlaunch.view.ChainLaunchAppListActivity'],
        ['com.letv.android.letvsafe', 'com.letv.android.letvsafe.AutobootManageActivity'],
        ['com.asus.mobilemanager', 'com.asus.mobilemanager.entry.FunctionActivity'],
        ['com.meizu.safe', 'com.meizu.safe.security.SHOW_APPSEC'],
      ];
      AndroidIntent? target;
      var foundList = false;
      for (final cmp in candidates) {
        final intent = AndroidIntent(
          action: 'android.intent.action.MAIN',
          package: cmp[0],
          componentName: cmp[1],
          flags: <int>[Flag.FLAG_ACTIVITY_NEW_TASK],
        );
        try {
          if (await intent.canResolveActivity() == true) {
            target = intent;
            foundList = true;
            break;
          }
        } catch (_) {/* try next candidate */}
      }
      // Fallback: the app's own info/battery page (Vivo's screens aren't exported).
      target ??= AndroidIntent(
        action: 'android.settings.APPLICATION_DETAILS_SETTINGS',
        data: pkg,
        flags: <int>[Flag.FLAG_ACTIVITY_NEW_TASK],
      );
      try {
        await Fluttertoast.showToast(
          msg: foundList
              ? 'Find "Cream" and turn it ON ✅'
              : 'Battery → No restrictions / Allow background ✅',
          toastLength: Toast.LENGTH_LONG,
          gravity: ToastGravity.CENTER,
          backgroundColor: const Color(0xFF1C1C1E),
          textColor: const Color(0xFFFFFFFF),
          fontSize: 16,
        );
      } catch (_) {}
      try {
        await target.launch();
      } catch (_) {}
    } catch (_) {}
  }

  /// Set the global ringtone used by every notification + reminder.
  Future<void> setDefaultRingtone(int ring) async {
    _defaultRing = _clampRing(ring);
    try {
      (await SharedPreferences.getInstance())
          .setInt('cream_default_ring', _defaultRing);
    } catch (_) {}
  }

  /// Preview a ringtone instantly (used by the settings screen).
  Future<void> previewRingtone(int ring) async {
    ring = _clampRing(ring);
    try {
      await _player.stop();
      await _player.play(AssetSource('ringtones/ring_$ring.wav'));
    } catch (_) {}
  }

  Future<void> stopPreview() async {
    try { await _player.stop(); } catch (_) {}
  }

  // Reserve a block of IDs for the rolling water reminders so we can cancel them.
  static const int _waterIdBase = 1001;
  static const int _waterIdMax = 1180; // 180 one-shot slots
  static const String _waterCfgKey = 'cream_water_cfg';

  /// Talks to the native alarm (AlarmScheduler/AlarmService in Kotlin), which
  /// rings the reminder via a MediaPlayer on the ALARM stream so an incoming
  /// notification can never interrupt it.
  static const MethodChannel _alarm = MethodChannel('cream/alarm');

  Future<void> _cancelWaterReminders() async {
    for (var id = _waterIdBase; id <= _waterIdMax; id++) {
      await _local.cancel(id);
    }
    await _local.cancel(waterReminderId);
  }

  /// True if [t]'s clock-time falls inside the [startMin,endMin) sleep window
  /// (minutes from midnight; the window may wrap past midnight).
  bool _inSleepWindow(tz.TZDateTime t, int startMin, int endMin) {
    final m = t.hour * 60 + t.minute;
    if (startMin == endMin) return false;
    if (startMin < endMin) return m >= startMin && m < endMin;
    return m >= startMin || m < endMin; // wraps midnight
  }

  /// Re-arm the water reminder from saved settings — call on every app start so
  /// the rolling window of alarms is refreshed (keeps firing while app closed).
  Future<void> rearmWaterReminder() async {
    try {
      final raw = (await SharedPreferences.getInstance()).getString(_waterCfgKey);
      if (raw == null) return;
      final c = jsonDecode(raw) as Map<String, dynamic>;
      if (c['enabled'] != true) return;
      await setWaterReminder(
        enabled: true,
        intervalMinutes: (c['intervalMinutes'] as num?)?.toInt() ?? 60,
        ringtone: (c['ringtone'] as num?)?.toInt() ?? 1,
        sleepEnabled: c['sleepEnabled'] == true,
        sleepStartMin: (c['sleepStartMin'] as num?)?.toInt() ?? 1320,
        sleepEndMin: (c['sleepEndMin'] as num?)?.toInt() ?? 420,
        promptPermissions: false, // silent — don't pop permission dialogs
      );
    } catch (_) {}
  }

  /// Enable/disable the water reminder.
  /// [intervalMinutes] = how often it rings. [ringtone] = 1..15.
  /// Sleep mode: if [sleepEnabled], NO reminder rings between [sleepStartMin]
  /// and [sleepEndMin] (minutes from midnight, may wrap past midnight).
  /// Reminders are scheduled at fixed daily clock-times (so they repeat every
  /// day and skip the sleep window). Works while the app is closed.
  Future<void> setWaterReminder({
    required bool enabled,
    required int intervalMinutes,
    required int ringtone,
    bool sleepEnabled = false,
    int sleepStartMin = 1320, // 22:00
    int sleepEndMin = 420,    // 07:00
    bool promptPermissions = true, // false on silent app-start re-arm
  }) async {
    await init();
    await setDefaultRingtone(ringtone);
    await _cancelWaterReminders();

    // Persist the config so we can re-arm the rolling window on every app start.
    try {
      final prefs = await SharedPreferences.getInstance();
      if (!enabled) {
        await prefs.remove(_waterCfgKey);
      } else {
        await prefs.setString(_waterCfgKey, jsonEncode({
          'enabled': true,
          'intervalMinutes': intervalMinutes,
          'ringtone': ringtone,
          'sleepEnabled': sleepEnabled,
          'sleepStartMin': sleepStartMin,
          'sleepEndMin': sleepEndMin,
        }));
      }
    } catch (_) {}

    if (!enabled) {
      try {
        await _alarm.invokeMethod('cancel'); // cancel native alarm + silence ring
      } catch (_) {}
      await stopWaterService();
      return;
    }
    if (promptPermissions) {
      // Only when the user actively turns the reminder ON — never on the silent
      // app-start re-arm. Each helper already no-ops if already granted, so an
      // allowed permission won't pop up again; a denied one shows next time.
      await requestNotificationPermission(); // ensure we can post (Android 13+)
      await _ensureExactAlarms(); // fire EXACTLY on time even when locked/Doze
      await showReminderSetupPopup(); // battery + background allow guide (once/launch)
    }

    // Two layers for rock-solid reminders on every device:
    //  1) A NATIVE EXACT alarm (AlarmScheduler) actually rings the reminder — it
    //     wakes the CPU at the right moment even when the screen is LOCKED / in
    //     Doze, and plays the sound via a MediaPlayer (interrupt-proof). Each
    //     fire re-arms the next, so the chain self-sustains.
    //  2) A FOREGROUND SERVICE keeps the app process alive so the alarm is never
    //     cancelled by an aggressive OEM.
    try {
      await _alarm.invokeMethod('reschedule'); // native reads the saved config
    } catch (_) {}
    await startWaterService();
  }

  /// (Re)start the foreground service that drives the water reminder.
  Future<void> startWaterService() async {
    try {
      if (await FlutterForegroundTask.isRunningService) {
        await FlutterForegroundTask.restartService();
        return;
      }
      await FlutterForegroundTask.startService(
        serviceId: 4421,
        notificationTitle: '💧 Water reminder is on',
        notificationText: 'Cream will remind you to drink water.',
        callback: waterReminderCallback,
      );
    } catch (_) {}
  }

  /// Stop the foreground service and clear all scheduled + ringing reminders.
  Future<void> stopWaterService() async {
    try {
      await FlutterForegroundTask.stopService();
      await _cancelWaterReminders();
    } catch (_) {}
  }
}

/// One numbered step row inside the setup-guide dialog.
