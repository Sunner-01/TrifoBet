import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/event_model.dart';

import '../../../core/config/api_config.dart';

class SportsService {
  static const String _baseUrl = ApiConfig.baseUrl;

  /// Obtiene todos los eventos agrupados por fecha
  /// Retorna un Map donde la clave es la fecha (YYYY-MM-DD) y el valor es la lista de eventos
  static Future<Map<String, List<SportsEvent>>> fetchEvents() async {
    try {
      final response = await http.get(
        Uri.parse('$_baseUrl/deportes/futbol/partidos'),
      );

      if (response.statusCode == 200) {
        final dynamic decodedData = jsonDecode(response.body);
        final Map<String, List<SportsEvent>> eventsByDate = {};

        if (decodedData is Map) {
          decodedData.forEach((date, eventsList) {
            if (eventsList is List) {
              eventsByDate[date.toString()] = eventsList
                  .map((e) => SportsEvent.fromJson(e))
                  .toList();
            }
          });
        } else if (decodedData is List) {
          // Fallback por si la API devuelve lista plana (versión anterior)
          final today = DateTime.now().toString().substring(0, 10);
          eventsByDate[today] = decodedData
              .map((e) => SportsEvent.fromJson(e))
              .toList();
        }

        return eventsByDate;
      } else {
        throw Exception('Failed to load sports events: ${response.statusCode}');
      }
    } catch (e) {
      print('Error fetching sports events: $e');
      return {};
    }
  }

  // Métodos de compatibilidad (Deprecated)
  // Se mantienen para no romper código antiguo que pueda estar llamándolos
  static Future<List<SportsEvent>> fetchLiveEvents() async {
    final allEventsMap = await fetchEvents();
    final allEvents = allEventsMap.values.expand((l) => l).toList();
    return allEvents
        .where((e) => ['1H', '2H', 'HT', 'ET', 'P', 'BT'].contains(e.status))
        .toList();
  }

  static Future<List<SportsEvent>> fetchUpcomingEvents() async {
    final allEventsMap = await fetchEvents();
    final allEvents = allEventsMap.values.expand((l) => l).toList();
    return allEvents
        .where(
          (e) => !['1H', '2H', 'HT', 'ET', 'P', 'BT', 'FT'].contains(e.status),
        )
        .toList();
  }
}
