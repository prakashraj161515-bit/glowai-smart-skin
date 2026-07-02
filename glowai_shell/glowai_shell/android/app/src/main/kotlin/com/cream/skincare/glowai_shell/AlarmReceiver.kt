package com.cream.skincare.glowai_shell

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import java.util.Calendar

/**
 * Receives the exact alarm (and BOOT_COMPLETED). On fire it starts [AlarmService]
 * to ring, then re-arms the next alarm so the chain keeps going on its own —
 * even if the app process was killed, the system relaunches us to run this.
 */
class AlarmReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent?) {
        val action = intent?.action

        // Re-arm the chain after a reboot / app update.
        if (action == Intent.ACTION_BOOT_COMPLETED ||
            action == "android.intent.action.QUICKBOOT_POWERON" ||
            action == Intent.ACTION_MY_PACKAGE_REPLACED
        ) {
            AlarmScheduler.scheduleNext(context)
            return
        }

        if (action != AlarmScheduler.ACTION_FIRE) return

        val cfg = AlarmScheduler.readConfig(context)
        val enabled = cfg?.optBoolean("enabled", false) == true

        // Always re-arm the next one first, so a thrown exception below can't
        // break the chain.
        AlarmScheduler.scheduleNext(context)
        if (!enabled) return

        // Respect the sleep window — don't ring, just keep the chain alive.
        if (cfg!!.optBoolean("sleepEnabled", false) &&
            inSleepNow(cfg.optInt("sleepStartMin", 1320), cfg.optInt("sleepEndMin", 420))
        ) {
            return
        }

        val ring = cfg.optInt("ringtone", 1)
        val svc = Intent(context, AlarmService::class.java).apply {
            this.action = AlarmService.ACTION_START
            putExtra(AlarmService.EXTRA_RING, ring)
        }
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(svc)
            } else {
                context.startService(svc)
            }
        } catch (_: Exception) {
            // Couldn't start the FGS (rare background-start restriction) — the
            // chain is already re-armed above, so the next one will try again.
        }
    }

    private fun inSleepNow(start: Int, end: Int): Boolean {
        if (start == end) return false
        val c = Calendar.getInstance()
        val m = c.get(Calendar.HOUR_OF_DAY) * 60 + c.get(Calendar.MINUTE)
        return if (start < end) m in start until end else m >= start || m < end
    }
}
