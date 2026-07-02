# Cream — Native Shell (Flutter)

A thin Flutter shell that hosts the **Next.js production app**
(`https://glowai-smart-skin.vercel.app`) inside a WebView and exposes **native
capabilities** to the website through a **2-way JavaScript bridge**.

The website stays the single source of truth for UI/logic. The shell only adds
things a browser can't do: store purchases, push notifications, native
permissions, analytics, haptics, share, etc.

```
Flutter shell (this repo)
  InAppWebView -> glowai-smart-skin.vercel.app
     window.CreamNative  <->  NativeBridge
        |          |           |          |
     Analytics  Qonversion  Permissions  Push
     (Firebase)   (IAP)      (handler)   (FCM)
```

## Project layout

| File | Purpose |
|------|---------|
| `lib/config.dart` | Production URL, allowed hosts, Qonversion key |
| `lib/web_shell_page.dart` | WebView + back button + offline + external links |
| `lib/bridge/native_bridge.dart` | Routes `action` -> native service, emits events to JS |
| `lib/bridge/js_shim.dart` | Injected `window.CreamNative` JS API |
| `lib/services/analytics_service.dart` | Firebase Analytics |
| `lib/services/purchase_service.dart` | Qonversion IAP / subscriptions |
| `lib/services/permission_service.dart` | Camera / mic / photos / notifications |
| `lib/services/notification_service.dart` | FCM push + local notifications |

## One-time setup before building

1. **Firebase** (analytics + push)
   - Create a Firebase project, add Android + iOS apps with package
     `com.cream.skincare.glowai_shell`.
   - Put `google-services.json` -> `android/app/`
   - Put `GoogleService-Info.plist` -> `ios/Runner/` (via Xcode)
   - Android: add the Google services Gradle plugin
     (`id("com.google.gms.google-services")` in `android/app/build.gradle.kts`
     plus the classpath in `android/build.gradle.kts`).
   - Until these exist the app still runs — Firebase init is wrapped in try/catch.

2. **Qonversion** (purchases) — pass the project key at build/run time:
   ```
   flutter run --dart-define=QONVERSION_KEY=your_project_key
   ```

3. **App icon / name** — already labelled "Cream". Drop icons via
   `flutter_launcher_icons` if desired (the same heart icon used on the web).

## Run / build

```bash
flutter pub get
flutter run                 --dart-define=QONVERSION_KEY=xxxx   # dev
flutter build apk --release --dart-define=QONVERSION_KEY=xxxx   # Android
flutter build ipa --release --dart-define=QONVERSION_KEY=xxxx   # iOS
```

---

## Web <-> Native bridge API (for the Next.js team)

When running inside the shell, the website gets a global object:

```js
if (window.CreamNative?.isNative) {
  // we're inside the native app
}
```

### Call native (JS -> native) — returns a Promise

```js
await window.CreamNative.call('<action>', payload)
```

| Action | Payload | Returns |
|--------|---------|---------|
| `app.info` | – | `{ platform, appVersion, build, package }` |
| `app.openExternal` | `{ url }` | opens in system browser |
| `app.share` | `{ text, subject? }` | – |
| `haptics.vibrate` | – | – |
| `analytics.logEvent` | `{ name, params? }` | – |
| `analytics.setUserId` | `{ userId }` | – |
| `analytics.setUserProperty` | `{ name, value }` | – |
| `analytics.screen` | `{ name }` | – |
| `permissions.status` | `{ type }` | `granted｜denied｜permanently_denied｜…` |
| `permissions.request` | `{ type }` | same as above |
| `permissions.openSettings` | – | `true` |
| `notifications.requestPermission` | – | `granted｜denied` |
| `notifications.getToken` | – | FCM token string |
| `notifications.subscribe` | `{ topic }` | – |
| `notifications.local` | `{ title, body, payload? }` | – |
| `purchases.configured` | – | `bool` |
| `purchases.identify` | `{ userId }` | – |
| `purchases.offerings` | – | `{ main:[...products], all:[...] }` |
| `purchases.purchase` | `{ productId }` | `{ success, entitlements }` |
| `purchases.restore` | – | `{ success, entitlements }` |
| `purchases.entitlements` | – | `{ entitlements }` |

`permissions.type` ∈ `camera｜microphone｜photos｜notifications｜storage`.

### Listen to native events (native -> JS)

```js
const off = window.CreamNative.on('notification', (data) => {
  // data = { tapped, title, body, data }
});
// also dispatched as a window event:  'creamnative:notification'
```

Events: `ready`, `notification`.

### Example: unlock Premium via store purchase

```js
async function buyPremium(productId) {
  if (!window.CreamNative?.isNative) return; // fall back to web flow
  const res = await window.CreamNative.call('purchases.purchase', { productId });
  const active = Object.values(res.entitlements || {}).some((e) => e.active);
  if (active) {
    localStorage.setItem('velmora_is_premium', 'true');
    location.reload();
  }
}
```

### Example: native camera permission before the face scan

```js
if (window.CreamNative?.isNative) {
  const status = await window.CreamNative.call('permissions.request', { type: 'camera' });
  if (status !== 'granted') { /* show guidance */ }
}
```

> The shell already auto-grants the WebView camera prompt, so the existing
> `getUserMedia` face scanner keeps working without changes. The explicit
> permission call is only needed if you want to gate UI ahead of time.
