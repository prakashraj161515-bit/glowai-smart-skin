import 'package:flutter/services.dart';
import 'package:google_sign_in/google_sign_in.dart';

import '../config.dart';

/// Native Google Sign-In. Returns a Google ID token the website verifies
/// server-side (NextAuth `native-google` provider), so login works even though
/// Google blocks OAuth inside WebViews.
class AuthService {
  AuthService._();
  static final AuthService instance = AuthService._();

  late final GoogleSignIn _google = GoogleSignIn(
    scopes: const ['email', 'profile'],
    // serverClientId must be the WEB client id so the ID token audience matches
    // the value NextAuth verifies. Empty => platform default client.
    serverClientId:
        AppConfig.googleWebClientId.isEmpty ? null : AppConfig.googleWebClientId,
  );

  /// Triggers the native account chooser. Returns null if the user cancels.
  /// Throws a clear, detailed message on failure so the web layer can show it.
  Future<Map<String, dynamic>?> signIn() async {
    try {
      // Clear any cached selection first so the native account chooser ALWAYS
      // shows the list of Google IDs to pick from (and lets the user switch
      // accounts), instead of silently reusing the last-used account.
      try {
        await _google.signOut();
      } catch (_) {}

      final account = await _google.signIn();
      if (account == null) return null; // cancelled
      final auth = await account.authentication;
      if (auth.idToken == null) {
        throw 'No idToken returned (serverClientId may be wrong: '
            '${AppConfig.googleWebClientId.isEmpty ? "EMPTY" : "set"})';
      }
      return {
        'idToken': auth.idToken,
        'accessToken': auth.accessToken,
        'email': account.email,
        'name': account.displayName,
        'photoUrl': account.photoUrl,
        'id': account.id,
      };
    } on PlatformException catch (e) {
      // e.code like sign_in_failed; e.message often contains ApiException: 10 etc.
      throw 'Google error [${e.code}] ${e.message ?? ""} '
          '(webClientId=${AppConfig.googleWebClientId.isEmpty ? "EMPTY" : "set"})';
    }
  }

  Future<void> signOut() async {
    try {
      await _google.signOut();
    } catch (_) {}
  }
}
