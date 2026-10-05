class FinancialEntityModel {
  final int? id; // Nullable porque el backend no siempre lo envía (historial)
  final String name;
  final String code;
  final String type; // 'banco' o 'billetera_digital'
  final String? countryCode;
  final String? logoUrl;

  FinancialEntityModel({
    this.id,
    required this.name,
    required this.code,
    required this.type,
    this.countryCode,
    this.logoUrl,
  });

  factory FinancialEntityModel.fromJson(Map<String, dynamic> json) {
    return FinancialEntityModel(
      id: json['id'],
      name: json['nombre'],
      code: json['codigo'],
      type: json['tipo'] ?? 'banco',
      countryCode: json['pais_codigo'],
      logoUrl: json['logo_url'],
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is FinancialEntityModel && other.id == id;
  }

  @override
  int get hashCode => id.hashCode;
}
