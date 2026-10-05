import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:audioplayers/audioplayers.dart';
import '../models/payment_method_model.dart';
import '../services/transaction_service.dart';
import '../widgets/biometric_dialog.dart';
import '../widgets/amount_chip.dart';
import '../../../shared/utils/currency_helper.dart';

class DepositScreen extends StatefulWidget {
  const DepositScreen({super.key});

  @override
  State<DepositScreen> createState() => _DepositScreenState();
}

class _DepositScreenState extends State<DepositScreen> {
  List<PaymentMethodModel> _paymentMethods = [];
  PaymentMethodModel? _selectedMethod;
  final TextEditingController _amountController = TextEditingController();
  final TextEditingController _operationController = TextEditingController();
  double _currentBalance = 0;
  bool _isLoading = true;
  bool _isProcessing = false;
  final AudioPlayer _audioPlayer = AudioPlayer();
  String _currencySymbol = '\Bs';

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  @override
  void dispose() {
    _amountController.dispose();
    _operationController.dispose();
    _audioPlayer.dispose();
    super.dispose();
  }

  Future<void> _loadData() async {
    try {
      final methods = await TransactionService.getPaymentMethods();
      final balance = await TransactionService.getCurrentBalance();
      final symbol = await CurrencyHelper.getUserCurrencySymbol();

      setState(() {
        _paymentMethods = methods.where((m) => m.enabled).toList();
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

  Future<void> _refreshBalance() async {
    try {
      final balance = await TransactionService.getCurrentBalance();
      setState(() => _currentBalance = balance);
    } catch (e) {
      debugPrint('Error refreshing balance: $e');
    }
  }

  Future<void> _processDeposit() async {
    // Ocultar teclado para evitar problemas de UI
    FocusScope.of(context).unfocus();

    // Validaciones
    final amount = double.tryParse(_amountController.text) ?? 0;
    if (_selectedMethod == null) {
      _showError('Selecciona un método de pago');
      return;
    }
    if (amount < 15) {
      _showError('El monto mínimo es \Bs15');
      return;
    }
    if (amount > 5000) {
      _showError('El monto máximo es \Bs5000');
      return;
    }

    // Autenticación biométrica
    final authenticated = await BiometricDialog.showBiometricPrompt(context);
    if (!authenticated) {
      _showError('Autenticación cancelada');
      return;
    }

    // Procesar depósito
    setState(() => _isProcessing = true);
    try {
      await TransactionService.createDeposit(
        amount: amount,
        financialEntityId: _selectedMethod!.financialEntity!.id!,
        paymentMethodId: _selectedMethod!.id!,
        operationNumber: _operationController.text.isNotEmpty
            ? _operationController.text
            : null,
      );

      // Sonido de éxito
      try {
        await _audioPlayer.play(AssetSource('sounds/success.mp3'));
      } catch (e) {
        debugPrint('Error playing sound: $e');
      }

      // Actualizar balance inmediatamente (backend aprueba instantáneo)
      await _refreshBalance();

      if (mounted) {
        // Mostrar success dialog
        await _showSuccessDialog(amount);

        // Limpiar formulario
        _amountController.clear();
        _operationController.clear();
        setState(() => _selectedMethod = null);
      }
    } catch (e) {
      _showError('Error al procesar: $e');
    } finally {
      setState(() => _isProcessing = false);
    }
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

  Future<void> _showSuccessDialog(double amount) async {
    HapticFeedback.heavyImpact();
    return showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => Dialog(
        backgroundColor: Colors.transparent,
        child: Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFF00e676), Color(0xFF00c853)],
            ),
            borderRadius: BorderRadius.circular(20),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFF00e676).withOpacity(0.4),
                blurRadius: 20,
                spreadRadius: 5,
              ),
            ],
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.check_circle, size: 80, color: Colors.white),
              const SizedBox(height: 16),
              const Text(
                '¡Depósito Aprobado!',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 12),
              Text(
                '+\Bs${amount.toStringAsFixed(2)}',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 32,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 24),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Column(
                  children: [
                    Text(
                      'Tu saldo ha sido actualizado correctamente.',
                      style: TextStyle(color: Colors.white, fontSize: 14),
                      textAlign: TextAlign.center,
                    ),
                  ],
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
                    'Continuar',
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
                              const Color(0xFF00e676).withOpacity(0.15),
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
                                    color: Color(0xFF00e676),
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
                          // Sección Métodos de Pago (Dropdown)
                          const Text(
                            'MÉTODO DE PAGO',
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
                              child: DropdownButton<PaymentMethodModel>(
                                value: _selectedMethod,
                                hint: const Text(
                                  'Selecciona un método',
                                  style: TextStyle(color: Colors.white60),
                                ),
                                dropdownColor: const Color(0xFF1a1a1a),
                                isExpanded: true,
                                icon: const Icon(
                                  Icons.arrow_drop_down,
                                  color: Color(0xFF00e676),
                                ),
                                items: _paymentMethods.map((method) {
                                  return DropdownMenuItem(
                                    value: method,
                                    child: Row(
                                      children: [
                                        if (method.icon != null &&
                                            method.icon!.isNotEmpty)
                                          Text(
                                            method.icon!,
                                            style: const TextStyle(
                                              fontSize: 20,
                                            ),
                                          )
                                        else
                                          const Icon(
                                            Icons.payment,
                                            color: Colors.white,
                                            size: 20,
                                          ),
                                        const SizedBox(width: 12),
                                        Expanded(
                                          child: Text(
                                            method.name,
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
                                  setState(() => _selectedMethod = value);
                                  HapticFeedback.selectionClick();
                                },
                              ),
                            ),
                          ),

                          const SizedBox(height: 24),
                          
                          if (_selectedMethod != null) _buildPaymentInstructions(),

                          const SizedBox(height: 24),

                          // Sección Monto
                          if (_selectedMethod != null) ...[
                            const Text(
                              'SELECCIONAR MONTO',
                              style: TextStyle(
                                color: Colors.white54,
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                                letterSpacing: 1.5,
                              ),
                            ),
                            const SizedBox(height: 16),

                            // Chips de monto
                            Wrap(
                              spacing: 12,
                              runSpacing: 12,
                              children: [15, 25, 50, 100, 200, 1000].map((
                                amount,
                              ) {
                                final isSelected =
                                    _amountController.text == amount.toString();
                                return AmountChip(
                                  amount: amount.toDouble(),
                                  isSelected: isSelected,
                                  onTap: () {
                                    setState(() {
                                      _amountController.text = amount
                                          .toString();
                                    });
                                    HapticFeedback.selectionClick();
                                  },
                                );
                              }).toList(),
                            ),

                            const SizedBox(height: 24),

                            // Input manual
                            TextField(
                              controller: _amountController,
                              keyboardType: TextInputType.number,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 24,
                                fontWeight: FontWeight.bold,
                              ),
                              decoration: InputDecoration(
                                labelText: 'Otro monto',
                                labelStyle: const TextStyle(
                                  color: Colors.white60,
                                ),
                                prefixText: 'Bs ',
                                prefixStyle: const TextStyle(
                                  color: Color(0xFF00e676),
                                  fontSize: 24,
                                  fontWeight: FontWeight.bold,
                                ),
                                filled: true,
                                fillColor: Colors.white.withOpacity(0.05),
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(16),
                                  borderSide: BorderSide.none,
                                ),
                                focusedBorder: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(16),
                                  borderSide: const BorderSide(
                                    color: Color(0xFF00e676),
                                    width: 2,
                                  ),
                                ),
                              ),
                            ),

                            const SizedBox(height: 24),

                            // Número de operación
                            TextField(
                              controller: _operationController,
                              style: const TextStyle(color: Colors.white),
                              decoration: InputDecoration(
                                labelText: 'Número de operación (Opcional)',
                                labelStyle: const TextStyle(
                                  color: Colors.white60,
                                ),
                                prefixIcon: const Icon(
                                  Icons.receipt_long,
                                  color: Colors.white60,
                                ),
                                filled: true,
                                fillColor: Colors.white.withOpacity(0.05),
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(16),
                                  borderSide: BorderSide.none,
                                ),
                                focusedBorder: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(16),
                                  borderSide: const BorderSide(
                                    color: Color(0xFF00e676),
                                    width: 2,
                                  ),
                                ),
                              ),
                            ),

                            const SizedBox(height: 32),

                            // Botón Depositar
                            Container(
                              width: double.infinity,
                              height: 60,
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(16),
                                gradient: LinearGradient(
                                  colors: _isProcessing
                                      ? [Colors.grey, Colors.grey.shade700]
                                      : [
                                          const Color(0xFF00e676),
                                          const Color(0xFF00c853),
                                        ],
                                ),
                                boxShadow: [
                                  BoxShadow(
                                    color: _isProcessing
                                        ? Colors.transparent
                                        : const Color(
                                            0xFF00e676,
                                          ).withOpacity(0.4),
                                    blurRadius: 20,
                                    offset: const Offset(0, 8),
                                  ),
                                ],
                              ),
                              child: ElevatedButton(
                                onPressed: _isProcessing
                                    ? null
                                    : _processDeposit,
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
                                            Icons.fingerprint,
                                            size: 28,
                                            color: Colors.black,
                                          ),
                                          SizedBox(width: 12),
                                          Text(
                                            'CONFIRMAR DEPÓSITO',
                                            style: TextStyle(
                                              color: Colors.black,
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

  Widget _buildPaymentInstructions() {
    final method = _selectedMethod!;
    
    if (method.type == 'qr') {
      return Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.green.withOpacity(0.05),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.green.withOpacity(0.2)),
        ),
        child: Column(
          children: [
            const Text(
              'Escanea este código QR desde tu aplicación bancaria',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Icon(Icons.qr_code_2, size: 150, color: Colors.black),
            ),
            const SizedBox(height: 12),
            const Text(
              'Una vez realizado el pago, ingresa el Número de Operación debajo.',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.white70, fontSize: 12),
            ),
          ],
        ),
      );
    } else if (method.type == 'transferencia') {
      return Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.blueAccent.withOpacity(0.05),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.blueAccent.withOpacity(0.2)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Datos para la transferencia',
              style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            _buildDataRow('Banco:', 'Banco FIE'),
            const SizedBox(height: 8),
            _buildDataRow('Titular:', 'TrifoBet S.A.'),
            const SizedBox(height: 8),
            _buildDataRow('Nro. de Cuenta:', '4001234567'),
            const SizedBox(height: 12),
            const Text(
              'Por favor, verifica que el titular coincida antes de transferir.',
              style: TextStyle(color: Colors.orangeAccent, fontSize: 11),
            ),
          ],
        ),
      );
    }
    
    return const SizedBox.shrink();
  }

  Widget _buildDataRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(color: Colors.white54, fontSize: 13)),
        Text(value, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
      ],
    );
  }
}
