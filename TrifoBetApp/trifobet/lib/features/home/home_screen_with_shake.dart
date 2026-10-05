import 'package:flutter/material.dart';
import '../../main.dart'; // Para acceder a bottomNavIndex
import '../sports/screens/sports_screen.dart';
import '../casino/screens/casino_screen.dart';
import '../profile/screens/profile_screen.dart';
import '../support/screens/support_screen.dart';
import '../deposit/screens/transactions_tab_screen.dart';

import '../chat/screens/global_chat_screen.dart';

class HomeScreenWithShakeSupport extends StatelessWidget {
  const HomeScreenWithShakeSupport({super.key});

  @override
  Widget build(BuildContext context) {
    final List<Widget> pages = [
      SportsScreen(),
      CasinoScreen(),
      ProfileScreen(),
      SupportScreen(),
      TransactionsTabScreen(),
    ];

    return ValueListenableBuilder<int>(
      valueListenable: bottomNavIndex,
      builder: (context, selectedIndex, _) {
        debugPrint('🔄 UI rebuild con índice: $selectedIndex');
        return Scaffold(
          floatingActionButtonLocation: FloatingActionButtonLocation.startFloat,
          floatingActionButton: FloatingActionButton(
            onPressed: () {
              showModalBottomSheet(
                context: context,
                isScrollControlled: true,
                backgroundColor: Colors.transparent,
                builder: (_) => Padding(
                  padding: EdgeInsets.only(
                    bottom: MediaQuery.of(context).viewInsets.bottom,
                  ),
                  child: Container(
                    height: MediaQuery.of(context).size.height * 0.75,
                    decoration: const BoxDecoration(
                      color: Color(0xFF0a0a0a),
                      borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
                    ),
                    child: const GlobalChatScreen(),
                  ),
                ),
              );
            },
            backgroundColor: Colors.green,
            child: const Icon(Icons.chat, color: Colors.black),
          ),
          // Usar IndexedStack en lugar de pages[selectedIndex]
          // para forzar el rebuild y mantener el estado de las páginas
          body: IndexedStack(index: selectedIndex, children: pages),
          bottomNavigationBar: BottomNavigationBar(
            currentIndex: selectedIndex,
            onTap: (index) {
              bottomNavIndex.value = index;
            },
            type: BottomNavigationBarType.fixed,
            selectedItemColor: Colors.green,
            unselectedItemColor: Colors.grey,
            items: const [
              BottomNavigationBarItem(
                icon: Icon(Icons.sports_soccer),
                label: 'Deportes',
              ),
              BottomNavigationBarItem(
                icon: Icon(Icons.casino),
                label: 'Casino',
              ),
              BottomNavigationBarItem(
                icon: Icon(Icons.person),
                label: 'Perfil',
              ),
              BottomNavigationBarItem(
                icon: Icon(Icons.support_agent),
                label: 'Soporte',
              ),
              BottomNavigationBarItem(
                icon: Icon(Icons.attach_money),
                label: 'Recarga',
              ),
            ],
          ),
        );
      },
    );
  }
}
