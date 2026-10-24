import 'package:flutter/material.dart';

class AppLanguageManager {
  static final ValueNotifier<Locale> localeNotifier = ValueNotifier<Locale>(_detectInitialLocale());

  static Locale _detectInitialLocale() {
    try {
      final deviceLocale = WidgetsBinding.instance.platformDispatcher.locale;
      if (deviceLocale.languageCode.toLowerCase() == 'ar') {
        return const Locale('ar');
      }
    } catch (_) {}
    return const Locale('en');
  }

  static Locale get currentLocale => localeNotifier.value;

  static bool get isArabic => currentLocale.languageCode == 'ar';

  static void setLanguage(String lang) {
    if (lang.toLowerCase() == 'arabic' || lang.toLowerCase() == 'ar') {
      localeNotifier.value = const Locale('ar');
    } else {
      localeNotifier.value = const Locale('en');
    }
  }

  static void setLocale(Locale newLocale) {
    localeNotifier.value = newLocale;
  }
}
