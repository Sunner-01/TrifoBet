import 'dart:async';
import 'package:flutter/foundation.dart';
import '../models/transaction_model.dart';
import '../models/payment_method_model.dart';
import 'transaction_service.dart';
import 'notification_service.dart';

class PendingTransactionsService {
  static final PendingTransactionsService _instance =
      PendingTransactionsService._();
  factory PendingTransactionsService() => _instance;
  PendingTransactionsService._();

  final ValueNotifier<List<TransactionModel>> pendingTransactions =
      ValueNotifier([]);

  final StreamController<void> _transactionCompletedController =
      StreamController<void>.broadcast();
  Stream<void> get onTransactionCompleted =>
      _transactionCompletedController.stream;

  void addPendingWithdrawal({
    required double amount,
    required PaymentMethodModel paymentMethod,
    required Map<String, dynamic> paymentData,
  }) {
    // Crear transacción temporal simulada
    final tempTransaction = TransactionModel(
      id: DateTime.now().millisecondsSinceEpoch, // ID temporal único
      type: 'retiro',
      amount: amount,
      status: 'pendiente',
      createdAt: DateTime.now(),
      paymentMethod: paymentMethod,
      financialEntity: paymentMethod.financialEntity,
      paymentData: paymentData,
    );

    // Agregar a la lista local
    final currentList = List<TransactionModel>.from(pendingTransactions.value);
    currentList.insert(0, tempTransaction);
    pendingTransactions.value = currentList;

    // Iniciar timer de 30 segundos
    Timer(const Duration(seconds: 30), () async {
      await _processTransaction(tempTransaction, paymentData);
    });
  }

  Future<void> _processTransaction(
    TransactionModel tempTransaction,
    Map<String, dynamic> paymentData,
  ) async {
    try {
      // Llamar al backend real
      await TransactionService.createWithdrawal(
        amount: tempTransaction.amount,
        financialEntityId: tempTransaction.financialEntity!.id!,
        paymentMethodId: tempTransaction.paymentMethod!.id!,
        paymentData: paymentData,
      );

      // Éxito: Mostrar notificación
      await NotificationService().showNotification(
        title: 'Retiro Aprobado',
        body:
            'El monto de \$${tempTransaction.amount.toStringAsFixed(2)} ha sido abonado a tu cuenta.',
      );

      // Remover de la lista de pendientes locales (ya aparecerá en el historial real)
      _removeTransaction(tempTransaction.id);

      // Notificar que se completó una transacción para actualizar historial
      _transactionCompletedController.add(null);
    } catch (e) {
      debugPrint('Error procesando retiro en background: $e');
      // En caso de error, podríamos actualizar el estado a rechazado o reintentar
      // Por ahora, lo removemos para evitar inconsistencias
      _removeTransaction(tempTransaction.id);

      await NotificationService().showNotification(
        title: 'Error en Retiro',
        body: 'No se pudo procesar tu retiro. Por favor intenta nuevamente.',
      );
    }
  }

  void _removeTransaction(int id) {
    final currentList = List<TransactionModel>.from(pendingTransactions.value);
    currentList.removeWhere((t) => t.id == id);
    pendingTransactions.value = currentList;
  }
}
