# ── Keep rules so R8/minify doesn't break the release build ──────────────

# App entry point (MainActivity etc.)
-keep class com.cream.skincare.glowai_shell.** { *; }

# Flutter engine + plugins
-keep class io.flutter.app.** { *; }
-keep class io.flutter.plugin.** { *; }
-keep class io.flutter.embedding.** { *; }
-keep class io.flutter.plugins.** { *; }
-dontwarn io.flutter.embedding.**

# flutter_local_notifications (scheduled water reminder) — needs its models +
# Gson; without these, scheduled notifications never fire in release.
-keep class com.dexterous.** { *; }
-keep class com.dexterous.flutterlocalnotifications.** { *; }

# Gson (used internally by flutter_local_notifications to (de)serialize)
-keepattributes Signature
-keepattributes *Annotation*
-keepattributes InnerClasses, EnclosingMethod
-keep class com.google.gson.** { *; }
-keep class * extends com.google.gson.reflect.TypeToken
-keep class * implements com.google.gson.TypeAdapterFactory
-keep class * implements com.google.gson.JsonSerializer
-keep class * implements com.google.gson.JsonDeserializer
-keepclassmembers,allowobfuscation class * {
  @com.google.gson.annotations.SerializedName <fields>;
}

# timezone / flutter_timezone
-keep class com.whelksoft.** { *; }
-dontwarn com.google.errorprone.annotations.**

# flutter_foreground_task — the foreground service that keeps reminders alive
-keep class com.pravera.flutter_foreground_task.** { *; }
