import 'package:flutter/material.dart';
import 'deposit_screen.dart';
import 'withdrawal_screen.dart';
import 'transaction_history_screen.dart';

class TransactionsTabScreen extends StatefulWidget {
  final int initialIndex;

  const TransactionsTabScreen({super.key, this.initialIndex = 0});

  @override
  State<TransactionsTabScreen> createState() => _TransactionsTabScreenState();
}

class _TransactionsTabScreenState extends State<TransactionsTabScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(
      length: 3,
      vsync: this,
      initialIndex: widget.initialIndex,
    );
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0a0a0a),
      appBar: AppBar(
        title: const Text('Transacciones'),
        backgroundColor: const Color(0xFF1a1a1a),
        elevation: 0,
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: const Color(0xFF00e676),
          labelColor: const Color(0xFF00e676),
          unselectedLabelColor: Colors.white60,
          tabs: const [
            Tab(icon: Icon(Icons.add_circle_outline), text: 'Depositar'),
            Tab(icon: Icon(Icons.remove_circle_outline), text: 'Retirar'),
            Tab(icon: Icon(Icons.history), text: 'Historial'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: const [
          DepositScreen(),
          WithdrawalScreen(),
          TransactionHistoryScreen(),
        ],
      ),
    );
  }
}
