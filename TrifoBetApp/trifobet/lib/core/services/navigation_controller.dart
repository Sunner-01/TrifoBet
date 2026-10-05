import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class NavigationController extends ChangeNotifier {
  static final NavigationController _instance = NavigationController._internal();
  factory NavigationController() => _instance;
  NavigationController._internal();

  int _index = 0;
  int get currentIndex => _index;

  void goToNextTab() {
    _index = (_index + 1) % 5;
    HapticFeedback.lightImpact(); // vibración suave al cambiar
    notifyListeners();
  }

  void setIndex(int index) {
    if (_index != index) {
      _index = index;
      notifyListeners();
    }
  }
}