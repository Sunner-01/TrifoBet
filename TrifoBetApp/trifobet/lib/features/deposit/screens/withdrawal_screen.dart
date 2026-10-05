import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:audioplayers/audioplayers.dart';
import 'dart:async';
import '../models/payment_method_model.dart';
import '../services/transaction_service.dart';
import '../services/pending_transactions_service.dart';
import '../../profile/services/profile_service.dart';
import '../widgets/amount_input.dart';
import '../../../shared/utils/currency_helper.dart';

class WithdrawalScreen extends StatefulWidget {
  const WithdrawalScreen({super.key});

  @override
  State<WithdrawalScreen> createState() => _WithdrawalScreenState();
}

class _WithdrawalScreenState extends State<WithdrawalScreen> {
  List<dynamic> _verifiedAccounts = [];
  dynamic _selectedAccount;
  final TextEditingController _amountController = TextEditingController();
  double _currentBalance = 0;
  bool _isLoading = true;
  bool _isProcessing = false;
  final AudioPlayer _audioPlayer = AudioPlayer();
  String _currencySymbol = '\$';

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  @override
  void dispose() {
    _amountController.dispose();
    _audioPlayer.dispose();
    super.dispose();
  }

  Future<void> _loadData() async {
    try {
      final accounts = await TransactionService.getMyBankAccounts();
      final balance = await TransactionService.getCurrentBalance();
      final symbol = await CurrencyHelper.getUserCurrencySymbol();

      setState(() {
        _verifiedAccounts = accounts.where((a) => a['estado'] == 'aprobada').toList();
        _currentBalance = balance;
        _currencySymbol = symbol;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Error: $e')));
      }
    }
  }

  Future<void> _processWithdrawal() async {
    // Ocultar teclado
    FocusScope.of(context).unfocus();

    // 1. Validaciones básicas
    final amount = double.tryParse(_amountController.text) ?? 0;
    if (_selectedAccount == null) {
      _showError('Selecciona una cuenta verificada');
      return;
    }
    if (amount < 10) {
      _showError('El monto mínimo de retiro es \$$_currencySymbol 10');
      return;
    }
    if (amount > 15000) {
      _showError('El monto máximo de retiro es \$$_currencySymbol 15,000');
      return;
    }
    if (amount > _currentBalance) {
      _showError(
        'Saldo insuficiente. Disponible: \$_currencySymbol${_currentBalance.toStringAsFixed(2)}',
      );
      return;
    }

    setState(() => _isProcessing = true);

    try {
      // 3. Confirmación simple
      final confirmed = await _showConfirmationDialog(amount);
      if (!confirmed) {
        setState(() => _isProcessing = false);
        return;
      }

      await TransactionService.createWithdrawalWithAccount(
        amount: amount,
        cuentaRetiroId: _selectedAccount['id'],
      );

      // Reproducir sonido de éxito (requiere asset o implementar según corresponda)
      // _playSound('sounds/success.mp3');

      // 5. Mostrar éxito y cerrar
      if (mounted) {
        HapticFeedback.heavyImpact();
        await _showSuccessDialog(amount);

        _amountController.clear();
        setState(() => _selectedAccount = null);

        // Cerrar pantalla (volver a pestañas)
        // Opcional: Navegar al historial si se desea
      }
    } catch (e) {
      _showError('Error al procesar: $e');
    } finally {
      if (mounted) {
        setState(() => _isProcessing = false);
      }
    }
  }

  Future<bool> _showConfirmationDialog(double amount) async {
    return await showDialog<bool>(
          context: context,
          builder: (context) => AlertDialog(
            backgroundColor: const Color(0xFF1a1a1a),
            title: const Row(
              children: [
                Icon(Icons.warning_amber, color: Colors.orange),
                SizedBox(width: 12),
                Text('Confirmar Retiro'),
              ],
            ),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '¿Confirmas que deseas retirar \$_currencySymbol${amount.toStringAsFixed(2)}?',
                  style: const TextStyle(color: Colors.white),
                ),
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.blue.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.blue.withOpacity(0.3)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Detalles:',
                        style: TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 13,
                        ),
                      ),
                      SizedBox(height: 8),
                      Text(
                        '• Banco: ${_selectedAccount?['billetera'] ?? "Desconocido"}\n• Cuenta: ${_selectedAccount?['numero_cuenta'] ?? "Desconocido"}\n• Monto: \$_currencySymbol${amount.toStringAsFixed(2)}',
                        style: const TextStyle(
                          color: Colors.white70,
                          fontSize: 13,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context, false),
                child: const Text('Cancelar'),
              ),
              ElevatedButton(
                onPressed: () => Navigator.pop(context, true),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF00e676),
                  foregroundColor: Colors.black,
                ),
                child: const Text('Confirmar'),
              ),
            ],
          ),
        ) ??
        false;
  }

  Future<void> _showSuccessDialog(double amount) async {
    return showDialog(
      context: context,
      builder: (context) => Dialog(
        backgroundColor: Colors.transparent,
        child: Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFF00e676), Color(0xFF00c853)],
            ),
            borderRadius: BorderRadius.circular(20),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.send_rounded, size: 80, color: Colors.white),
              const SizedBox(height: 16),
              const Text(
                'Solicitud Enviada',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 12),
              Text(
                '\$_currencySymbol${amount.toStringAsFixed(2)}',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 32,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Text(
                  'Tu solicitud ha sido recibida. Puedes ver el estado en el historial o esperar la notificación de aprobación.',
                  style: TextStyle(color: Colors.white, fontSize: 13),
                  textAlign: TextAlign.center,
                ),
              ),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => Navigator.pop(context),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.white,
                    foregroundColor: const Color(0xFF00e676),
                    padding: const EdgeInsets.symmetric(vertical: 14),
                  ),
                  child: const Text(
                    'Cerrar',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showError(String message) {
    HapticFeedback.vibrate();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.error, color: Colors.white),
            const SizedBox(width: 12),
            Expanded(child: Text(message)),
          ],
        ),
        backgroundColor: Colors.red,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0a0a0a),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(color: Color(0xFF00e676)),
            )
          : RefreshIndicator(
              onRefresh: _loadData,
              color: const Color(0xFF00e676),
              child: CustomScrollView(
                slivers: [
                  // Hero Section con Balance
                  SliverAppBar(
                    expandedHeight: 200.0,
                    floating: false,
                    pinned: true,
                    backgroundColor: const Color(0xFF0a0a0a),
                    flexibleSpace: FlexibleSpaceBar(
                      background: Container(
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                            colors: [
                              Colors.orange.withOpacity(0.15),
                              const Color(0xFF0a0a0a),
                            ],
                          ),
                        ),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const SizedBox(height: 40),
                            const Text(
                              'Saldo Disponible',
                              style: TextStyle(
                                color: Colors.white60,
                                fontSize: 14,
                                letterSpacing: 1,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              '$_currencySymbol${_currentBalance.toStringAsFixed(2)}',
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 40,
                                fontWeight: FontWeight.bold,
                                shadows: [
                                  BoxShadow(
                                    color: Colors.orange,
                                    blurRadius: 20,
                                    spreadRadius: 1,
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),

                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.all(20.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Sección Banco (Dropdown)
                          const Text(
                            'BANCO / BILLETERA',
                            style: TextStyle(
                              color: Colors.white54,
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 1.5,
                            ),
                          ),
                          const SizedBox(height: 16),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 16),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.05),
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(
                                color: Colors.white.withOpacity(0.1),
                              ),
                            ),
                            child: DropdownButtonHideUnderline(
                              child: DropdownButton<dynamic>(
                                value: _selectedAccount,
                                hint: const Text(
                                  'Selecciona destino',
                                  style: TextStyle(color: Colors.white60),
                                ),
                                dropdownColor: const Color(0xFF1a1a1a),
                                isExpanded: true,
                                icon: const Icon(
                                  Icons.arrow_drop_down,
                                  color: Colors.orange,
                                ),
                                items: _verifiedAccounts.map((account) {
                                  return DropdownMenuItem<dynamic>(
                                    value: account,
                                    child: Row(
                                      children: [
                                        const Icon(
                                          Icons.account_balance,
                                          color: Colors.white,
                                          size: 20,
                                        ),
                                        const SizedBox(width: 12),
                                        Expanded(
                                          child: Text(
                                            '${account['billetera']} - ${account['numero_cuenta']}',
                                            style: const TextStyle(
                                              color: Colors.white,
                                            ),
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                        ),
                                      ],
                                    ),
                                  );
                                }).toList(),
                                onChanged: (value) {
                                  setState(() => _selectedAccount = value);
                                  HapticFeedback.selectionClick();
                                },
                              ),
                            ),
                          ),

                          const SizedBox(height: 32),

                          // Sección Monto
                          const Text(
                            'MONTO A RETIRAR',
                            style: TextStyle(
                              color: Colors.white54,
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 1.5,
                            ),
                          ),
                          const SizedBox(height: 16),
                          AmountInput(
                            controller: _amountController,
                            minAmount: 10,
                            maxAmount: 15000,
                            quickAmounts: const [50, 100, 200, 500],
                            currencySymbol: _currencySymbol,
                          ),

                          const SizedBox(height: 32),

                          // Sección Datos Bancarios
                          if (_selectedAccount != null) ...[
                            const SizedBox(height: 32),

                            // Botón Retirar
                            Container(
                              width: double.infinity,
                              height: 60,
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(16),
                                gradient: LinearGradient(
                                  colors: _isProcessing
                                      ? [Colors.grey, Colors.grey.shade700]
                                      : [Colors.orange, Colors.deepOrange],
                                ),
                                boxShadow: [
                                  BoxShadow(
                                    color: _isProcessing
                                        ? Colors.transparent
                                        : Colors.orange.withOpacity(0.4),
                                    blurRadius: 20,
                                    offset: const Offset(0, 8),
                                  ),
                                ],
                              ),
                              child: ElevatedButton(
                                onPressed: _isProcessing
                                    ? null
                                    : _processWithdrawal,
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.transparent,
                                  shadowColor: Colors.transparent,
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(16),
                                  ),
                                ),
                                child: _isProcessing
                                    ? const CircularProgressIndicator(
                                        color: Colors.white,
                                      )
                                    : const Row(
                                        mainAxisAlignment:
                                            MainAxisAlignment.center,
                                        children: [
                                          Icon(
                                            Icons.account_balance_wallet,
                                            size: 28,
                                            color: Colors.white,
                                          ),
                                          SizedBox(width: 12),
                                          Text(
                                            'SOLICITAR RETIRO',
                                            style: TextStyle(
                                              color: Colors.white,
                                              fontSize: 18,
                                              fontWeight: FontWeight.w900,
                                              letterSpacing: 1,
                                            ),
                                          ),
                                        ],
                                      ),
                              ),
                            ),
                            const SizedBox(height: 40),
                          ],
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
    );
  }
}
