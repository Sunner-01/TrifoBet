/// Representa un mercado de apuestas (ej: 1X2, Over/Under, etc.)
class BettingMarket {
  final String id;
  final String name;
  final String category; // 'Principal', 'Goles', 'Especiales'
  final List<MarketOption> options;

  BettingMarket({
    required this.id,
    required this.name,
    required this.category,
    required this.options,
  });

  factory BettingMarket.fromJson(Map<String, dynamic> json) {
    return BettingMarket(
      id: json['id'],
      name: json['name'],
      category: json['category'],
      options: (json['options'] as List)
          .map((o) => MarketOption.fromJson(o))
          .toList(),
    );
  }
}

/// Representa una opción dentro de un mercado
class MarketOption {
  final String id;
  final String label; // Ej: "Local", "Empate", "Más de 2.5"
  final double odds; // Cuota

  MarketOption({required this.id, required this.label, required this.odds});

  factory MarketOption.fromJson(Map<String, dynamic> json) {
    return MarketOption(
      id: json['id'],
      label: json['label'],
      odds: json['odds'].toDouble(),
    );
  }
}
