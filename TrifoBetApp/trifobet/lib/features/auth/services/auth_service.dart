import 'dart:async';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import '../../../core/config/api_config.dart';

class AuthService {
  static const String baseUrl = ApiConfig.baseUrl;

  // ====================== REGISTRO ======================
  static Future<Map<String, dynamic>> register({
    required String nombre,
    required String apellido1,
    required String apellido2,
    required String ci,
    required String fechaNacimiento,
    required String nombreUsuario,
    required String correo,
    required String telefono,
    required String contrasena,
    String paisCodigo = 'BO',
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/register'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          "nombre": nombre,
          "apellido1": apellido1,
          "apellido2": apellido2,
          "ci": ci,
          "fechaNacimiento": fechaNacimiento,
          "nombreUsuario": nombreUsuario,
          "correo": correo,
          "telefono": telefono,
          "contrasena": contrasena,
          "paisCodigo": paisCodigo,
        }),
      );

      if (response.statusCode == 201 || response.statusCode == 200) {
        return {'success': true, 'message': 'Usuario creado'};
      } else {
        final data = jsonDecode(response.body);
        String error = 'Error al registrarse';
        if (data['message'] != null) {
          if (data['message'] is List) {
            error = (data['message'] as List).join('\n');
          } else {
            error = data['message'].toString();
          }
        }
        return {'success': false, 'error': error};
      }
    } catch (e) {
      return {'success': false, 'error': 'Sin conexión al servidor'};
    }
  }

  // ====================== LOGIN======================
  static Future<Map<String, dynamic>> login(
    String identifier,
    String password,
  ) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          if (identifier.contains('@')) "correo": identifier,
          if (!identifier.contains('@')) "nombreUsuario": identifier,
          "contrasena": password,
        }),
      ).timeout(const Duration(seconds: 15));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final token = data['access_token'];
        final usuario = data['usuario'];

        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('token', token);
        await prefs.setString('user', jsonEncode(usuario));
        await prefs.setBool('isLoggedIn', true);

        return {'success': true, 'usuario': usuario, 'token': token};
      } else {
        final error =
            jsonDecode(response.body)['message'] ?? 'Credenciales inválidas';
        return {'success': false, 'error': error};
      }
    } catch (e) {
      print('=== ERROR DE CONEXIÓN ===');
      print(e);
      if (e is TimeoutException) {
        return {'success': false, 'error': 'El servidor tardó mucho en responder (Timeout)'};
      }
      return {'success': false, 'error': 'Sin conexión al servidor: $e'};
    }
  }

  // ====================== LOGOUT ======================
  static Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();

    await prefs.remove('token');
    await prefs.remove('user');
    await prefs.remove('isLoggedIn');
  }

  // ====================== ESTADO DE SESIÓN ======================
  static Future<bool> isLoggedIn() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool('isLoggedIn') ?? false;
  }

  static Future<Map<String, dynamic>?> getUser() async {
    final prefs = await SharedPreferences.getInstance();
    final userJson = prefs.getString('user');
    return userJson != null ? jsonDecode(userJson) : null;
  }

  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('token');
  }

  // ====================== GEOLOCALIZACIÓN ======================
  static Future<bool> verifyLocation(double lat, double lng) async {
    // DESACTIVADO TEMPORALMENTE A PETICIÓN DEL USUARIO
    return true; 
    
    /*
    try {
      print('📍 [AuthService] Verificando ubicación: lat=$lat, lng=$lng');
      final response = await http.post(
        Uri.parse('$baseUrl/geolocalizacion/verificar'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({"lat": lat, "lng": lng}),
      );

      print(
        ' [AuthService] Respuesta API Geolocalización: ${response.statusCode}',
      );
      print(' [AuthService] Body: ${response.body}');

      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = jsonDecode(response.body);
        final allowed = data['dentroDeBolivia'] == true;
        print(' [AuthService] Acceso permitido: $allowed');
        return allowed;
      }
      print(' [AuthService] Error en API: ${response.statusCode}');
      return false;
    } catch (e) {
      print(' [AuthService] Error de conexión en verifyLocation: $e');
      return false;
    }
    */
  }
}
