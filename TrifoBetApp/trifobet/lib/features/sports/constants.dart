import 'package:flutter/material.dart';

/// Constantes de colores y estilos para la sección de deportes
class SportsConstants {
  // Colores principales de la app
  static const Color primaryGreen = Color(0xFF00e676);
  static const Color darkGreen = Color(0xFF00c853);
  static const Color lightGreen = Color(0xFF69F0AE);

  // Reemplazamos Gold por el mismo verde o blanco según corresponda para eliminar el amarillo
  static const Color primaryGold = Color(0xFF00e676);
  static const Color darkGold = Color(0xFF00c853);
  static const Color lightGold = Color(0xFFB9F6CA);

  static const Color primaryBlack = Color(0xFF121212);
  static const Color cardBackground = Color(0xFF1E1E1E);
  static const Color darkBackground = Color(0xFF0A0A0A);

  static const Color textPrimary = Color(0xFFFFFFFF);
  static const Color textSecondary = Color(0xFFB0B0B0);
  static const Color textTertiary = Color(0xFF757575);

  // Gradientes
  static const LinearGradient greenGoldGradient = LinearGradient(
    colors: [primaryGreen, darkGreen],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient darkGradient = LinearGradient(
    colors: [cardBackground, primaryBlack],
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
  );

  // Estilos de texto
  static const TextStyle titleStyle = TextStyle(
    color: textPrimary,
    fontSize: 20,
    fontWeight: FontWeight.bold,
  );

  static const TextStyle subtitleStyle = TextStyle(
    color: textSecondary,
    fontSize: 14,
    fontWeight: FontWeight.w500,
  );

  static const TextStyle bodyStyle = TextStyle(
    color: textPrimary,
    fontSize: 14,
  );

  static const TextStyle captionStyle = TextStyle(
    color: textTertiary,
    fontSize: 12,
  );

  static const TextStyle oddsStyle = TextStyle(
    color: textPrimary,
    fontSize: 16,
    fontWeight: FontWeight.bold,
  );

  // Valores de apuesta
  static const double minBet = 1.0;
  static const double maxBet = 1000.0;
  static const double defaultBet = 10.0;

  // Animaciones
  static const Duration animationDuration = Duration(milliseconds: 300);
  static const Duration shortAnimationDuration = Duration(milliseconds: 150);

  // Bordes y radios
  static const double cardRadius = 12.0;
  static const double buttonRadius = 8.0;
  static const double chipRadius = 20.0;

  // Espaciado
  static const double paddingSmall = 8.0;
  static const double paddingMedium = 12.0;
  static const double paddingLarge = 16.0;
}
