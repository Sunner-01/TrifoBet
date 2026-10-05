// lib/features/home/home_screen.dart → TU CÓDIGO ORIGINAL + POCAS LÍNEAS

import 'package:flutter/material.dart';
import 'package:trifobet/features/sports/screens/sports_screen.dart';
import 'package:trifobet/features/casino/screens/casino_screen.dart';
import 'package:trifobet/features/profile/screens/profile_screen.dart';
import 'package:trifobet/features/support/screens/support_screen.dart';
import 'package:trifobet/features/deposit/screens/deposit_screen.dart';

// === CLAVE GLOBAL PARA CONTROLAR EL HOME DESDE AFUERA ===
final GlobalKey<_HomeScreenState> homeKey = GlobalKey<_HomeScreenState>();

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedIndex = 0;

  // === EXPONEMOS EL ÍNDICE Y UN MÉTODO PARA CAMBIARLO DESDE AFUERA ===
  int get currentIndex => _selectedIndex;
  void changeTab(int index) {
    if (mounted) {
      setState(() {
        _selectedIndex = index;
      });
    }
  }

  final List<Widget> _pages = const [
    SportsScreen(),
    CasinoScreen(),
    ProfileScreen(),
    SupportScreen(),
    DepositScreen(),
  ];

  void _onItemTapped(int index) {
    setState(() => _selectedIndex = index);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      key: homeKey, // ← necesario para acceder desde fuera
      body: _pages[_selectedIndex],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: _onItemTapped,
        type: BottomNavigationBarType.fixed,
        selectedItemColor: Colors.green,
        unselectedItemColor: const Color.fromARGB(255, 198, 198, 198),
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.sports_soccer), label: 'Deportes'),
          BottomNavigationBarItem(icon: Icon(Icons.casino), label: 'Casino'),
          BottomNavigationBarItem(icon: Icon(Icons.person), label: 'Perfil'),
          BottomNavigationBarItem(icon: Icon(Icons.support_agent), label: 'Soporte'),
          BottomNavigationBarItem(icon: Icon(Icons.attach_money), label: 'Recarga'),
        ],
      ),
    );
  }
}