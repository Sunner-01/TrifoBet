import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import '../../../core/config/api_config.dart';

/// Servicio para gestionar apuestas deportivas con la API del backend
class SportsBettingService {
  static const String baseUrl = ApiConfig.baseUrl;

  /// Obtener token JWT almacenado
  static Future<String?> _getToken() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      return prefs.getString('token');
    } catch (e) {
      debugPrint('Error obteniendo token: $e');
      return null;
    }
  }

  /// Crear una nueva apuesta (simple o combinada)
  static Future<Map<String, dynamic>> createBet({
    required String tipo,
    required double monto,
    required List<Map<String, dynamic>> selecciones,
  }) async {
    final token = await _getToken();
    if (token == null) {
      throw Exception('No autenticado. Por favor inicia sesión.');
    }

    final url = Uri.parse('$baseUrl/apuestas-deportivas/crear');

    final body = {'tipo': tipo, 'monto': monto, 'selecciones': selecciones};

    debugPrint(
      '🎯 Creando apuesta: $tipo, monto: $monto, selecciones: ${selecciones.length}',
    );
    debugPrint('📦 Request Body: ${jsonEncode(body)}');

    final response = await http.post(
      url,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode(body),
    );

    debugPrint('📥 Response status: ${response.statusCode}');

    if (response.statusCode == 201) {
      final data = jsonDecode(response.body);
      debugPrint('✅ Apuesta creada exitosamente: ID ${data['id']}');
      return data;
    } else if (response.statusCode == 400) {
      final error = jsonDecode(response.body);
      throw Exception(error['message'] ?? 'Error al crear la apuesta');
    } else if (response.statusCode == 404) {
      throw Exception('El evento de apuesta no existe o ya no está disponible');
    } else {
      throw Exception(
        'Error al crear la apuesta. Código: ${response.statusCode}',
      );
    }
  }

  /// Obtener historial de apuestas con paginación y filtros
  static Future<Map<String, dynamic>> getBetHistory({
    String? estado,
    int limit = 20,
    int offset = 0,
  }) async {
    final token = await _getToken();
    if (token == null) {
      throw Exception('No autenticado. Por favor inicia sesión.');
    }

    final queryParams = {
      'limit': limit.toString(),
      'offset': offset.toString(),
    };

    if (estado != null) {
      queryParams['estado'] = estado;
    }

    final uri = Uri.parse(
      '$baseUrl/apuestas-deportivas/historial',
    ).replace(queryParameters: queryParams);

    final response = await http.get(
      uri,
      headers: {'Authorization': 'Bearer $token'},
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Error al obtener el historial de apuestas');
    }
  }

  /// Obtener detalle de una apuesta específica
  static Future<Map<String, dynamic>> getBetDetail(int apuestaId) async {
    final token = await _getToken();
    if (token == null) {
      throw Exception('No autenticado. Por favor inicia sesión.');
    }

    final url = Uri.parse('$baseUrl/apuestas-deportivas/$apuestaId');

    final response = await http.get(
      url,
      headers: {'Authorization': 'Bearer $token'},
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else if (response.statusCode == 404) {
      throw Exception('Apuesta no encontrada');
    } else {
      throw Exception('Error al obtener detalle de la apuesta');
    }
  }

  /// Obtener estadísticas del usuario
  static Future<Map<String, dynamic>> getStatistics() async {
    final token = await _getToken();
    if (token == null) {
      throw Exception('No autenticado. Por favor inicia sesión.');
    }

    final url = Uri.parse('$baseUrl/apuestas-deportivas/estadisticas/resumen');

    final response = await http.get(
      url,
      headers: {'Authorization': 'Bearer $token'},
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Error al obtener estadísticas');
    }
  }

  /// Convertir marketId del formato "1234_main_1X2" a "main.1X2"
  static String extractMarketId(String fullId) {
    // El ID tiene formato: "eventId_category_marketKey" o "eventId_category_marketKey_option"
    final parts = fullId.split('_');
    if (parts.length >= 3) {
      // Unir category y marketKey con punto
      return '${parts[1]}.${parts[2]}';
    }
    return fullId;
  }

  /// Convertir opción traducida a formato API
  static String convertSelectionToApi(String selectedOption, String marketId) {
    final optLower = selectedOption.toLowerCase();

    // Opciones básicas 1X2
    if (selectedOption == '1') return '1';
    if (selectedOption == 'X') return 'X';
    if (selectedOption == '2') return '2';

    // Si contiene "Más de" o "Over" → "over"
    if (optLower.contains('más de') || optLower.contains('over')) {
      return 'over';
    }

    // Si contiene "Menos de" o "Under" → "under"
    if (optLower.contains('menos de') || optLower.contains('under')) {
      return 'under';
    }

    // Yes/No
    if (optLower == 'sí' || optLower == 'yes') return 'yes';
    if (optLower == 'no') return 'no';

    // Doble oportunidad
    if (optLower == '1x' ||
        optLower.contains('local') && optLower.contains('empate')) {
      return '1X';
    }
    if (optLower == '12') return '12';
    if (optLower == 'x2' ||
        optLower.contains('empate') && optLower.contains('visitante')) {
      return 'X2';
    }

    // Home/Away con hándicap (mantener valores numéricos)
    if (optLower.contains('local') || optLower.contains('home')) {
      // Extraer número si existe
      final match = RegExp(r'[-+]?\d+\.?\d*').firstMatch(selectedOption);
      if (match != null) {
        return '1'; // Para hándicaps, enviar "1" para local
      }
      return '1';
    }
    if (optLower.contains('visitante') || optLower.contains('away')) {
      final match = RegExp(r'[-+]?\d+\.?\d*').firstMatch(selectedOption);
      if (match != null) {
        return '2'; // Para hándicaps, enviar "2" para visitante
      }
      return '2';
    }

    // Par/Impar
    if (optLower == 'par' || optLower == 'even') return 'even';
    if (optLower == 'impar' || optLower == 'odd') return 'odd';

    // Ambos/Ninguno
    if (optLower == 'ambos' || optLower == 'both') return 'both';
    if (optLower == 'ninguno' || optLower == 'none') return 'none';

    // Si no encontramos match, devolver el original
    return selectedOption;
  }
}
