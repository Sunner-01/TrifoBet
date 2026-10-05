import 'package:flutter/material.dart';
import '../constants.dart';

/// Header profesional del cupón con estadísticas
class BetSlipHeader extends StatelessWidget {
  final int selectionsCount;
  final double totalOdds;
  final double potentialWin;
  final double stake;
  final VoidCallback onClose;
  final VoidCallback? onClear;

  const BetSlipHeader({
    super.key,
    required this.selectionsCount,
    required this.totalOdds,
    required this.potentialWin,
    required this.stake,
    required this.onClose,
    this.onClear,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [SportsConstants.darkGreen, SportsConstants.primaryBlack],
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.3),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: [
          // Handle bar
          Container(
            margin: const EdgeInsets.only(top: 12, bottom: 8),
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: SportsConstants.textTertiary,
              borderRadius: BorderRadius.circular(2),
            ),
          ),

          // Header principal
          Padding(
            padding: const EdgeInsets.symmetric(
              horizontal: SportsConstants.paddingLarge,
              vertical: 12,
            ),
            child: Row(
              children: [
                // Ícono y título
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: SportsConstants.primaryGold.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(
                    Icons.receipt_long,
                    color: SportsConstants.primaryGold,
                    size: 24,
                  ),
                ),
                const SizedBox(width: 12),

                // Título y contador
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Cupón de Apuestas',
                        style: SportsConstants.titleStyle.copyWith(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      if (selectionsCount > 0)
                        Text(
                          '$selectionsCount ${selectionsCount == 1 ? "selección" : "selecciones"}',
                          style: SportsConstants.captionStyle.copyWith(
                            color: SportsConstants.primaryGold,
                          ),
                        ),
                    ],
                  ),
                ),

                // Botón limpiar
                if (onClear != null && selectionsCount > 0)
                  IconButton(
                    onPressed: onClear,
                    icon: const Icon(Icons.delete_outline),
                    color: SportsConstants.textSecondary,
                    tooltip: 'Limpiar todo',
                  ),

                // Botón cerrar
                IconButton(
                  onPressed: onClose,
                  icon: const Icon(Icons.close),
                  color: SportsConstants.textPrimary,
                  tooltip: 'Cerrar',
                ),
              ],
            ),
          ),

          // Stats bar
          if (selectionsCount > 0)
            Container(
              margin: const EdgeInsets.only(
                left: SportsConstants.paddingLarge,
                right: SportsConstants.paddingLarge,
                bottom: 12,
              ),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: SportsConstants.cardBackground.withOpacity(0.5),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(
                  color: SportsConstants.primaryGold.withOpacity(0.3),
                ),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _StatItem(
                    label: 'Cuota Total',
                    value: totalOdds.toStringAsFixed(2),
                    icon: Icons.trending_up,
                  ),
                  Container(
                    width: 1,
                    height: 30,
                    color: SportsConstants.textTertiary.withOpacity(0.3),
                  ),
                  _StatItem(
                    label: 'Apuesta',
                    value: '\Bs${stake.toStringAsFixed(0)}',
                    icon: Icons.monetization_on_outlined,
                  ),
                  Container(
                    width: 1,
                    height: 30,
                    color: SportsConstants.textTertiary.withOpacity(0.3),
                  ),
                  _StatItem(
                    label: 'Ganancia',
                    value: '\Bs${potentialWin.toStringAsFixed(0)}',
                    icon: Icons.account_balance_wallet_outlined,
                    valueColor: SportsConstants.lightGreen,
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}

class _StatItem extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final Color? valueColor;

  const _StatItem({
    required this.label,
    required this.value,
    required this.icon,
    this.valueColor,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 16, color: SportsConstants.primaryGold),
        const SizedBox(height: 4),
        Text(
          label,
          style: TextStyle(fontSize: 10, color: SportsConstants.textSecondary),
        ),
        const SizedBox(height: 2),
        Text(
          value,
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.bold,
            color: valueColor ?? SportsConstants.textPrimary,
          ),
        ),
      ],
    );
  }
}
