/// Tipos de apuestas soportadas
enum BetType {
  /// Apuesta simple - una sola selección
  simple,

  /// Apuesta múltiple/combinada - todas las selecciones deben acertar
  multiple,

  /// Apuesta de sistema - permite que algunas selecciones fallen
  system,
}

/// Extensión con métodos útiles para BetType
extension BetTypeExtension on BetType {
  /// Nombre legible del tipo de apuesta
  String get displayName {
    switch (this) {
      case BetType.simple:
        return 'Simple';
      case BetType.multiple:
        return 'Combinada';
      case BetType.system:
        return 'Sistema';
    }
  }

  /// Descripción del tipo de apuesta
  String get description {
    switch (this) {
      case BetType.simple:
        return 'Apuesta en una sola selección';
      case BetType.multiple:
        return 'Todas las selecciones deben acertar';
      case BetType.system:
        return 'Permite que algunas selecciones fallen';
    }
  }

  /// ¿Requiere múltiples selecciones?
  bool get requiresMultipleSelections {
    return this == BetType.multiple || this == BetType.system;
  }

  /// Número mínimo de selecciones requeridas
  int get minSelections {
    switch (this) {
      case BetType.simple:
        return 1;
      case BetType.multiple:
        return 2;
      case BetType.system:
        return 3;
    }
  }
}
