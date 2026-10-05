import 'package:flutter/material.dart';
import '../constants.dart';
import '../models/bet_type.dart';

/// Widget selector para cambiar entre tipos de apuesta
class BetTypeSelector extends StatelessWidget {
  final BetType selectedType;
  final ValueChanged<BetType> onTypeChanged;
  final int selectionsCount;

  const BetTypeSelector({
    super.key,
    required this.selectedType,
    required this.onTypeChanged,
    required this.selectionsCount,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: SportsConstants.paddingMedium,
        vertical: SportsConstants.paddingSmall,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            'Tipo de Apuesta',
            style: SportsConstants.captionStyle.copyWith(
              color: SportsConstants.textSecondary,
            ),
          ),
          const SizedBox(height: 8),
          Row(
            children: BetType.values.map((type) {
              final isSelected = type == selectedType;
              final isEnabled = selectionsCount >= type.minSelections;

              return Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 4),
                  child: _BetTypeChip(
                    type: type,
                    isSelected: isSelected,
                    isEnabled: isEnabled,
                    onTap: isEnabled ? () => onTypeChanged(type) : null,
                  ),
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }
}

class _BetTypeChip extends StatelessWidget {
  final BetType type;
  final bool isSelected;
  final bool isEnabled;
  final VoidCallback? onTap;

  const _BetTypeChip({
    required this.type,
    required this.isSelected,
    required this.isEnabled,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    Color backgroundColor;
    Color textColor;
    Color borderColor;

    if (!isEnabled) {
      backgroundColor = SportsConstants.textTertiary.withOpacity(0.1);
      textColor = SportsConstants.textTertiary;
      borderColor = Colors.transparent;
    } else if (isSelected) {
      backgroundColor = SportsConstants.primaryGreen.withOpacity(0.2);
      textColor = SportsConstants.lightGreen;
      borderColor = SportsConstants.primaryGreen;
    } else {
      backgroundColor = SportsConstants.cardBackground;
      textColor = SportsConstants.textPrimary;
      borderColor = SportsConstants.textTertiary.withOpacity(0.3);
    }

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(SportsConstants.buttonRadius),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 4),
        decoration: BoxDecoration(
          color: backgroundColor,
          borderRadius: BorderRadius.circular(SportsConstants.buttonRadius),
          border: Border.all(color: borderColor, width: isSelected ? 2 : 1),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(_getIconForType(type), size: 18, color: textColor),
            const SizedBox(height: 2),
            FittedBox(
              fit: BoxFit.scaleDown,
              child: Text(
                type.displayName,
                style: TextStyle(
                  color: textColor,
                  fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                  fontSize: 11,
                ),
                textAlign: TextAlign.center,
                maxLines: 1,
              ),
            ),
            if (!isEnabled) ...[
              const SizedBox(height: 1),
              FittedBox(
                fit: BoxFit.scaleDown,
                child: Text(
                  '${type.minSelections}+',
                  style: TextStyle(
                    fontSize: 9,
                    color: textColor.withOpacity(0.7),
                  ),
                  maxLines: 1,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  IconData _getIconForType(BetType type) {
    switch (type) {
      case BetType.simple:
        return Icons.looks_one_rounded;
      case BetType.multiple:
        return Icons.grid_view_rounded;
      case BetType.system:
        return Icons.account_tree_rounded;
    }
  }
}
