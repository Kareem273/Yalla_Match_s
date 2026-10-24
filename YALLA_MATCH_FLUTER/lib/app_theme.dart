import 'dart:ui';
import 'package:flutter/material.dart';

/// YallaMatch Design System
/// Liquid Glass styling with Turf Grass Green (لون النجيلة)
class AppTheme {
  // Backgrounds
  static const Color bg = Color(0xFF050505);
  static const Color darkCard = Color(0xFF0F0F0F);

  // Turf Grass Green - لون النجيلة الرياضية الحيوية
  static const Color turfGreen = Color(0xFF22C55E);
  static const Color turfGreenDark = Color(0xFF16A34A);
  static const Color turfGreenLight = Color(0xFF4ADE80);

  // Glass Colors
  static Color glassBg = const Color(0xFF141414).withValues(alpha: 0.72);
  static Color glassBorder = Colors.white.withValues(alpha: 0.09);
  static Color glassBorderGlow = const Color(0xFF22C55E).withValues(alpha: 0.65);

  /// Standard Liquid Glass Box Decoration
  static BoxDecoration liquidGlassDecoration({
    double borderRadius = 20,
    bool isSelected = false,
    Color? borderColor,
    Color? fillColor,
    double borderWidth = 1.0,
  }) {
    return BoxDecoration(
      color: fillColor ?? const Color(0xFF131313).withValues(alpha: 0.75),
      borderRadius: BorderRadius.circular(borderRadius),
      border: Border.all(
        color: borderColor ??
            (isSelected ? turfGreen : Colors.white.withValues(alpha: 0.10)),
        width: isSelected ? 1.5 : borderWidth,
      ),
      boxShadow: [
        if (isSelected)
          BoxShadow(
            color: turfGreen.withValues(alpha: 0.25),
            blurRadius: 16,
            spreadRadius: 1,
          )
        else
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.4),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
      ],
    );
  }
}

/// Reusable Liquid Glass Container with Frosted Blur
class LiquidGlassCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry? padding;
  final EdgeInsetsGeometry? margin;
  final double borderRadius;
  final bool isSelected;
  final Color? borderColor;
  final Color? fillColor;
  final double blur;

  const LiquidGlassCard({
    super.key,
    required this.child,
    this.padding,
    this.margin,
    this.borderRadius = 20,
    this.isSelected = false,
    this.borderColor,
    this.fillColor,
    this.blur = 10,
  });

  @override
  Widget build(BuildContext context) {
    Widget content = Container(
      padding: padding,
      decoration: AppTheme.liquidGlassDecoration(
        borderRadius: borderRadius,
        isSelected: isSelected,
        borderColor: borderColor,
        fillColor: fillColor,
      ),
      child: child,
    );

    if (blur > 0) {
      content = ClipRRect(
        borderRadius: BorderRadius.circular(borderRadius),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: blur, sigmaY: blur),
          child: content,
        ),
      );
    }

    if (margin != null) {
      content = Padding(padding: margin!, child: content);
    }

    return content;
  }
}
