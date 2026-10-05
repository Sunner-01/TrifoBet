import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'dart:async';
import 'package:intl/intl.dart';
import '../models/transaction_model.dart';
import '../services/transaction_service.dart';
import '../services/pending_transactions_service.dart';
import '../services/transaction_pdf_service.dart';
import '../../auth/services/auth_service.dart';
import '../services/notification_service.dart';
import '../widgets/transaction_timeline_item.dart';
import '../../../shared/utils/currency_helper.dart';

class TransactionHistoryScreen extends StatefulWidget {
  const TransactionHistoryScreen({super.key});

  @override
  State<TransactionHistoryScreen> createState() =>
      _TransactionHistoryScreenState();
}

class _TransactionHistoryScreenState extends State<TransactionHistoryScreen> {
  List<TransactionModel> _allTransactions = [];
  List<TransactionModel> _filteredTransactions = [];
  bool _isLoading = true;
  int _currentPage = 0;
  final int _perPage = 20;
  bool _hasMore = true;
  String _selectedFilter = 'all'; // all, deposit, withdrawal, pending
  String _currencySymbol = 'Bs.';

  StreamSubscription? _completionSubscription;

  @override
  void initState() {
    super.initState();
    _loadTransactions();
    // Escuchar cambios en transacciones pendientes locales
    PendingTransactionsService().pendingTransactions.addListener(
      _onPendingTransactionsChanged,
    );

    // Escuchar cuando una transacción se completa para recargar del API
    _completionSubscription = PendingTransactionsService()
        .onTransactionCompleted
        .listen((_) {
          if (mounted) {
            _loadTransactions(refresh: true);
          }
        });
  }

  @override
  void dispose() {
    PendingTransactionsService().pendingTransactions.removeListener(
      _onPendingTransactionsChanged,
    );
    _completionSubscription?.cancel();
    super.dispose();
  }

  void _onPendingTransactionsChanged() {
    if (mounted) {
      _applyFilter();
    }
  }

