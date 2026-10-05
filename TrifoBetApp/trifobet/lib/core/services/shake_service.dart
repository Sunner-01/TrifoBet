// lib/core/services/shake_service.dart

import 'dart:async';
import 'package:sensors_plus/sensors_plus.dart';
import 'package:flutter/foundation.dart';

class ShakeService {
  static final ShakeService _instance = ShakeService._();
  factory ShakeService() => _instance;
  ShakeService._();

  StreamSubscription? _subscription;
  Function? _onShake;
  bool _isProcessing = false; // Bandera para evitar múltiples disparos

  void startListening(Function onShake) {
    _subscription?.cancel(); // Cancelar suscripción anterior si existe
    _onShake = onShake;
    _isProcessing = false; // Resetear flag al iniciar

    debugPrint('🚀 ShakeService: Iniciando escucha de acelerómetro');

    _subscription = userAccelerometerEventStream().listen(
      (event) {
        // Si ya está procesando un shake, ignorar nuevos eventos
        if (_isProcessing) return;

        // Calcular la magnitud REAL de la aceleración (raíz cuadrada de suma de cuadrados)
        // Esto nos da el valor absoluto de la aceleración en m/s²
        final double magnitude =
            (event.x * event.x + event.y * event.y + event.z * event.z);
        final double acceleration =
            magnitude; // Sin raíz para mayor sensibilidad

        // Umbral ajustado: usar un valor entre 20-30 para detección confiable
        // Valores menores pueden causar falsos positivos
        if (acceleration > 25) {
          debugPrint(
            '🔔 SHAKE DETECTADO! Aceleración: ${acceleration.toStringAsFixed(2)}',
          );

          // Marcar como procesando INMEDIATAMENTE
          _isProcessing = true;

          try {
            // Solo ejecutar el callback, dejar que main.dart maneje el haptic feedback
            _onShake?.call();
          } catch (e) {
            debugPrint('❌ Error en callback de shake: $e');
          } finally {
            // Desbloquear después de 1.5 segundos para mejor UX
            Future.delayed(const Duration(milliseconds: 1500), () {
              _isProcessing = false;
              debugPrint('✅ ShakeService: Listo para siguiente shake');
            });
          }
        }
      },
      onError: (e) {
        debugPrint('❌ Error en stream de acelerómetro: $e');
      },
    );
  }

  void stopListening() {
    _subscription?.cancel();
    _isProcessing = false;
  }
}
