import 'financial_entity_model.dart';

class PaymentMethodModel {
  final int? id; // Nullable porque el backend no siempre lo envía (historial)
  final String type; // 'qr', 'transferencia', 'tarjeta'
  final String name;
  final String? icon;
  final bool requiresAdditionalData;
  final String? description;
  final bool enabled;
  final FinancialEntityModel? financialEntity;

  PaymentMethodModel({
    this.id,
    required this.type,
    required this.name,
    this.icon,
    this.requiresAdditionalData = false,
    this.description,
    this.enabled = true,
    this.financialEntity,
  });

  factory PaymentMethodModel.fromJson(Map<String, dynamic> json) {
    return PaymentMethodModel(
      id: json['id'],
      type: json['tipo'],
      name: json['nombre'],
      icon: json['icono'],
      requiresAdditionalData: json['requiereDatosAdicionales'] ?? false,
      description: json['descripcion'],
      enabled: json['habilitado'] ?? true,
      financialEntity: json['entidad_financiera'] != null
          ? FinancialEntityModel.fromJson(json['entidad_financiera'])
          : null,
    );
  }

  bool get isQR => type == 'qr';
  bool get isTransfer => type == 'transferencia';
  bool get isCard => type == 'tarjeta';

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is PaymentMethodModel && other.id == id;
  }

  @override
  int get hashCode => id.hashCode;
}
