import 'package:flutter/material.dart';

class CourtSport {
  final String apiValue;
  final String label;
  final String arabicLabel;
  final IconData icon;

  const CourtSport({
    required this.apiValue,
    required this.label,
    required this.arabicLabel,
    required this.icon,
  });

  static const soccer = CourtSport(
    apiValue: 'Soccer',
    label: 'Football',
    arabicLabel: 'ملعب كورة',
    icon: Icons.sports_soccer,
  );
  static const multipurpose = CourtSport(
    apiValue: 'Multipurpose',
    label: 'Multipurpose',
    arabicLabel: 'ملعب متعدد',
    icon: Icons.sports_handball,
  );

  static const values = [soccer, multipurpose];

  static CourtSport fromApiValue(String? value) {
    var val = value?.toLowerCase();
    if (val == 'football') val = 'soccer';
    if (val == 'multi' || val == 'multi-purpose') val = 'multipurpose';
    return values.firstWhere(
      (sport) => sport.apiValue.toLowerCase() == val,
      orElse: () => val != null && val.contains('multi') ? multipurpose : soccer,
    );
  }
}
