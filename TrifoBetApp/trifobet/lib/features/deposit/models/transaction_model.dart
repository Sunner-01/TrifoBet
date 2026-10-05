import 'payment_method_model.dart';
import 'financial_entity_model.dart';

class TransactionModel {
  final int id;
  final String type; // 'deposito' o 'retiro'
  final double amount;
  final String status; // 'pendiente', 'aprobado', 'completado', 'rechazado'
  final DateTime createdAt;
  final DateTime? processedAt;
  final String? operationNumber;
  final Map<String, dynamic>? paymentData;
  final FinancialEntityModel? financialEntity;
  final PaymentMethodModel? paymentMethod;

  TransactionModel({
    required this.id,
    required this.type,
    required this.amount,
    required this.status,
    required this.createdAt,
    this.processedAt,
    this.operationNumber,
    this.paymentData,
    this.financialEntity,
    this.paymentMethod,
  });

  factory TransactionModel.fromJson(Map<String, dynamic> json) {
    return TransactionModel(
      id: json['id'],
      type: json['tipo'],
      amount: (json['monto'] as num).toDouble(),
      status: json['estado'],
      createdAt: DateTime.parse(json['fechaCreacion']),
      processedAt: json['fechaProcesado'] != null
          ? DateTime.parse(json['fechaProcesado'])
          : null,
      operationNumber: json['numeroOperacion'],
      paymentData: json['datosPago'],
      financialEntity: json['entidadFinanciera'] != null
          ? FinancialEntityModel.fromJson(json['entidadFinanciera'])
          : null,
      paymentMethod: json['metodoPago'] != null
          ? PaymentMethodModel.fromJson(json['metodoPago'])
          : null,
    );
  }

  bool get isDeposit => type == 'deposito';
  bool get isWithdrawal => type == 'retiro';
  bool get isPending => status == 'pendiente';
  bool get isCompleted => status == 'completado';
  bool get isRejected => status == 'rechazado';

  String get statusLabel {
    switch (status) {
      case 'pendiente':
        return 'Pendiente';
      case 'aprobado':
        return 'Aprobado';
      case 'completado':
        return 'Completado';
      case 'rechazado':
        return 'Rechazado';
      default:
        return 'Desconocido';
    }
  }
}
