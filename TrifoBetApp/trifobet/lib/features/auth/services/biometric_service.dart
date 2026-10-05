import 'package:flutter/material.dart';
import 'package:local_auth/local_auth.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Servicio para gestionar autenticación biométrica
class BiometricService {
  static const String _biometricEnabledKey = 'biometric_enabled';
  static const String _usernameKey = 'biometric_username';
  static const String _passwordKey = 'biometric_password';

  static final LocalAuthentication _localAuth = LocalAuthentication();
  static const FlutterSecureStorage _secureStorage = FlutterSecureStorage();

  /// Verifica si el dispositivo soporta biometría
  static Future<bool> isBiometricAvailable() async {
    try {
      final bool canAuthenticateWithBiometrics =
          await _localAuth.canCheckBiometrics;
      final bool canAuthenticate =
          canAuthenticateWithBiometrics || await _localAuth.isDeviceSupported();

      if (!canAuthenticate) return false;

      // Verificar si hay biométricos registrados
      final List<BiometricType> availableBiometrics = await _localAuth
          .getAvailableBiometrics();

      return availableBiometrics.isNotEmpty;
    } catch (e) {
      debugPrint('Error checking biometric availability: $e');
      return false;
    }
  }

  /// Verifica si el usuario tiene habilitado el login biométrico
  static Future<bool> isBiometricEnabled() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool(_biometricEnabledKey) ?? false;
  }

  /// Activa el login biométrico guardando las credenciales de forma segura
  static Future<bool> enableBiometric({
    required String username,
    required String password,
  }) async {
    try {
      // Primero verificar que la biometría está disponible
      final available = await isBiometricAvailable();
      if (!available) {
        return false;
      }

      // Autenticar con biometría para confirmar
      final authenticated = await _localAuth.authenticate(
        localizedReason: 'Confirma tu identidad para activar login con huella',
        options: const AuthenticationOptions(
          stickyAuth: true,
          biometricOnly: true,
        ),
      );

      if (!authenticated) {
        return false;
      }

      // Guardar credenciales de forma segura
      await _secureStorage.write(key: _usernameKey, value: username);
      await _secureStorage.write(key: _passwordKey, value: password);

      // Guardar flag de habilitado
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool(_biometricEnabledKey, true);

      return true;
    } catch (e) {
      debugPrint('Error enabling biometric: $e');
      return false;
    }
  }

  /// Desactiva el login biométrico y elimina las credenciales guardadas
  static Future<void> disableBiometric() async {
    try {
      // Borrar credenciales
      await _secureStorage.delete(key: _usernameKey);
      await _secureStorage.delete(key: _passwordKey);

      // Borrar flag
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool(_biometricEnabledKey, false);
    } catch (e) {
      debugPrint('Error disabling biometric: $e');
    }
  }

  /// Autentica con biometría y recupera las credenciales guardadas
  static Future<Map<String, String>?> authenticateWithBiometric() async {
    try {
      // Verificar que está habilitado
      final enabled = await isBiometricEnabled();
      if (!enabled) return null;

      // Autenticar
      final authenticated = await _localAuth.authenticate(
        localizedReason: 'Coloca tu huella para iniciar sesión',
        options: const AuthenticationOptions(
          stickyAuth: true,
          biometricOnly: true,
        ),
      );

      if (!authenticated) return null;

      // Recuperar credenciales
      final username = await _secureStorage.read(key: _usernameKey);
      final password = await _secureStorage.read(key: _passwordKey);

      if (username == null || password == null) {
        // Credenciales no encontradas, desactivar biométrico
        await disableBiometric();
        return null;
      }

      return {'username': username, 'password': password};
    } catch (e) {
      debugPrint('Error authenticating with biometric: $e');
      return null;
    }
  }

  /// Limpia todo (útil al cerrar sesión)
  static Future<void> clearAll() async {
    await disableBiometric();
  }
}
