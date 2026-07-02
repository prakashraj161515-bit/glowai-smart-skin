package com.cream.skincare.glowai_shell

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import org.json.JSONObject
import java.util.Calendar

/**
 * Schedules the next water-reminder alarm with the system AlarmManager.
 *
 * We schedule ONE exact alarm at a time and re-arm the next one each time it
 * fires (see [AlarmReceiver]). `setExactAndAllowWhileIdle` wakes the device even
 * in Doze / when locked. Config is read from the same SharedPreferences the
 * Flutter side writes (`cream_water_cfg`), so native and Dart stay in sync.
 */
object AlarmScheduler {
    const val ACTION_FIRE = "cream.alarm.FIRE"
    private const val REQ = 7001

    private fun firePendingIntent(ctx: Context): PendingIntent {
        val i = Intent(ctx, AlarmReceiver::class.java).apply { action = ACTION_FIRE }
        return PendingIntent.getBroadcast(
            ctx, REQ, i,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
    }

    /** Tapping the status-bar alarm icon opens the app. */
    private fun showPendingIntent(ctx: Context): PendingIntent {
        val i = ctx.packageManager.getLaunchIntentForPackage(ctx.packageName)
            ?: Intent(ctx, MainActivity::class.java)
        return PendingIntent.getActivity(
            ctx, REQ + 1, i,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
    }

    /** Read the reminder config Flutter persisted via shared_preferences. */
    fun readConfig(ctx: Context): JSONObject? {
        return try {
            val sp = ctx.getSharedPreferences("FlutterSharedPreferences", Context.MODE_PRIVATE)
            val raw = sp.getString("flutter.cream_water_cfg", null) ?: return null
            JSONObject(raw)
        } catch (_: Exception) {
            null
        }
    }

    private fun minutesOfDay(timeMillis: Long): Int {
        val c = Calendar.getInstance().apply { timeInMillis = timeMillis }
        return c.get(Calendar.HOUR_OF_DAY) * 60 + c.get(Calendar.MINUTE)
    }

    private fun inSleep(timeMillis: Long, start: Int, end: Int): Boolean {
        if (start == end) return false
        val m = minutesOfDay(timeMillis)
        return if (start < end) m in start until end else m >= start || m < end
    }

    /** Push a timestamp forward to the next occurrence of [endMin] (minute-of-day). */
    private fun atMinuteOfDay(fromMillis: Long, endMin: Int): Long {
        val c = Calendar.getInstance().apply {
            timeInMillis = fromMillis
            set(Calendar.HOUR_OF_DAY, endMin / 60)
            set(Calendar.MINUTE, endMin % 60)
            set(Calendar.SECOND, 0)
            set(Calendar.MILLISECOND, 0)
        }
        if (c.timeInMillis <= fromMillis) c.add(Calendar.DAY_OF_YEAR, 1)
        return c.timeInMillis
    }

    /** (Re)schedule the next alarm from the saved config. No-op if disabled. */
    fun scheduleNext(ctx: Context) {
        val cfg = readConfig(ctx)
        val am = ctx.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        val pi = firePendingIntent(ctx)
        if (cfg == null || !cfg.optBoolean("enabled", false)) {
            am.cancel(pi)
            return
        }

        val interval = cfg.optInt("intervalMinutes", 60).coerceAtLeast(1)
        var next = System.currentTimeMillis() + interval * 60_000L

        if (cfg.optBoolean("sleepEnabled", false)) {
            val start = cfg.optInt("sleepStartMin", 1320)
            val end = cfg.optInt("sleepEndMin", 420)
            if (inSleep(next, start, end)) next = atMinuteOfDay(next, end)
        }

        // setAlarmClock() is treated by Android as a real ALARM CLOCK, so it
        // fires even in DEEP DOZE and even WITHOUT a battery-optimisation
        // exemption — exactly how the stock Clock app rings reliably. This is the
        // single most important thing for "rings off-screen on every device".
        // Fall back to exact-allow-while-idle, then inexact, if it ever throws.
        try {
            am.setAlarmClock(
                AlarmManager.AlarmClockInfo(next, showPendingIntent(ctx)), pi)
        } catch (_: Exception) {
            try {
                am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, next, pi)
            } catch (_: Exception) {
                am.set(AlarmManager.RTC_WAKEUP, next, pi)
            }
        }
    }

    fun cancel(ctx: Context) {
        val am = ctx.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        am.cancel(firePendingIntent(ctx))
    }
}
