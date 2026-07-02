import 'dart:convert';
import 'dart:typed_data';
import 'dart:ui' show Color;

import 'package:flutter_foreground_task/flutter_foreground_task.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:flutter_timezone/flutter_timezone.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:timezone/data/latest.dart' as tzdata;
import 'package:timezone/timezone.dart' as tz;

const String kWaterCfgKey = 'cream_water_cfg';
const int _idBase = 1001;
const int _idMax = 1180; // 180 one-shot exact-alarm slots
const String _title = '💧 Time to drink water';
const String _body = 'Stay hydrated — take a few sips now.';

bool _tzReady = false;
Future<void> _ensureTz() async {
  if (_tzReady) return;
  try {
    tzdata.initializeTimeZones();
    tz.setLocalLocation(tz.getLocation(await FlutterTimezone.getLocalTimezone()));
    _tzReady = true;
  } catch (_) {}
}

bool _inSleep(tz.TZDateTime t, int start, int end) {
  final m = t.hour * 60 + t.minute;
  if (start == end) return false;
  if (start < end) return m >= start && m < end;
  return m >= start || m < end; // wraps midnight
}

/// Build the ringing-reminder details (and create its channel). Shared so the
/// alarm posts the same loud, ongoing notification with a Stop button + icon
/// no matter which isolate scheduled it.
Future<NotificationDetails> buildReminderDetails(
    FlutterLocalNotificationsPlugin local, int ring) async {
  if (ring < 1 || ring > 15) ring = 1;
  final id = 'cream_ring_$ring';
  final sound = RawResourceAndroidNotificationSound('ring_$ring');
  await local
      .resolvePlatformSpecificImplementation<
          AndroidFlutterLocalNotificationsPlugin>()
      ?.createNotificationChannel(AndroidNotificationChannel(
    id, 'Cream Reminders (tone $ring)',
    description: 'Cream water reminders',
    importance: Importance.max, playSound: true, sound: sound,
    enableVibration: true,
    audioAttributesUsage: AudioAttributesUsage.alarm,
  ));
  final android = AndroidNotificationDetails(
    id, 'Cream Reminders (tone $ring)',
    channelDescription: 'Cream water reminders',
    importance: Importance.max, priority: Priority.max,
    playSound: true, sound: sound,
    enableVibration: true,
    category: AndroidNotificationCategory.alarm,
    audioAttributesUsage: AudioAttributesUsage.alarm,
    icon: 'ic_water_notification',
    color: const Color(0xFF2E9BE6),
    additionalFlags: Int32List.fromList(<int>[4]), // FLAG_INSISTENT (loops sound)
    ongoing: true,        // can't be swiped away — only the Stop button silences it
    autoCancel: false,
    timeoutAfter: 60000,  // …or it auto-stops on its own after 1 minute
    fullScreenIntent: true, // wake + show over the lock screen
    actions: const <AndroidNotificationAction>[
      AndroidNotificationAction('cream_stop', 'Stop',
          cancelNotification: true, showsUserInterface: false),
    ],
  );
  return NotificationDetails(android: android);
}

/// (Re)schedule a rolling window of ONE-SHOT EXACT alarms from the saved config.
/// Exact (`exactAllowWhileIdle`) alarms wake the CPU at the right moment even
/// when the phone is locked / in Doze — which a foreground-service Handler timer
/// can't. The foreground service's only job is to keep the app alive so these
/// alarms are never cancelled by an aggressive OEM.
Future<void> scheduleWaterReminderAlarms(
    FlutterLocalNotificationsPlugin local) async {
  await _ensureTz();
  // Clear any previously scheduled reminders first.
  for (var id = _idBase; id <= _idMax; id++) {
    await local.cancel(id);
  }
  Map<String, dynamic> c;
  try {
    final prefs = await SharedPreferences.getInstance();
    await prefs.reload();
    final raw = prefs.getString(kWaterCfgKey);
    if (raw == null) return;
    c = jsonDecode(raw) as Map<String, dynamic>;
  } catch (_) {
    return;
  }
  if (c['enabled'] != true) return;

  var step = (c['intervalMinutes'] as num?)?.toInt() ?? 60;
  if (step < 1) step = 1;
  final ring = (c['ringtone'] as num?)?.toInt() ?? 1;
  final sleepEnabled = c['sleepEnabled'] == true;
  final sleepStart = (c['sleepStartMin'] as num?)?.toInt() ?? 1320;
  final sleepEnd = (c['sleepEndMin'] as num?)?.toInt() ?? 420;

  final details = await buildReminderDetails(local, ring);
  final slots = _idMax - _idBase + 1; // 180
  final now = tz.TZDateTime.now(tz.local);
  var scheduled = 0;
  for (var k = 1; scheduled < slots && k <= slots * 4; k++) {
    final when = now.add(Duration(minutes: step * k));
    if (sleepEnabled && _inSleep(when, sleepStart, sleepEnd)) continue;
    try {
      await local.zonedSchedule(
        _idBase + scheduled, _title, _body, when, details,
        androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
        uiLocalNotificationDateInterpretation:
            UILocalNotificationDateInterpretation.absoluteTime,
      );
    } catch (_) {}
    scheduled++;
  }
}

/// Entry point for the foreground-service isolate. Must be top-level.
@pragma('vm:entry-point')
void waterReminderCallback() {
  FlutterForegroundTask.setTaskHandler(WaterReminderTaskHandler());
}

/// The foreground service's ONLY job now is to keep the app process alive so an
/// aggressive OEM can't force-stop it (which would cancel the native alarm
/// chain). The actual ringing + re-arming is done natively (AlarmScheduler /
/// AlarmReceiver / AlarmService in Kotlin), which plays the sound on the ALARM
/// stream so an incoming notification can't interrupt it. The chain self-arms
/// on each fire, and is also re-armed on boot and on every app open.
class WaterReminderTaskHandler extends TaskHandler {
  @override
  Future<void> onStart(DateTime timestamp, TaskStarter starter) async {}

  @override
  void onRepeatEvent(DateTime timestamp) {}

  @override
  Future<void> onDestroy(DateTime timestamp) async {}
}
