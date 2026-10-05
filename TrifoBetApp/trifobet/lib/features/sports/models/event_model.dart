import 'betting_market.dart';
import '../services/team_logos.dart';

class SportsEvent {
  final int id;
  final String homeTeam;
  final String awayTeam;
  final String league;
  final String country;
  final DateTime dateTime;
  final String status; // '1H', '2H', 'FT', 'NS', etc.

  // Logos remotos (opcionales desde API)
  final String? remoteHomeLogo;
  final String? remoteAwayLogo;
  final String? remoteLeagueLogo;
  final String? remoteCountryLogo;

  // Marcador y Tiempo (para en vivo)
  final int? scoreHome;
  final int? scoreAway;
  final String? liveMinute;

  // Mercados
  final List<BettingMarket> markets;

  SportsEvent({
    required this.id,
    required this.homeTeam,
    required this.awayTeam,
    required this.league,
    required this.country,
    required this.dateTime,
    required this.status,
    this.remoteHomeLogo,
    this.remoteAwayLogo,
    this.remoteLeagueLogo,
    this.remoteCountryLogo,
    this.scoreHome,
    this.scoreAway,
    this.liveMinute,
    required this.markets,
  });

  factory SportsEvent.fromJson(Map<String, dynamic> json) {
    // Debug log para verificar estructura
    // print('🔍 Event JSON keys: ${json.keys.toList()}');
    // if (json.containsKey('id')) print('🆔 ID found: ${json['id']}');

    // Parsear fecha y convertir a hora Boliviana (UTC-4)
    DateTime dt;
    try {
      final parsed = DateTime.parse(json['fecha']);
      if (parsed.isUtc) {
        dt = parsed.subtract(const Duration(hours: 4));
      } else {
        dt = parsed;
      }
    } catch (e) {
      dt = DateTime.now();
    }

    // Parsear mercados
    var marketsList = <BettingMarket>[];

    var cuotasRaw = json['cuotas'] ?? json['odds'];

    if (cuotasRaw != null && cuotasRaw is Map) {
      final cuotasMap = cuotasRaw as Map<String, dynamic>;

      // Intentar identificar si es estructura anidada (main -> 1X2) o plana
      // Caso 1: Estructura anidada (API Real)
      if (cuotasMap.containsKey('main') ||
          cuotasMap.values.any((v) => v is Map)) {
        cuotasMap.forEach((categoryKey, categoryValue) {
          if (categoryValue is Map<String, dynamic>) {
            categoryValue.forEach((marketKey, marketValue) {
              if (marketValue is Map<String, dynamic>) {
                final options = <MarketOption>[];
                marketValue.forEach((optLabel, optVal) {
                  double? oddsVal;
                  if (optVal is num)
                    oddsVal = optVal.toDouble();
                  else if (optVal is String)
                    oddsVal = double.tryParse(optVal);

                  if (oddsVal != null) {
                    options.add(
                      MarketOption(
                        id: '${json['id']}_${categoryKey}_${marketKey}_$optLabel',
                        label: _translateOptionLabel(
                          optLabel,
                          json['equipo_local'],
                          json['equipo_visitante'],
                        ),
                        odds: oddsVal,
                      ),
                    );
                  }
                });

                if (options.isNotEmpty) {
                  marketsList.add(
                    BettingMarket(
                      id: '${json['id']}_${categoryKey}_$marketKey',
                      name: _translateMarketName(marketKey),
                      category: _formatCategory(categoryKey),
                      options: options,
                    ),
                  );
                }
              }
            });
          }
        });
      }
      // Caso 2: Estructura plana (Fallback/Mock)
      else {
        // Lógica para estructura plana si fuera necesaria
        print('   ⚠️ Estructura de cuotas PLANA (no implementada)');
      }
    } else {
      print('   ❌ NO HAY CUOTAS para este evento');
    }

    return SportsEvent(
      id: json['id'] is int
          ? json['id']
          : int.tryParse(json['id'].toString()) ?? 0,
      homeTeam: json['equipo_local'] ?? 'Local',
      awayTeam: json['equipo_visitante'] ?? 'Visitante',
      league: json['liga'] ?? 'Liga',
      country: json['pais'] ?? 'Mundo',
      dateTime: dt,
      status: json['estado'] ?? 'NS',
      remoteHomeLogo: json['escudo_local'],
      remoteAwayLogo: json['escudo_visitante'],
      remoteLeagueLogo: json['logo_liga'],
      remoteCountryLogo: json['bandera_pais'] ?? json['logo_pais'],
      scoreHome: json['goles_local'],
      scoreAway: json['goles_visitante'],
      liveMinute: json['minuto']?.toString(),
      markets: marketsList,
    );
  }

