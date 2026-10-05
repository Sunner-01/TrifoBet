import 'package:flutter/material.dart';
import '../models/bet_slip_item.dart';
import '../models/bet_type.dart';
import 'dart:math';
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../shared/utils/currency_helper.dart';
import 'sports_betting_service.dart';

/// Modo de stake: total o individual por apuesta
enum StakeMode { total, individual }

/// Bet guardado
class SavedBet {
  final String id;
  final String name;
  final List<BetSlipItem> selections;
  final double stake;
  final BetType type;
  final DateTime savedAt;

  SavedBet({
    required this.id,
    required this.name,
    required this.selections,
    required this.stake,
    required this.type,
    required this.savedAt,
  });

  /// Convierte SavedBet a JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'selections': selections.map((item) => item.toJson()).toList(),
      'stake': stake,
      'type': type.name,
      'savedAt': savedAt.toIso8601String(),
    };
  }

  /// Crea SavedBet desde JSON
  factory SavedBet.fromJson(Map<String, dynamic> json) {
    return SavedBet(
      id: json['id'] as String,
      name: json['name'] as String,
      selections: (json['selections'] as List)
          .map((item) => BetSlipItem.fromJson(item as Map<String, dynamic>))
          .toList(),
      stake: (json['stake'] as num).toDouble(),
      type: BetType.values.firstWhere(
        (type) => type.name == json['type'],
        orElse: () => BetType.multiple,
      ),
      savedAt: DateTime.parse(json['savedAt'] as String),
    );
  }
}

/// Servicio global para gestionar el cupón de apuestas
class BetSlipService extends ChangeNotifier {
  static final BetSlipService _instance = BetSlipService._internal();
  factory BetSlipService() => _instance;
  BetSlipService._internal();

  final List<BetSlipItem> _items = [];
  double _betAmount = 50.0; // Monto predeterminado: 50 Bs
  BetType _betType = BetType.multiple;
  final List<Map<String, dynamic>> _betHistory = [];
  final List<SavedBet> _savedBets = [];

  // Nuevas propiedades profesionales
  StakeMode _stakeMode = StakeMode.total;
  final Map<String, double> _individualStakes = {};
  bool _acceptOddsChanges = true;
  bool _isCompactView = false;
  String currencySymbol = 'Bs'; // Bolivianos

  Future<void> init() async {
    currencySymbol = await CurrencyHelper.getUserCurrencySymbol();
    await _loadBetsFromStorage();
    notifyListeners();
  }

  static const List<double> quickAmounts = [
    10,
    20,
    50,
    100,
    200,
  ]; // Montos en Bolivianos

  // Getters
  List<BetSlipItem> get items => List.unmodifiable(_items);
  double get betAmount => _betAmount;
  BetType get betType => _betType;
  int get itemCount => _items.length;
  bool get isEmpty => _items.isEmpty;
  bool get isNotEmpty => _items.isNotEmpty;
  List<Map<String, dynamic>> get betHistory => List.unmodifiable(_betHistory);
  StakeMode get stakeMode => _stakeMode;
  bool get acceptOddsChanges => _acceptOddsChanges;
  bool get isCompactView => _isCompactView;
  List<SavedBet> get savedBets => List.unmodifiable(_savedBets);
  int get savedBetsCount => _savedBets.length;

  double get totalOdds {
    if (_items.isEmpty) return 0.0;
    return _items.fold(1.0, (total, item) => total * item.odds);
  }

  double get potentialWin {
    if (_items.isEmpty) return 0.0;
    return _calculatePotentialWin();
  }

  bool get canPlaceBet {
    if (_items.isEmpty || _betAmount < 2) return false; // Mínimo 2 Bs
    if (_betType.requiresMultipleSelections &&
        _items.length < _betType.minSelections) {
      return false;
    }
    return true;
  }

