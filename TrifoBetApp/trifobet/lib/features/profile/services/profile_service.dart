// lib/features/profile/services/profile_service.dart
import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import '../../../core/config/api_config.dart';

class ProfileService {
  static const String baseUrl = ApiConfig.baseUrl;

  static Future<String?> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('token');
  }

  static Future<Map<String, dynamic>?> getProfile() async {
    final token = await _getToken();
    if (token == null) return null;
   
    final response = await http.get(
      Uri.parse('$baseUrl/perfil/me'),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }
    return null;
  }

  static Future<bool> updateProfile(Map<String, dynamic> data) async {
    final token = await _getToken();
    if (token == null) return false;

    final response = await http.patch(
      Uri.parse('$baseUrl/perfil/me'),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
      body: jsonEncode(data),
    );

    return response.statusCode == 200;
  }

  static Future<String?> uploadProfilePhoto(File image) async {
    final token = await _getToken();
    if (token == null) return null;

    var request = http.MultipartRequest(
      'PATCH',
      Uri.parse('$baseUrl/perfil/me/photo'),
    );

    request.headers['Authorization'] = 'Bearer $token';
    request.files.add(await http.MultipartFile.fromPath('foto', image.path));

    final response = await request.send();
    if (response.statusCode == 200) {
      final respStr = await response.stream.bytesToString();
      return jsonDecode(respStr)['foto_perfil_url'];
    }
    return null;
  }

  static Future<String?> deleteProfilePhoto() async {
    final token = await _getToken();
    if (token == null) return null;

    try {
      final response = await http.delete(
        Uri.parse('$baseUrl/perfil/me/photo'),
        headers: {
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final json = jsonDecode(response.body);
        return json['foto_perfil_url'] as String?;
      }
    } catch (e) {
      print('Error eliminando foto: $e');
    }
    return null;
  }

  static Future<bool> isUserVerified() async {
    try {
      final profile = await getProfile();
      if (profile == null) return false;
      return profile['verificado'] == true;
    } catch (e) {
      print('Error verificando usuario: $e');
      return false;
    }
  }
}
