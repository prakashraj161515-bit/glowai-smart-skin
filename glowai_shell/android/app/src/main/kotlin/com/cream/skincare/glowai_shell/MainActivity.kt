package com.cream.skincare.glowai_shell

import android.content.Intent
import android.os.Build
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel

class MainActivity : FlutterActivity() {
    private val channel = "cream/alarm"

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)
        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, channel)
            .setMethodCallHandler { call, result ->
                when (call.method) {
                    // Flutter has just written the config — (re)arm the next alarm.
                    "reschedule" -> {
                        AlarmScheduler.scheduleNext(this)
                        result.success(true)
                    }
                    // Reminder turned off — cancel everything + silence any ring.
                    "cancel" -> {
                        AlarmScheduler.cancel(this)
                        stopAlarmSound()
                        result.success(true)
                    }
                    // Silence a currently-ringing alarm (e.g. Stop from web UI).
                    "stop" -> {
                        stopAlarmSound()
                        result.success(true)
                    }
                    else -> result.notImplemented()
                }
            }
    }

    private fun stopAlarmSound() {
        val i = Intent(this, AlarmService::class.java)
        stopService(i)
    }
}
