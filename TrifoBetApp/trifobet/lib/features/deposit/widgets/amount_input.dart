import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';

/// Input de monto con quick amounts
class AmountInput extends StatelessWidget {
  final TextEditingController controller;
  final double minAmount;
  final double maxAmount;
  final List<double> quickAmounts;
  final ValueChanged<double>? onAmountSelected;

  const AmountInput({
    super.key,
    required this.controller,
    required this.minAmount,
    required this.maxAmount,
    this.quickAmounts = const [50, 100, 200, 500, 1000],
    this.onAmountSelected,
    this.currencySymbol = '\Bs',
  });

  final String currencySymbol;

  @override
  Widget build(BuildContext context) {
    final formatter = NumberFormat.currency(
      symbol: currencySymbol,
      decimalDigits: 0,
    );

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Quick amounts
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: quickAmounts.map((amount) {
            return ElevatedButton(
              onPressed: () {
                controller.text = amount.toStringAsFixed(2);
                onAmountSelected?.call(amount);
                HapticFeedback.lightImpact();
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF1a1a1a),
                foregroundColor: const Color(0xFF00e676),
                side: const BorderSide(color: Color(0xFF00e676), width: 1),
                padding: const EdgeInsets.symmetric(
                  horizontal: 20,
                  vertical: 12,
                ),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              child: Text(
                formatter.format(amount),
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                ),
              ),
            );
          }).toList(),
        ),

        const SizedBox(height: 16),

        // Input field
        TextField(
          controller: controller,
          keyboardType: const TextInputType.numberWithOptions(decimal: true),
          style: const TextStyle(
            color: Colors.white,
            fontSize: 24,
            fontWeight: FontWeight.bold,
          ),
          decoration: InputDecoration(
            labelText: 'Monto',
            labelStyle: const TextStyle(color: Colors.white60),
            prefixIcon: const Icon(
              Icons.attach_money,
              color: Color(0xFF00e676),
            ),
            hintText: '0.00',
            hintStyle: const TextStyle(color: Colors.white30),
            filled: true,
            fillColor: const Color(0xFF1a1a1a),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: Color(0xFF00e676)),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: Colors.white24),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: Color(0xFF00e676), width: 2),
            ),
          ),
          inputFormatters: [
            FilteringTextInputFormatter.allow(RegExp(r'^\d+\.?\d{0,2}')),
          ],
        ),

        const SizedBox(height: 8),

        // Min/Max info
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 4),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Mín: ${formatter.format(minAmount)}',
                style: const TextStyle(color: Colors.white38, fontSize: 12),
              ),
              Text(
                'Máx: ${formatter.format(maxAmount)}',
                style: const TextStyle(color: Colors.white38, fontSize: 12),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