  String? get validationError {
    if (_items.isEmpty) return 'Agrega al menos una selección';
    if (_items.isEmpty) return 'Agrega al menos una selección';
    if (_betAmount < 2) return 'El monto mínimo es $currencySymbol 2';
    if (_betType == BetType.multiple && _items.length < 2) {
      return 'Las apuestas combinadas requieren al menos 2 selecciones';
    }
    if (_betType == BetType.system && _items.length < 3) {
      return 'Las apuestas de sistema requieren al menos 3 selecciones';
    }
    return null;
  }

  bool hasItem(String id) {
    return _items.any((item) => item.id == id);
  }

  void toggleItem(BetSlipItem item) {
    final index = _items.indexWhere((i) => i.id == item.id);

    if (index >= 0) {
      _items.removeAt(index);
      _individualStakes.remove(item.id);
    } else {
      _items.removeWhere((i) => i.eventId == item.eventId);
      _items.add(item);
      _individualStakes[item.id] = 10.0; // Mínimo individual: 10 Bs
    }

    notifyListeners();
  }

  void removeItem(String id) {
    _items.removeWhere((item) => item.id == id);
    _individualStakes.remove(id);
    notifyListeners();
  }

  void clearAll() {
    _items.clear();
    _individualStakes.clear();
    _betAmount = 50.0; // Volver al predeterminado
    notifyListeners();
  }

  void updateBetAmount(double amount) {
    _betAmount = amount.clamp(2.0, 100000.0); // Mínimo 2 Bs, máximo 100,000 Bs
    notifyListeners();
  }

  void setBetType(BetType type) {
    _betType = type;
    notifyListeners();
  }

  void setQuickAmount(double amount) {
    updateBetAmount(amount);
  }

  Future<bool> placeBet() async {
    if (!canPlaceBet) return false;

    try {
      // Convertir items a formato de API
      final selecciones = _items.map((item) {
        // Extraer marketId del ID (formato: "eventId_category_market")
        final marketId = SportsBettingService.extractMarketId(item.id);

        // Convertir selección traducida a formato API
        final seleccionApi = SportsBettingService.convertSelectionToApi(
          item.selectedOption,
          marketId,
        );

        return {
          'eventoId': item.eventId,
          'mercado': marketId,
          'seleccion': seleccionApi,
          'cuota': item.odds,
          'eventoNombre': '${item.homeTeam} vs ${item.awayTeam}',
          'seleccionDisplay': '${item.selectedOption} (${item.odds})',
        };
      }).toList();

      // Determinar tipo según cantidad de selecciones
      final tipo = _betType == BetType.simple ? 'simple' : 'combinada';

      debugPrint('🎯 Realizando apuesta: $tipo, monto: $_betAmount');
      debugPrint('📋 Selecciones: ${selecciones.length}');

      // Llamar a la API
      final apuesta = await SportsBettingService.createBet(
        tipo: tipo,
        monto: _betAmount,
        selecciones: selecciones,
      );

      debugPrint('✅ Apuesta creada con ID: ${apuesta['id']}');

      // Guardar en historial local para referencia
      final betData = {
        'id': apuesta['id'],
        'timestamp': apuesta['fechaCreacion'],
        'type': apuesta['tipo'],
        'amount': apuesta['monto'],
        'odds': apuesta['cuotaTotal'],
        'potentialWin': apuesta['gananciaPotencial'],
        'selections': _items.length,
        'estado': apuesta['estado'],
      };

      _betHistory.insert(0, betData);
      if (_betHistory.length > 10) _betHistory.removeLast();

      // Limpiar cupón
      clearAll();

      // Programar verificación del resultado después de 32 segundos
      _scheduleBetCheck(apuesta['id']);

      return true;
    } catch (e) {
      debugPrint('❌ Error al crear apuesta: $e');
      // Propagar el error para que el UI pueda mostrarlo
      rethrow;
    }
  }

  /// Programar verificación del resultado de la apuesta
  void _scheduleBetCheck(int betId) {
    Future.delayed(const Duration(seconds: 32), () async {
      try {
        final betDetail = await SportsBettingService.getBetDetail(betId);
        debugPrint('📊 Resultado apuesta $betId: ${betDetail['estado']}');

        // Actualizar historial local con el resultado
        final index = _betHistory.indexWhere((b) => b['id'] == betId);
        if (index != -1) {
          _betHistory[index]['estado'] = betDetail['estado'];
          notifyListeners();
        }
      } catch (e) {
        debugPrint('⚠️ Error verificando resultado de apuesta: $e');
      }
    });
  }

