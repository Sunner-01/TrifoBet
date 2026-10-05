import 'dart:convert';

class JwtUtils {
  static Map<String, dynamic> decode(String token) {
    final parts = token.split('.');
    if (parts.length != 3) {
      throw Exception('Token JWT inválido');
    }

    final payload = _decodeBase64(parts[1]);
    final payloadMap = json.decode(payload);
    if (payloadMap is! Map<String, dynamic>) {
      throw Exception('Payload inválido');
    }

    return payloadMap;
  }

  static String _decodeBase64(String str) {
    String output = str.replaceAll('-', '+').replaceAll('_', '/');
    switch (output.length % 4) {
      case 0:
        break;
      case 2:
        output += '==';
        break;
      case 3:
        output += '=';
        break;
      default:
        throw Exception('Cadena base64url ilegal!');
    }
    return utf8.decode(base64Url.decode(output));
  }

  static int? getUserId(String token) {
    try {
      final payload = decode(token);
      final id = payload['userId'] ?? payload['sub'] ?? payload['id'];
      if (id != null) {
        return int.tryParse(id.toString());
      }
      return null;
    } catch (e) {
      return null;
    }
  }
}
