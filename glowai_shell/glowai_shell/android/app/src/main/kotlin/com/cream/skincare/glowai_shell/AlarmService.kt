package com.cream.skincare.glowai_shell

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.media.AudioAttributes
import android.media.MediaPlayer
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.os.PowerManager
import android.widget.RemoteViews

/**
 * Foreground service that plays the water-reminder alarm.
 *
 * The sound is played by a MediaPlayer on the ALARM stream (NOT the notification
 * sound), so an incoming notification can never interrupt it. It rings for 30s,
 * or until the user taps the "Stop" action. The notification is ongoing (can't be
 * swiped away) and uses a full-screen intent so it shows over the lock screen.
 */
class AlarmService : Service() {
    companion object {
        const val ACTION_START = "cream.alarm.START"
        const val ACTION_STOP = "cream.alarm.STOP"
        const val EXTRA_RING = "ring"
        const val EXTRA_TITLE = "title"
        const val EXTRA_BODY = "body"
        const val NOTIF_ID = 1001
        const val CHANNEL_ID = "cream_alarm"
        const val RING_MILLIS = 10_000L // 10 seconds
    }

    private var player: MediaPlayer? = null
    private var wakeLock: PowerManager.WakeLock? = null
    private var screenLock: PowerManager.WakeLock? = null
    private val handler = Handler(Looper.getMainLooper())
    private val stopRunnable = Runnable { stopSelf() }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (intent?.action == ACTION_STOP) {
            stopSelf()
            return START_NOT_STICKY
        }

        val ring = intent?.getIntExtra(EXTRA_RING, 1)?.coerceIn(1, 15) ?: 1
        val title = intent?.getStringExtra(EXTRA_TITLE) ?: "💧 Time to drink water"
        val body = intent?.getStringExtra(EXTRA_BODY) ?: "Stay hydrated — take a few sips now."

        startForeground(NOTIF_ID, buildNotification(title, body))
        startSound(ring)

        // Auto-stop after 30 seconds.
        handler.removeCallbacks(stopRunnable)
        handler.postDelayed(stopRunnable, RING_MILLIS)
        return START_NOT_STICKY
    }

    private fun startSound(ring: Int) {
        try {
            // Release any sound still playing from a previous fire so players
            // never stack up / leak (each would keep ringing forever otherwise).
            releaseSound()

            // Keep the CPU awake for the full ring even while the screen is off.
            val pm = getSystemService(Context.POWER_SERVICE) as PowerManager
            wakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "cream:alarm").apply {
                setReferenceCounted(false)
                acquire(RING_MILLIS + 5_000L)
            }

            // Light up the screen (without opening the app) so the notification
            // is visible over the lock screen while it rings.
            try {
                @Suppress("DEPRECATION")
                screenLock = pm.newWakeLock(
                    PowerManager.SCREEN_BRIGHT_WAKE_LOCK or
                        PowerManager.ACQUIRE_CAUSES_WAKEUP or
                        PowerManager.ON_AFTER_RELEASE,
                    "cream:screen"
                ).apply {
                    setReferenceCounted(false)
                    acquire(RING_MILLIS)
                }
            } catch (_: Exception) {
            }

            val resId = resources.getIdentifier("ring_$ring", "raw", packageName)
            if (resId == 0) return
            player = MediaPlayer().apply {
                setAudioAttributes(
                    AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_ALARM)
                        .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                        .build()
                )
                val afd = resources.openRawResourceFd(resId)
                setDataSource(afd.fileDescriptor, afd.startOffset, afd.length)
                afd.close()
                isLooping = true
                setOnPreparedListener { it.start() }
                prepareAsync()
            }
        } catch (_: Exception) {
        }
    }

    private fun buildNotification(title: String, body: String): Notification {
        val nm = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val ch = NotificationChannel(
                CHANNEL_ID, "Water reminder alarm",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Cream water reminder alarm"
                setSound(null, null) // sound is played by MediaPlayer, not the channel
                enableVibration(true)
                vibrationPattern = longArrayOf(0, 500, 500, 500)
            }
            nm.createNotificationChannel(ch)
        }

        // Tapping Stop ends the alarm.
        val stopIntent = Intent(this, AlarmService::class.java).apply { action = ACTION_STOP }
        val stopPi = PendingIntent.getService(
            this, 1, stopIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // Tapping the notification body opens the app (only on an explicit tap —
        // the alarm itself never launches the app).
        val openIntent = packageManager.getLaunchIntentForPackage(packageName)?.apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP
        }
        val openPi = PendingIntent.getActivity(
            this, 2, openIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val iconRes = resources.getIdentifier("ic_water_notification", "drawable", packageName)
            .let { if (it != 0) it else applicationInfo.icon }

        // Custom content with a big STOP button that's visible WITHOUT expanding
        // the notification (collapsed + heads-up), not hidden in the action row.
        val rv = RemoteViews(packageName, R.layout.cream_alarm_notif).apply {
            setTextViewText(R.id.cream_title, title)
            setTextViewText(R.id.cream_body, body)
            setOnClickPendingIntent(R.id.cream_stop_btn, stopPi)
        }

        val builder = Notification.Builder(this, CHANNEL_ID)
            .setContentTitle(title)
            .setContentText(body)
            .setSmallIcon(iconRes)
            .setOngoing(true)                 // can't be swiped away
            .setAutoCancel(false)
            .setCategory(Notification.CATEGORY_ALARM)
            .setVisibility(Notification.VISIBILITY_PUBLIC)
            .setContentIntent(openPi)
            .setStyle(Notification.DecoratedCustomViewStyle())
            .setCustomContentView(rv)        // shown collapsed (no expand needed)
            .setCustomBigContentView(rv)     // …and expanded
            .setCustomHeadsUpContentView(rv) // …and in the heads-up banner
            // Also a standard action, as a fallback (Auto / older renderers).
            .addAction(
                Notification.Action.Builder(
                    android.R.drawable.ic_menu_close_clear_cancel, "Stop alarm", stopPi
                ).build()
            )
        builder.setColor(0xFF2E9BE6.toInt())
        // Show the alarm notification (and its Stop button) IMMEDIATELY — by
        // default Android defers a foreground-service notification by up to 10s,
        // which is no good for an alarm the user must be able to stop at once.
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            builder.setForegroundServiceBehavior(Notification.FOREGROUND_SERVICE_IMMEDIATE)
        }
        return builder.build()
    }

    private fun releaseSound() {
        try { player?.stop() } catch (_: Exception) {}
        try { player?.release() } catch (_: Exception) {}
        player = null
        try { if (wakeLock?.isHeld == true) wakeLock?.release() } catch (_: Exception) {}
        wakeLock = null
        try { if (screenLock?.isHeld == true) screenLock?.release() } catch (_: Exception) {}
        screenLock = null
    }

    override fun onDestroy() {
        handler.removeCallbacks(stopRunnable)
        releaseSound()
        super.onDestroy()
    }
}
