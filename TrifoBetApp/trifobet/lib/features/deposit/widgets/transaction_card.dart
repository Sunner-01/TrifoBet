import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/transaction_model.dart';

/// Card de transacción para el historial
class TransactionCard extends StatelessWidget {
  final TransactionModel transaction;
  final VoidCallback? onTap;
  final String currencySymbol;

  const TransactionCard({
    super.key,
    required this.transaction,
    this.onTap,
    this.currencySymbol = '\$',
  });

  @override
  Widget build(BuildContext context) {
    final formatter = NumberFormat.currency(
      symbol: currencySymbol,
      decimalDigits: 2,
    );
    final dateFormatter = DateFormat('dd/MM/yyyy HH:mm');

    // Colores según estado
    Color statusColor;
    IconData statusIcon;
    switch (transaction.status) {
      case 'pendiente':
        statusColor = Colors.orange;
        statusIcon = Icons.pending;
        break;
      case 'completado':
        statusColor = const Color(0xFF00e676);
        statusIcon = Icons.check_circle;
        break;
      case 'rechazado':
        statusColor = Colors.red;
        statusIcon = Icons.cancel;
        break;
      default:
        statusColor = Colors.grey;
        statusIcon = Icons.help;
    }

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      decoration: BoxDecoration(
        color: const Color(0xFF1a1a1a),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: transaction.isDeposit
              ? const Color(0xFF00e676).withOpacity(0.3)
              : Colors.red.withOpacity(0.3),
          width: 1,
        ),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  // Icono de tipo
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: transaction.isDeposit
                          ? const Color(0xFF00e676).withOpacity(0.2)
                          : Colors.red.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Icon(
                      transaction.isDeposit
                          ? Icons.arrow_downward
                          : Icons.arrow_upward,
                      color: transaction.isDeposit
                          ? const Color(0xFF00e676)
                          : Colors.red,
                      size: 20,
                    ),
                  ),
                  const SizedBox(width: 12),

                  // Información
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          transaction.isDeposit ? 'Depósito' : 'Retiro',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          transaction.financialEntity?.name ?? 'N/A',
                          style: const TextStyle(
                            color: Colors.white60,
                            fontSize: 13,
                          ),
                        ),
                      ],
                    ),
                  ),

                  // Monto
                  Text(
                    '${transaction.isDeposit ? "+" : "-"}${formatter.format(transaction.amount)}',
                    style: TextStyle(
                      color: transaction.isDeposit
                          ? const Color(0xFF00e676)
                          : Colors.red,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 12),

              // Estado y fecha
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Icon(statusIcon, color: statusColor, size: 16),
                      const SizedBox(width: 4),
                      Text(
                        transaction.statusLabel,
                        style: TextStyle(
                          color: statusColor,
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                  Text(
                    dateFormatter.format(transaction.createdAt),
                    style: const TextStyle(color: Colors.white38, fontSize: 12),
                  ),
                ],
              ),

              // Número de operación si existe
              if (transaction.operationNumber != null) ...[
                const SizedBox(height: 8),
                const Divider(color: Colors.white12, height: 1),
                const SizedBox(height: 8),
                Row(
                  children: [
                    const Icon(Icons.receipt, color: Colors.white38, size: 14),
                    const SizedBox(width: 4),
                    Text(
                      'Op: ${transaction.operationNumber}',
                      style: const TextStyle(
                        color: Colors.white38,
                        fontSize: 11,
                      ),
                    ),
                  ],
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
