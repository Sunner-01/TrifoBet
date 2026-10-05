/// Representa una selección individual en el cupón de apuestas
class BetSlipItem {
  final String id; // Único: eventId + marketId + optionId
  final int eventId;
  final String homeTeam;
  final String awayTeam;
  final String league;
  final String marketName;
  final String selectedOption;
  final double odds;
  final DateTime eventDate;

  BetSlipItem({
    required this.id,
    required this.eventId,
    required this.homeTeam,
    required this.awayTeam,
    required this.league,
    required this.marketName,
    required this.selectedOption,
    required this.odds,
    required this.eventDate,
  });

  /// Genera un ID único para la selección
  static String generateId(int eventId, String marketId, String optionId) {
    return '${eventId}_${marketId}_$optionId';
  }

  /// Descripción legible de la apuesta
  String get description =>
      '$homeTeam vs $awayTeam - $marketName: $selectedOption';

  /// Convierte el BetSlipItem a un Map para almacenamiento JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'eventId': eventId,
      'homeTeam': homeTeam,
      'awayTeam': awayTeam,
      'league': league,
      'marketName': marketName,
      'selectedOption': selectedOption,
      'odds': odds,
      'eventDate': eventDate.toIso8601String(),
    };
  }

  /// Crea un BetSlipItem desde un Map JSON
  factory BetSlipItem.fromJson(Map<String, dynamic> json) {
    return BetSlipItem(
      id: json['id'] as String,
      eventId: json['eventId'] as int,
      homeTeam: json['homeTeam'] as String,
      awayTeam: json['awayTeam'] as String,
      league: json['league'] as String,
      marketName: json['marketName'] as String,
      selectedOption: json['selectedOption'] as String,
      odds: (json['odds'] as num).toDouble(),
      eventDate: DateTime.parse(json['eventDate'] as String),
    );
  }
}
