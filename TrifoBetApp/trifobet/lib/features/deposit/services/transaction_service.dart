import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/transaction_model.dart';
import '../models/payment_method_model.dart';

import '../../../core/config/api_config.dart';

class TransactionService {
  static const String baseUrl = ApiConfig.baseUrl;

  /// Obtiene el token JWT del storage
  static Future<String?> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('token');
  }

  /// Obtiene headers con autenticación
  static Future<Map<String, String>> _getHeaders() async {
    final token = await _getToken();
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  /// Obtener métodos de pago disponibles
  static Future<List<PaymentMethodModel>> getPaymentMethods() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/transacciones/metodos-pago'),
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        return data.map((json) => PaymentMethodModel.fromJson(json)).toList();
      } else {
        throw Exception('Error al obtener métodos de pago');
      }
    } catch (e) {
      throw Exception('Error de conexión: $e');
    }
  }

  static Future<List<dynamic>> getMyBankAccounts() async {
    try {
      final headers = await _getHeaders();
      final response = await http.get(
        Uri.parse('$baseUrl/retiros/cuenta/mis-cuentas'),
        headers: headers,
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        return data;
      } else {
        throw Exception('Error al obtener cuentas bancarias');
      }
    } catch (e) {
      throw Exception('Error de conexión: $e');
    }
  }

  /// Crear depósito
  static Future<TransactionModel> createDeposit({
    required double amount,
    required int financialEntityId,
    required int paymentMethodId,
    String? operationNumber,
    Map<String, dynamic>? paymentData,
  }) async {
    try {
      final headers = await _getHeaders();
      final response = await http.post(
        Uri.parse('$baseUrl/transacciones/deposito'),
        headers: headers,
        body: json.encode({
          'monto': amount,
          'entidadFinancieraId': financialEntityId,
          'metodoPagoId': paymentMethodId,
          if (operationNumber != null) 'numeroOperacion': operationNumber,
          if (paymentData != null) 'datosPago': paymentData,
        }),
      );

      if (response.statusCode == 201 || response.statusCode == 200) {
        final data = json.decode(response.body);
        return TransactionModel.fromJson(data['transaccion']);
      } else {
        final error = json.decode(response.body);
        throw Exception(error['message'] ?? 'Error al crear depósito');
      }
    } catch (e) {
      throw Exception('Error de conexión: $e');
    }
  }

  /// Crear retiro con cuenta verificada
  static Future<dynamic> createWithdrawalWithAccount({
    required double amount,
    required int cuentaRetiroId,
  }) async {
    try {
      final headers = await _getHeaders();
      final response = await http.post(
        Uri.parse('$baseUrl/retiros/solicitar'),
        headers: headers,
        body: json.encode({
          'monto': amount,
          'cuenta_retiro_id': cuentaRetiroId,
        }),
      );

      if (response.statusCode == 201 || response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        final error = json.decode(response.body);
        throw Exception(error['message'] ?? 'Error al solicitar retiro');
      }
    } catch (e) {
      throw Exception('Error de conexión: $e');
    }
  }

  /// Crear retiro (Legacy)
  static Future<TransactionModel> createWithdrawal({
    required double amount,
    required int financialEntityId,
    required int paymentMethodId,
    required Map<String, dynamic> paymentData,
  }) async {
    try {
      final headers = await _getHeaders();
      final response = await http.post(
        Uri.parse('$baseUrl/transacciones/retiro'),
        headers: headers,
        body: json.encode({
          'monto': amount,
          'entidadFinancieraId': financialEntityId,
          'metodoPagoId': paymentMethodId,
          'datosPago': paymentData,
        }),
      );

      if (response.statusCode == 201 || response.statusCode == 200) {
        final data = json.decode(response.body);
        return TransactionModel.fromJson(data['transaccion']);
      } else {
        final error = json.decode(response.body);
        throw Exception(error['message'] ?? 'Error al crear retiro');
      }
    } catch (e) {
      throw Exception('Error de conexión: $e');
    }
  }

  /// Obtener historial de transacciones
  static Future<Map<String, dynamic>> getHistory({
    String? type,
    String? status,
    int limit = 20,
    int offset = 0,
  }) async {
    try {
      final headers = await _getHeaders();
      final queryParams = <String, String>{
        'limit': limit.toString(),
        'offset': offset.toString(),
        if (type != null) 'tipo': type,
        if (status != null) 'estado': status,
      };

      final uri = Uri.parse(
        '$baseUrl/transacciones/historial',
      ).replace(queryParameters: queryParams);

      print('📡 [TransactionService] Requesting history from: $uri');
      print('🔑 [TransactionService] Headers: $headers');

      final response = await http.get(uri, headers: headers);

      print('📊 [TransactionService] Response status: ${response.statusCode}');
      print('📄 [TransactionService] Response body: ${response.body}');

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        print('🔍 [TransactionService] Decoded data keys: ${data.keys}');
        print('🔍 [TransactionService] Full data: $data');

        final transactions = (data['transacciones'] as List)
            .map((json) => TransactionModel.fromJson(json))
            .toList();

        print(
          '✅ [TransactionService] Parsed ${transactions.length} transactions',
        );

        return {
          'transactions': transactions,
          'total': data['total'],
          'page': data['pagina'],
          'perPage': data['porPagina'],
        };
      } else {
        print('❌ [TransactionService] Error response: ${response.body}');
        throw Exception('Error al obtener historial');
      }
    } catch (e) {
      print('💥 [TransactionService] Exception in getHistory: $e');
      throw Exception('Error de conexión: $e');
    }
  }

  /// Obtener balance actual del usuario
  static Future<double> getCurrentBalance() async {
    try {
      final headers = await _getHeaders();
      print('📡 Requesting balance from: $baseUrl/perfil/me');
      print('🔑 Headers: $headers');

      final response = await http.get(
        Uri.parse('$baseUrl/perfil/me'),
        headers: headers,
      );

      print('📊 Response status: ${response.statusCode}');
      print('📄 Response body: ${response.body}');

      if (response.statusCode == 200) {
        final data = json.decode(response.body);

        // Verificar si el campo 'saldo' existe
        if (!data.containsKey('saldo')) {
          print(
            '⚠️ Campo "saldo" no encontrado en respuesta. Campos disponibles: ${data.keys}',
          );
          // Intentar con 'balance' o retornar 0
          if (data.containsKey('balance')) {
            return (data['balance'] as num).toDouble();
          }
          return 0.0; // Balance por defecto si no existe
        }

        return (data['saldo'] as num).toDouble();
      } else {
        final errorBody = response.body;
        print('❌ Error ${response.statusCode}: $errorBody');
        throw Exception('Error ${response.statusCode}: $errorBody');
      }
    } catch (e) {
      print('💥 Exception en getCurrentBalance: $e');
      throw Exception('Error de conexión: $e');
    }
  }
}
