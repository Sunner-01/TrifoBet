// lib/core/services/app_controller.dart

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class AppController extends ChangeNotifier {
  static final AppController instance = AppController._();
  factory AppController() => instance;
  AppController._();

  int tabIndex = 0;

  // Cambiar a siguiente pestaña (shake)
  void nextTab() {
    tabIndex = (tabIndex + 1) % 5;
    HapticFeedback.lightImpact(); // vibración suave
    notifyListeners();
  }

  // Para cuando tocas manualmente
  void setTab(int index) {
    if (tabIndex != index) {
      tabIndex = index;
      notifyListeners();
    }
  }

  // Vibración continua mientras el sensor está tapado
  void startProximityVibration() {
    HapticFeedback.selectionClick();
    Future.delayed(const Duration(milliseconds: 400), () {
      if (_proximityActive) HapticFeedback.selectionClick();
    });
  }

  static bool _proximityActive = false;
  void setProximityActive(bool active) {
    _proximityActive = active;
    if (active) startProximityVibration();
  }
}