  // Getters inteligentes para Logos
  String get homeLogo {
    if (remoteHomeLogo != null && remoteHomeLogo!.isNotEmpty) {
      return remoteHomeLogo!;
    }
    return getTeamLogo(homeTeam) ?? ''; // Fallback local
  }

  String get awayLogo {
    if (remoteAwayLogo != null && remoteAwayLogo!.isNotEmpty) {
      return remoteAwayLogo!;
    }
    return getTeamLogo(awayTeam) ?? ''; // Fallback local
  }

  String get leagueLogo {
    if (remoteLeagueLogo != null && remoteLeagueLogo!.isNotEmpty) {
      return remoteLeagueLogo!;
    }
    // Fallback local simple
    return 'assets/leagues/${league.toLowerCase().replaceAll(' ', '_')}.png';
  }

  String get countryFlag {
    if (remoteCountryLogo != null && remoteCountryLogo!.isNotEmpty) {
      return remoteCountryLogo!;
    }
    // Fallback local
    final code = _getCountryCode(country);
    return 'assets/flags/$code.svg';
  }

  // Getters de compatibilidad
  String get homeTeamLogo => homeLogo;
  String get awayTeamLogo => awayLogo;
  Map<String, double> get odds => mainOdds;

  // Helpers
  static String _getCountryCode(String countryName) {
    switch (countryName.toLowerCase()) {
      case 'england':
        return 'gb';
      case 'spain':
        return 'es';
      case 'italy':
        return 'it';
      case 'germany':
        return 'de';
      case 'france':
        return 'fr';
      case 'argentina':
        return 'ar';
      case 'brazil':
        return 'br';
      default:
        return 'unknown';
    }
  }

  static String _formatCategory(String key) {
    final k = key.toLowerCase();
    if (k.contains('main') || k.contains('1x2') || k.contains('winner'))
      return 'Principales';
    if (k.contains('goal')) return 'Goles';
    if (k.contains('handicap')) return 'Hándicap';
    if (k.contains('card')) return 'Tarjetas';
    if (k.contains('corner')) return 'Corners';
    return key.toUpperCase();
  }

  static String _translateMarketName(String key) {
    final k = key.toLowerCase();

    // Mercados principales
    if (k.contains('main') || k.contains('1x2') || k.contains('winner'))
      return 'Resultado Final';
    if (k.contains('match result')) return 'Resultado del Partido';
    if (k.contains('fulltime result')) return 'Resultado Tiempo Completo';

    // Goles
    if (k.contains('total goals') || k.contains('over/under'))
      return 'Total de Goles';
    if (k.contains('both teams to score') || k.contains('btts'))
      return 'Ambos Equipos Anotan';
    if (k.contains('goal scorer') || k.contains('goalscorer'))
      return 'Goleador';
    if (k.contains('first goal')) return 'Primer Gol';
    if (k.contains('last goal')) return 'Último Gol';
    if (k.contains('anytime goal')) return 'Gol en Cualquier Momento';
    if (k.contains('exact goals')) return 'Goles Exactos';
    if (k.contains('odd/even goals')) return 'Goles Par/Impar';
    if (k.contains('goal') && !k.contains('scorer')) return 'Goles';

    // Hándicap
    if (k.contains('handicap') || k.contains('spread')) return 'Hándicap';
    if (k.contains('asian handicap')) return 'Hándicap Asiático';
    if (k.contains('european handicap')) return 'Hándicap Europeo';

    // Tarjetas
    if (k.contains('total cards')) return 'Total de Tarjetas';
    if (k.contains('yellow cards')) return 'Tarjetas Amarillas';
    if (k.contains('red cards')) return 'Tarjetas Rojas';
    if (k.contains('card')) return 'Tarjetas';

    // Corners
    if (k.contains('total corners')) return 'Total de Córners';
    if (k.contains('first corner')) return 'Primer Córner';
    if (k.contains('last corner')) return 'Último Córner';
    if (k.contains('corner')) return 'Córners';

    // Medios tiempos
    if (k.contains('half time') && k.contains('result'))
      return 'Resultado Medio Tiempo';
    if (k.contains('half time full time') || k.contains('ht/ft'))
      return 'Medio Tiempo/Tiempo Completo';
    if (k.contains('first half')) return 'Primer Tiempo';
    if (k.contains('second half')) return 'Segundo Tiempo';
    if (k.contains('halftime')) return 'Medio Tiempo';

    // Especiales
    if (k.contains('double chance')) return 'Doble Oportunidad';
    if (k.contains('draw no bet')) return 'Empate Anula Apuesta';
    if (k.contains('to qualify')) return 'Clasificar';
    if (k.contains('to win')) return 'Ganar';
    if (k.contains('clean sheet')) return 'Portería a Cero';
    if (k.contains('penalty')) return 'Penaltis';
    if (k.contains('extra time')) return 'Tiempo Extra';

    // Totales
    if (k.contains('home total')) return 'Total Local';
    if (k.contains('away total')) return 'Total Visitante';
    if (k.contains('total')) return 'Total';

    // Si no encontramos traducción, devolver el original en mayúsculas
    return key.toUpperCase();
  }

