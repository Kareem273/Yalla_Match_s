import 'dart:convert';
import 'dart:math';

import 'package:shared_preferences/shared_preferences.dart';

class CustomerSession {
  static const _storageKey = 'customer_session_v1';

  static Future<String> getOrCreate() async {
    final preferences = await SharedPreferences.getInstance();
    final existing = preferences.getString(_storageKey);
    if (existing != null && existing.length >= 32) return existing;

    final random = Random.secure();
    final bytes = List<int>.generate(32, (_) => random.nextInt(256));
    final session = base64UrlEncode(bytes).replaceAll('=', '');
    await preferences.setString(_storageKey, session);
    return session;
  }
}
