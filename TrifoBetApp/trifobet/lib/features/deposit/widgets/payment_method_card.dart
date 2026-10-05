import 'package:flutter/material.dart';
import '../models/payment_method_model.dart';

class PaymentMethodCard extends StatelessWidget {
  final PaymentMethodModel method;
  final bool isSelected;
  final VoidCallback onTap;

  const PaymentMethodCard({
    super.key,
    required this.method,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    // Determinar colores según el tipo
    final isQR = method.type.toLowerCase().contains('qr');
    final isBank = method.type.toLowerCase().contains('transferencia');

    final List<Color> gradientColors = isSelected
        ? (isQR
              ? [const Color(0xFF00FF88), const Color(0xFF00CC6A)] // Verde neón
              : [
                  const Color(0xFF448AFF),
                  const Color(0xFF2962FF),
                ]) // Azul eléctrico
        : [const Color(0xFF2A2A2A), const Color(0xFF1F1F1F)]; // Gris oscuro

    final Color iconColor = isSelected
        ? Colors.black
        : (isQR ? const Color(0xFF00FF88) : const Color(0xFF448AFF));

    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: gradientColors,
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSelected
                ? Colors.white.withOpacity(0.5)
                : Colors.white.withOpacity(0.1),
            width: isSelected ? 2 : 1,
          ),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: gradientColors.first.withOpacity(0.4),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  ),
                ]
              : [],
        ),
        child: Row(
          children: [
            // Icono Container
            Container(
              width: 50,
              height: 50,
              decoration: BoxDecoration(
                color: isSelected
                    ? Colors.white.withOpacity(0.2)
                    : Colors.black26,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Center(
                child: method.icon != null && method.icon!.isNotEmpty
                    ? Text(
                        method.icon!,
                        style: TextStyle(fontSize: 24, color: iconColor),
                      )
                    : Icon(
                        isQR
                            ? Icons.qr_code
                            : (isBank
                                  ? Icons.account_balance
                                  : Icons.credit_card),
                        color: iconColor,
                        size: 24,
                      ),
              ),
            ),
            const SizedBox(width: 16),

            // Texto
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    method.name,
                    style: TextStyle(
                      color: isSelected ? Colors.black : Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  if (method.financialEntity != null)
                    Text(
                      method.financialEntity!.name,
                      style: TextStyle(
                        color: isSelected
                            ? Colors.black.withOpacity(0.7)
                            : Colors.white60,
                        fontSize: 12,
                      ),
                    ),
                ],
              ),
            ),

            // Radio Indicator
            Container(
              width: 24,
              height: 24,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(
                  color: isSelected ? Colors.black : Colors.white54,
                  width: 2,
                ),
                color: isSelected ? Colors.black : Colors.transparent,
              ),
              child: isSelected
                  ? const Center(
                      child: Icon(Icons.check, size: 16, color: Colors.white),
                    )
                  : null,
            ),
          ],
        ),
      ),
    );
  }
}
