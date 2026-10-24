import 'package:flutter/services.dart';

const String egyptianMobilePattern = r'^01(0|1|2|5)\d{8}$';

bool isValidEgyptianMobile(String? value) {
  final phone = (value ?? '').trim();
  if (phone.isEmpty) return false;
  return RegExp(egyptianMobilePattern).hasMatch(phone);
}

String? validateEgyptianMobile(String? value, {bool required = true}) {
  final phone = (value ?? '').trim();
  if (phone.isEmpty) {
    return required ? 'Enter a valid Egyptian mobile number' : null;
  }
  if (!isValidEgyptianMobile(phone)) {
    return 'Enter a valid Egyptian mobile number (e.g. 01012345678)';
  }
  return null;
}

List<TextInputFormatter> egyptianMobileInputFormatters() => [
      FilteringTextInputFormatter.digitsOnly,
      LengthLimitingTextInputFormatter(11),
    ];
