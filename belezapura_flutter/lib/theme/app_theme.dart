import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // Cores Base
  static const Color background = Color(0xFFFDFBF8);
  static const Color foreground = Color(0xFF1C1714);
  static const Color card = Color(0xFFFFFFFF);
  static const Color cardForeground = Color(0xFF1C1714);
  
  // Cores Principais
  static const Color primary = Color(0xFFB8614A);
  static const Color primaryForeground = Color(0xFFFDFBF8);
  static const Color secondary = Color(0xFFF2EDE6);
  static const Color secondaryForeground = Color(0xFF1C1714);
  
  // Cores Auxiliares
  static const Color muted = Color(0xFFF5F0EA);
  static const Color mutedForeground = Color(0xFF7C6F65);
  static const Color accent = Color(0xFF9B7EA8);
  static const Color accentForeground = Color(0xFFFFFFFF);
  
  static const Color border = Color(0xFFE8E0D8);

  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      scaffoldBackgroundColor: background,
      colorScheme: ColorScheme.light(
        primary: primary,
        onPrimary: primaryForeground,
        secondary: secondary,
        onSecondary: secondaryForeground,
        surface: background,
        onSurface: foreground,
        error: Colors.redAccent,
        onError: Colors.white,
      ),
      textTheme: GoogleFonts.outfitTextTheme().copyWith(
        displayLarge: GoogleFonts.fraunces(color: foreground),
        displayMedium: GoogleFonts.fraunces(color: foreground),
        titleLarge: GoogleFonts.fraunces(color: foreground),
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: background,
        foregroundColor: foreground,
        elevation: 0,
      ),
      cardTheme: CardThemeData(
        color: card,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: const BorderSide(color: border, width: 1),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primary,
          foregroundColor: primaryForeground,
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
        ),
      ),
    );
  }
}
