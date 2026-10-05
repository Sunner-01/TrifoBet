import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../constants.dart';
import '../models/bet_slip_item.dart';
import '../services/bet_slip_service.dart';

/// Card individual expandible para cada selección en el cupón
class SelectionCard extends StatefulWidget {
  final BetSlipItem item;
  final bool isCompactView;
  final VoidCallback onRemove;

  const SelectionCard({
    super.key,
    required this.item,
    required this.isCompactView,
    required this.onRemove,
  });

  @override
  State<SelectionCard> createState() => _SelectionCardState();
}

class _SelectionCardState extends State<SelectionCard> {
  final BetSlipService _betSlip = BetSlipService();
  bool _isExpanded = false;

  @override
  Widget build(BuildContext context) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 200),
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            SportsConstants.cardBackground,
            SportsConstants.cardBackground.withOpacity(0.7),
          ],
        ),
        borderRadius: BorderRadius.circular(SportsConstants.cardRadius),
        border: Border.all(
          color: SportsConstants.primaryGold.withOpacity(0.3),
          width: 1.5,
        ),
        boxShadow: [
          BoxShadow(
            color: SportsConstants.primaryGreen.withOpacity(0.1),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: [
          // Contenido principal
          InkWell(
            onTap: _betSlip.stakeMode == StakeMode.individual
                ? () => setState(() => _isExpanded = !_isExpanded)
                : null,
            borderRadius: BorderRadius.circular(SportsConstants.cardRadius),
            child: Padding(
              padding: const EdgeInsets.all(SportsConstants.paddingMedium),
              child: Row(
                children: [
                  // Indicador de estado
                  Container(
                    width: 4,
                    height: 50,
                    decoration: BoxDecoration(
                      color: SportsConstants.primaryGreen,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                  const SizedBox(width: 12),

                  // Info del evento
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Equipos
                        Text(
                          '${widget.item.homeTeam} vs ${widget.item.awayTeam}',
                          style: SportsConstants.bodyStyle.copyWith(
                            fontWeight: FontWeight.bold,
                            fontSize: 13,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),

                        if (!widget.isCompactView) ...[
                          const SizedBox(height: 4),
                          // Liga
                          Text(
                            widget.item.league,
                            style: SportsConstants.captionStyle.copyWith(
                              fontSize: 11,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 6),
                          // Mercado y selección
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 4,
                            ),
                            decoration: BoxDecoration(
                              color: SportsConstants.primaryGreen.withOpacity(
                                0.2,
                              ),
                              borderRadius: BorderRadius.circular(4),
                              border: Border.all(
                                color: SportsConstants.primaryGreen.withOpacity(
                                  0.4,
                                ),
                              ),
                            ),
                            child: Text(
                              '${widget.item.marketName}: ${widget.item.selectedOption}',
                              style: TextStyle(
                                fontSize: 11,
                                color: SportsConstants.lightGreen,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),

                  // Cuota y botones
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      // Cuota
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 6,
                        ),
                        decoration: BoxDecoration(
                          color: SportsConstants.darkGold.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(
                            color: SportsConstants.primaryGold.withOpacity(0.5),
                            width: 1.5,
                          ),
                        ),
                        child: Text(
                          widget.item.odds.toStringAsFixed(2),
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: SportsConstants.primaryGold,
                          ),
                        ),
                      ),
                      const SizedBox(height: 8),

                      // Botón eliminar
                      IconButton(
                        onPressed: () {
                          HapticFeedback.lightImpact();
                          widget.onRemove();
                        },
                        icon: const Icon(Icons.close, size: 20),
                        color: SportsConstants.textSecondary,
                        constraints: const BoxConstraints(),
                        padding: EdgeInsets.zero,
                        tooltip: 'Eliminar',
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),

          // Sección expandible para stake individual
          if (_isExpanded && _betSlip.stakeMode == StakeMode.individual)
            _buildIndividualStakeSection(),
        ],
      ),
    );
  }

  Widget _buildIndividualStakeSection() {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: SportsConstants.darkBackground.withOpacity(0.5),
        borderRadius: const BorderRadius.only(
          bottomLeft: Radius.circular(SportsConstants.cardRadius),
          bottomRight: Radius.circular(SportsConstants.cardRadius),
        ),
      ),
      child: ListenableBuilder(
        listenable: _betSlip,
        builder: (context, _) {
          final stake = _betSlip.getIndividualStake(widget.item.id);
          final potentialWin = _betSlip.getIndividualPotentialWin(
            widget.item.id,
          );

          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Divider(height: 1),
              const SizedBox(height: 12),

              Text(
                'Stake Individual',
                style: SportsConstants.captionStyle.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),

              // Input de stake
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      keyboardType: TextInputType.number,
                      decoration: InputDecoration(
                        prefixText: '\$ ',
                        hintText: '100',
                        filled: true,
                        fillColor: SportsConstants.cardBackground,
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                        contentPadding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 8,
                        ),
                      ),
                      onChanged: (value) {
                        final amount = double.tryParse(value);
                        if (amount != null) {
                          _betSlip.setIndividualStake(widget.item.id, amount);
                        }
                      },
                      controller: TextEditingController(
                        text: stake.toStringAsFixed(0),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),

                  // Ganancia individual
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 8,
                    ),
                    decoration: BoxDecoration(
                      color: SportsConstants.primaryGreen.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(
                          'Ganancia',
                          style: TextStyle(
                            fontSize: 10,
                            color: SportsConstants.textSecondary,
                          ),
                        ),
                        Text(
                          '\$${potentialWin.toStringAsFixed(0)}',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                            color: SportsConstants.lightGreen,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ],
          );
        },
      ),
    );
  }
}
