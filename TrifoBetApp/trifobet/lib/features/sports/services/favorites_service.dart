import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';

/// Servicio para gestionar eventos favoritos del usuario
class FavoritesService extends ChangeNotifier {
  static final FavoritesService _instance = FavoritesService._internal();
  factory FavoritesService() => _instance;
  FavoritesService._internal();

  static const String _key = 'sports_favorites';
  final Set<int> _favoriteEventIds = {};

  Set<int> get favoriteIds => Set.unmodifiable(_favoriteEventIds);
  bool get hasFavorites => _favoriteEventIds.isNotEmpty;

  /// Inicializa el servicio cargando favoritos del storage
  Future<void> initialize() async {
    await _loadFavorites();
  }

  /// Verifica si un evento es favorito
  bool isFavorite(int eventId) {
    return _favoriteEventIds.contains(eventId);
  }

  /// Agrega o remueve un evento de favoritos (toggle)
  Future<void> toggleFavorite(int eventId) async {
    if (_favoriteEventIds.contains(eventId)) {
      _favoriteEventIds.remove(eventId);
    } else {
      _favoriteEventIds.add(eventId);
    }

    await _saveFavorites();
    notifyListeners();
  }

  /// Agrega un evento a favoritos
  Future<void> addFavorite(int eventId) async {
    if (!_favoriteEventIds.contains(eventId)) {
      _favoriteEventIds.add(eventId);
      await _saveFavorites();
      notifyListeners();
    }
  }

  /// Remueve un evento de favoritos
  Future<void> removeFavorite(int eventId) async {
    if (_favoriteEventIds.remove(eventId)) {
      await _saveFavorites();
      notifyListeners();
    }
  }

  /// Limpia todos los favoritos
  Future<void> clearAll() async {
    _favoriteEventIds.clear();
    await _saveFavorites();
    notifyListeners();
  }

  /// Carga favoritos desde SharedPreferences
  Future<void> _loadFavorites() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final jsonString = prefs.getString(_key);

      if (jsonString != null) {
        final List<dynamic> decoded = jsonDecode(jsonString);
        _favoriteEventIds.clear();
        _favoriteEventIds.addAll(decoded.cast<int>());
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Error loading favorites: $e');
    }
  }

  /// Guarda favoritos en SharedPreferences
  Future<void> _saveFavorites() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final jsonString = jsonEncode(_favoriteEventIds.toList());
      await prefs.setString(_key, jsonString);
    } catch (e) {
      debugPrint('Error saving favorites: $e');
    }
  }
}
