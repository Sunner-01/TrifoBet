import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../models/bet_slip_item.dart';
import '../services/bet_slip_service.dart';

/// Botón de cuota reutilizable para mercados de apuestas
class MarketOddsButton extends StatelessWidget {
  final String eventId;
  final String marketId;
  final String optionId;
  final String label;
  final double odds;
  final BetSlipItem betSlipItem;

  const MarketOddsButton({
    super.key,
    required this.eventId,
    required this.marketId,
    required this.optionId,
    required this.label,
    required this.odds,
    required this.betSlipItem,
  });

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: BetSlipService(),
      builder: (context, _) {
        final betSlip = BetSlipService();
        final isSelected = betSlip.hasItem(betSlipItem.id);

        return Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: () {
              // Feedback háptico
              HapticFeedback.lightImpact();
              betSlip.toggleItem(betSlipItem);
            },
            borderRadius: BorderRadius.circular(4),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 150),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: isSelected
                    ? const Color(0xFF00e676)
                    : const Color(0xFF2C2C2C),
                borderRadius: BorderRadius.circular(4),
                border: Border.all(
                  color: isSelected
                      ? const Color(0xFF00e676)
                      : Colors.transparent,
                ),
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                mainAxisSize: MainAxisSize.min, // Cambiado de max a min
                children: [
                  Flexible(
                    child: Text(
                      label,
                      style: TextStyle(
                        color: isSelected ? Colors.black : Colors.white54,
                        fontSize:
                            10, // Reducido de 12 a 10 para evitar overflow
                        fontWeight: isSelected
                            ? FontWeight.bold
                            : FontWeight.normal,
                      ),
                      textAlign: TextAlign.center,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    odds.toStringAsFixed(2),
                    style: TextStyle(
                      color: isSelected ? Colors.black : Colors.white,
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}
