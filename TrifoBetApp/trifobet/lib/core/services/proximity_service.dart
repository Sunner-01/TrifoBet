// lib/core/services/proximity_service.dart

import 'dart:async';
import 'package:proximity_sensor/proximity_sensor.dart';
import 'package:flutter/services.dart';
import 'package:flutter/foundation.dart';

class ProximityService {
  static final ProximityService _instance = ProximityService._();
  factory ProximityService() => _instance;
  ProximityService._();

  StreamSubscription? _subscription;
  Timer? _holdTimer;
  Timer? _vibrationTimer;
  Function? _onHold;
  bool _isNear = false;
  bool _timerRunning = false; // Nueva variable para evitar reiniciar timer

  void startListening(Function onHold) {
    _onHold = onHold;

    _subscription = ProximitySensor.events.listen((event) {
      final wasNear = _isNear;
      _isNear = event > 0;

      

      // SOLO iniciar timer si cambió de LEJOS a CERCA
      if (_isNear && !wasNear && !_timerRunning) {
        // Transición LEJOS → CERCA
        debugPrint('🟢 Transición a CERCA - Iniciando timer...');
        _timerRunning = true;

        // Vibración continua cada 400ms
        _vibrationTimer?.cancel();
        _vibrationTimer = Timer.periodic(const Duration(milliseconds: 400), (
          _,
        ) {
          HapticFeedback.selectionClick();
        });

        // Timer de 5 segundos (solo se inicia UNA vez)
        _holdTimer?.cancel();
        _holdTimer = Timer(const Duration(seconds: 5), () {
          debugPrint('⏱️ Timer completado después de 5 segundos');
          debugPrint('⏱️ Estado actual: ${_isNear ? "CERCA" : "LEJOS"}');

          if (_isNear) {
            debugPrint('🚪 Sesión cerrada por proximidad');
            HapticFeedback.heavyImpact();
            _vibrationTimer?.cancel();
            _onHold?.call();
          }
          _timerRunning = false;
        });
      } else if (!_isNear && wasNear) {
        // Transición CERCA → LEJOS - cancelar todo
        debugPrint('🔴 Transición a LEJOS - Cancelando timers');
        _vibrationTimer?.cancel();
        _holdTimer?.cancel();
        _timerRunning = false;
      }
    });
  }

  void stopListening() {
    _subscription?.cancel();
    _vibrationTimer?.cancel();
    _holdTimer?.cancel();
    _isNear = false;
    _timerRunning = false;
  }
}