  double _calculatePotentialWin() {
    if (_items.isEmpty) return 0.0;

    if (_stakeMode == StakeMode.individual) {
      return _items.fold(0.0, (sum, item) {
        final stake = _individualStakes[item.id] ?? 10.0;
        return sum + (stake * item.odds);
      });
    }

    switch (_betType) {
      case BetType.simple:
        return _betAmount * (_items.isNotEmpty ? _items.first.odds : 1.0);
      case BetType.multiple:
        return _betAmount * totalOdds;
      case BetType.system:
        return _betAmount * totalOdds * 0.7;
    }
  }

  // ==================== MÉTODOS PROFESIONALES ====================

  void setStakeMode(StakeMode mode) {
    _stakeMode = mode;
    notifyListeners();
  }

  void setIndividualStake(String itemId, double amount) {
    _individualStakes[itemId] = amount.clamp(2.0, 100000.0);
    notifyListeners();
  }

  double getIndividualStake(String itemId) {
    return _individualStakes[itemId] ?? 10.0;
  }

  double getIndividualPotentialWin(String itemId) {
    final item = _items.firstWhere((i) => i.id == itemId);
    final stake = _individualStakes[itemId] ?? 10.0;
    return stake * item.odds;
  }

  void toggleAcceptOddsChanges() {
    _acceptOddsChanges = !_acceptOddsChanges;
    notifyListeners();
  }

  void toggleCompactView() {
    _isCompactView = !_isCompactView;
    notifyListeners();
  }

  void saveBetSlip(String name) async {
    if (_items.isEmpty) return;

    final saved = SavedBet(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      name: name,
      selections: List.from(_items),
      stake: _betAmount,
      type: _betType,
      savedAt: DateTime.now(),
    );

    _savedBets.insert(0, saved);
    if (_savedBets.length > 10) _savedBets.removeLast();
    await _saveBetsToStorage();
    notifyListeners();
  }

  void loadSavedBet(String id) {
    final saved = _savedBets.firstWhere((bet) => bet.id == id);
    _items.clear();
    _items.addAll(saved.selections);
    _betAmount = saved.stake;
    _betType = saved.type;
    notifyListeners();
  }

  void removeSavedBet(String id) async {
    _savedBets.removeWhere((bet) => bet.id == id);
    await _saveBetsToStorage();
    notifyListeners();
  }

  String generateShareCode() {
    if (_items.isEmpty) return '';
    final Random random = Random();
    return 'TB${random.nextInt(999999).toString().padLeft(6, '0')}';
  }

  double? getCashOutValue() {
    if (_items.isEmpty || _betHistory.isEmpty) return null;
    final Random random = Random();
    final percentage = 0.7 + (random.nextDouble() * 0.2);
    return potentialWin * percentage;
  }

  // ==================== PERSISTENCIA LOCAL ====================

  static const String _savedBetsKey = 'trifobet_saved_bets';

  /// Guarda los cupones en SharedPreferences
  Future<void> _saveBetsToStorage() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final betsJson = _savedBets.map((bet) => bet.toJson()).toList();
      final encoded = jsonEncode(betsJson);
      await prefs.setString(_savedBetsKey, encoded);
    } catch (e) {
      debugPrint('Error guardando cupones: $e');
    }
  }

  /// Carga los cupones desde SharedPreferences
  Future<void> _loadBetsFromStorage() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final encoded = prefs.getString(_savedBetsKey);
      if (encoded != null && encoded.isNotEmpty) {
        final List<dynamic> decoded = jsonDecode(encoded);
        _savedBets.clear();
        _savedBets.addAll(
          decoded.map(
            (json) => SavedBet.fromJson(json as Map<String, dynamic>),
          ),
        );
      }
    } catch (e) {
      debugPrint('Error cargando cupones: $e');
    }
  }
}