  static String _translateOptionLabel(String label, String home, String away) {
    final labelLower = label.toLowerCase();

    // Opciones básicas 1X2
    if (label == '1') return home;
    if (label == '2') return away;
    if (label == 'X') return 'Empate';

    // Reemplazos de palabras comunes en cualquier parte del texto
    String translated = label;

    // Home/Away con handicaps o números (ej: "Home -1.5", "Away +2.5")
    translated = translated.replaceAllMapped(
      RegExp(r'\bHome\b', caseSensitive: false),
      (match) => 'Local',
    );
    translated = translated.replaceAllMapped(
      RegExp(r'\bAway\b', caseSensitive: false),
      (match) => 'Visitante',
    );

    // Draw / Tie
    if (labelLower == 'draw' || labelLower == 'tie') return 'Empate';
    translated = translated.replaceAllMapped(
      RegExp(r'\bDraw\b', caseSensitive: false),
      (match) => 'Empate',
    );

    // Yes / No
    if (labelLower == 'yes') return 'Sí';
    if (labelLower == 'no') return 'No';
    translated = translated.replaceAllMapped(
      RegExp(r'\bYes\b', caseSensitive: false),
      (match) => 'Sí',
    );
    translated = translated.replaceAllMapped(
      RegExp(r'\bNo\b', caseSensitive: false),
      (match) => 'No',
    );

    // Over / Under
    if (labelLower.startsWith('over ')) {
      final number = label.substring(5).trim();
      return 'Más de $number';
    }
    if (labelLower.startsWith('under ')) {
      final number = label.substring(6).trim();
      return 'Menos de $number';
    }
    translated = translated.replaceAllMapped(
      RegExp(r'\bOver\b', caseSensitive: false),
      (match) => 'Más de',
    );
    translated = translated.replaceAllMapped(
      RegExp(r'\bUnder\b', caseSensitive: false),
      (match) => 'Menos de',
    );

    // Odd / Even
    if (labelLower == 'odd') return 'Impar';
    if (labelLower == 'even') return 'Par';
    translated = translated.replaceAllMapped(
      RegExp(r'\bOdd\b', caseSensitive: false),
      (match) => 'Impar',
    );
    translated = translated.replaceAllMapped(
      RegExp(r'\bEven\b', caseSensitive: false),
      (match) => 'Par',
    );

    // Both / None
    if (labelLower == 'both') return 'Ambos';
    if (labelLower == 'none' || labelLower == 'neither') return 'Ninguno';
    translated = translated.replaceAllMapped(
      RegExp(r'\bBoth\b', caseSensitive: false),
      (match) => 'Ambos',
    );

    // Otros términos
    translated = translated.replaceAll('or more', 'o más');
    translated = translated.replaceAll('or less', 'o menos');
    translated = translated.replaceAll('to score', 'anotar');
    translated = translated.replaceAll('to win', 'ganar');

    // Si el texto cambió, devolverlo traducido
    if (translated != label) return translated;

    // No traducción encontrada, devolver original
    return label;
  }

  // Getter para cuotas principales (1X2)
  Map<String, double> get mainOdds {
    // Buscar mercado principal con lógica más flexible
    final mainMarket = markets.firstWhere(
      (m) =>
          m.category == 'Principales' ||
          m.name == 'Resultado Final' ||
          m.id.contains('main') ||
          m.id.contains('1x2'),
      orElse: () =>
          BettingMarket(id: 'dummy', name: '', category: '', options: []),
    );

    if (mainMarket.id == 'dummy' || mainMarket.options.isEmpty) return {};

    final odds = <String, double>{};
    for (var opt in mainMarket.options) {
      // Comparación más flexible para encontrar las opciones
      if (opt.label == homeTeam || opt.label == '1')
        odds['1'] = opt.odds;
      else if (opt.label == 'Empate' || opt.label == 'X')
        odds['X'] = opt.odds;
      else if (opt.label == awayTeam || opt.label == '2')
        odds['2'] = opt.odds;
    }
    return odds;
  }
}