  Future<void> _loadTransactions({bool refresh = false}) async {
    if (refresh) {
      setState(() {
        _currentPage = 0;
        _hasMore = true;
        _isLoading = true;
      });
    }

    try {
      final result = await TransactionService.getHistory(
        limit: _perPage,
        offset: _currentPage * _perPage,
      );
      final symbol = await CurrencyHelper.getUserCurrencySymbol();

      if (!mounted) return;

      final transactions = result['transactions'] as List<TransactionModel>;

      setState(() {
        if (refresh) {
          _allTransactions = transactions;
        } else {
          _allTransactions.addAll(transactions);
        }

        _applyFilter();
        _hasMore = transactions.length >= _perPage;
        _isLoading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() => _isLoading = false);
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Error: $e')));
    }
  }

  void _applyFilter() {
    setState(() {
      // Obtener pendientes locales
      final localPending =
          PendingTransactionsService().pendingTransactions.value;

      // Combinar con las del API (evitando duplicados si ya llegaron al API)
      // Nota: En este caso simple, asumimos que si está en localPending no está en API aún
      // o si está, el local tiene prioridad visual hasta que se limpie.

      final combinedTransactions = [...localPending, ..._allTransactions];

      switch (_selectedFilter) {
        case 'deposit':
          _filteredTransactions = combinedTransactions
              .where((t) => t.isDeposit)
              .toList();
          break;
        case 'withdrawal':
          _filteredTransactions = combinedTransactions
              .where((t) => t.isWithdrawal)
              .toList();
          break;
        case 'pending':
          _filteredTransactions = combinedTransactions
              .where((t) => t.status == 'pendiente')
              .toList();
          break;
        default:
          _filteredTransactions = List.from(combinedTransactions);
      }
    });
  }

  Future<void> _loadMore() async {
    if (!_hasMore || _isLoading) return;

    setState(() {
      _currentPage++;
    });

    await _loadTransactions();
  }

  Widget _buildFilterChip(String label, String value, IconData icon) {
    final isSelected = _selectedFilter == value;
    return GestureDetector(
      onTap: () {
        setState(() => _selectedFilter = value);
        _applyFilter();
        HapticFeedback.selectionClick();
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected
              ? const Color(0xFF00e676).withOpacity(0.2)
              : Colors.white.withOpacity(0.05),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? const Color(0xFF00e676) : Colors.transparent,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              size: 16,
              color: isSelected ? const Color(0xFF00e676) : Colors.white60,
            ),
            const SizedBox(width: 8),
            Text(
              label,
              style: TextStyle(
                color: isSelected ? const Color(0xFF00e676) : Colors.white60,
                fontWeight: FontWeight.bold,
                fontSize: 12,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTransactionList() {
    if (_isLoading && _allTransactions.isEmpty) {
      return const Center(
        child: CircularProgressIndicator(color: Color(0xFF00e676)),
      );
    }

    if (_filteredTransactions.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.history, size: 80, color: Colors.white.withOpacity(0.1)),
            const SizedBox(height: 16),
            Text(
              'No hay transacciones',
              style: TextStyle(
                color: Colors.white.withOpacity(0.4),
                fontSize: 16,
              ),
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      color: const Color(0xFF00e676),
      onRefresh: () => _loadTransactions(refresh: true),
      child: ListView.builder(
        padding: const EdgeInsets.all(20),
        itemCount: _filteredTransactions.length + (_hasMore ? 1 : 0),
        itemBuilder: (context, index) {
          if (index == _filteredTransactions.length) {
            if (_hasMore) {
              WidgetsBinding.instance.addPostFrameCallback((_) => _loadMore());
              return const Padding(
                padding: EdgeInsets.all(16),
                child: Center(
                  child: CircularProgressIndicator(color: Color(0xFF00e676)),
                ),
              );
            }
            return const SizedBox.shrink();
          }

          final transaction = _filteredTransactions[index];
          final isLast = index == _filteredTransactions.length - 1;

          return TransactionTimelineItem(
            transaction: transaction,
            isLast: isLast,
            onTap: () => _showTransactionDetails(transaction),
            currencySymbol: _currencySymbol,
          );
        },
      ),
    );
  }

  void _showTransactionDetails(TransactionModel transaction) {
    HapticFeedback.lightImpact();
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (context) => Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: const Color(0xFF1a1a1a),
          borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
          border: Border.all(color: Colors.white.withOpacity(0.1)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.white24,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      transaction.isDeposit ? 'Depósito' : 'Retiro',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      DateFormat(
                        'dd MMM yyyy, HH:mm',
                      ).format(transaction.createdAt),
                      style: const TextStyle(
                        color: Colors.white54,
                        fontSize: 14,
                      ),
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: transaction.isDeposit
                        ? const Color(0xFF00e676).withOpacity(0.1)
                        : Colors.orange.withOpacity(0.1),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    transaction.isDeposit
                        ? Icons.arrow_downward
                        : Icons.arrow_upward,
                    color: transaction.isDeposit
                        ? const Color(0xFF00e676)
                        : Colors.orange,
                    size: 24,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 32),
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.05),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                children: [
                  _buildDetailRow(
                    'Monto',
                    '\$_currencySymbol${transaction.amount.toStringAsFixed(2)}',
                    valueColor: transaction.isDeposit
                        ? const Color(0xFF00e676)
                        : Colors.orange,
                    isBold: true,
                    valueSize: 20,
                  ),
                  const Divider(color: Colors.white10, height: 24),
                  _buildDetailRow('ID Transacción', '#${transaction.id}'),
                  const SizedBox(height: 12),
                  _buildDetailRow(
                    'Estado',
                    transaction.statusLabel,
                    valueColor: _getStatusColor(transaction.status),
                  ),
                  const SizedBox(height: 12),
                  if (transaction.financialEntity != null)
                    _buildDetailRow(
                      'Método',
                      transaction.financialEntity!.name,
                    ),
                  if (transaction.operationNumber != null) ...[
                    const SizedBox(height: 12),
                    _buildDetailRow(
                      'Nº Operación',
                      transaction.operationNumber!,
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 32),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () => Navigator.pop(context),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.white,
                  foregroundColor: Colors.black,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
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
    );
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'completado':
      case 'aprobado':
        return const Color(0xFF00e676);
      case 'pendiente':
        return Colors.orange;
      case 'rechazado':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  Widget _buildDetailRow(
    String label,
    String value, {
    Color? valueColor,
    bool isBold = false,
    double valueSize = 14,
  }) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: const TextStyle(color: Colors.white60, fontSize: 14),
        ),
        Text(
          value,
          style: TextStyle(
            color: valueColor ?? Colors.white,
            fontSize: valueSize,
            fontWeight: isBold ? FontWeight.bold : FontWeight.w500,
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0a0a0a),
      appBar: AppBar(
        title: const Text(
          'Historial',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        backgroundColor: const Color(0xFF1a1a1a),
        elevation: 0,
        centerTitle: false,
      ),
      body: Column(
        children: [
          // Filters
          Container(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 16),
            color: const Color(0xFF1a1a1a),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  _buildFilterChip('Todos', 'all', Icons.all_inclusive),
                  const SizedBox(width: 12),
                  _buildFilterChip(
                    'Depósitos',
                    'deposit',
                    Icons.arrow_downward,
                  ),
                  const SizedBox(width: 12),
                  _buildFilterChip('Retiros', 'withdrawal', Icons.arrow_upward),
                  const SizedBox(width: 12),
                  _buildFilterChip('Pendientes', 'pending', Icons.access_time),
                ],
              ),
            ),
          ),

          // Timeline
          Expanded(child: _buildTransactionList()),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _exportPdf,
        backgroundColor: const Color(0xFF00e676),
        child: const Icon(Icons.picture_as_pdf, color: Colors.black),
      ),
    );
  }

  Future<void> _exportPdf() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF1a1a1a),
        title: const Text(
          'Exportar Historial',
          style: TextStyle(color: Colors.white),
        ),
        content: const Text(
          '¿Deseas descargar el historial de transacciones en PDF?',
          style: TextStyle(color: Colors.white70),
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
            child: const Text('Descargar'),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      if (!mounted) return;

      // Mostrar indicador de carga
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Generando PDF...'),
          duration: Duration(seconds: 1),
        ),
      );

      try {
        // Obtener datos del usuario
        final user = await AuthService.getUser();
        final userName = user != null
            ? '${user['nombre']} ${user['apellido1']}'
            : 'Usuario';

        // Usar las transacciones filtradas actuales
        final path = await TransactionPdfService.generateAndDownloadPdf(
          _filteredTransactions,
          userName: userName,
          currencySymbol: _currencySymbol,
        );

        if (!mounted) return;

        if (path.isNotEmpty) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('PDF guardado en: $path'),
              backgroundColor: Colors.green,
              duration: const Duration(seconds: 4),
            ),
          );

          // Mostrar notificación push
          await NotificationService().showNotification(
            title: 'Historial Exportado',
            body: 'Archivo guardado correctamente en: $path',
          );
        }
      } catch (e) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error al generar PDF: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }
}
