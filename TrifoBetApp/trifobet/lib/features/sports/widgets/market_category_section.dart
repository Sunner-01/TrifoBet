import 'package:flutter/material.dart';
import '../constants.dart';
import '../models/betting_market.dart';
import '../models/bet_slip_item.dart';
import 'market_odds_button.dart';

/// Sección que muestra un mercado con todas sus opciones
class MarketCategorySection extends StatelessWidget {
  final BettingMarket market;
  final int eventId;
  final String homeTeam;
  final String awayTeam;
  final String league;
  final DateTime eventDate;

  const MarketCategorySection({
    super.key,
    required this.market,
    required this.eventId,
    required this.homeTeam,
    required this.awayTeam,
    required this.league,
    required this.eventDate,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: SportsConstants.paddingLarge),
      padding: const EdgeInsets.all(SportsConstants.paddingMedium),
      decoration: BoxDecoration(
        color: SportsConstants.cardBackground,
        borderRadius: BorderRadius.circular(SportsConstants.cardRadius),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Título del mercado
          Text(
            market.name,
            style: SportsConstants.subtitleStyle.copyWith(
              color: SportsConstants.textPrimary,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: SportsConstants.paddingMedium),

          // Grid de opciones
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: market.options.length <= 3
                  ? market.options.length
                  : 3,
              childAspectRatio: 1.8,
              crossAxisSpacing: SportsConstants.paddingSmall,
              mainAxisSpacing: SportsConstants.paddingSmall,
            ),
            itemCount: market.options.length,
            itemBuilder: (context, index) {
              // Reordenar opciones para mercados 1X2: Equipo 1, Empate, Equipo 2
              final option = _getReorderedOption(market, index);
              final betSlipItem = BetSlipItem(
                id: BetSlipItem.generateId(eventId, market.id, option.id),
                eventId: eventId,
                homeTeam: homeTeam,
                awayTeam: awayTeam,
                league: league,
                marketName: market.name,
                selectedOption: option.label,
                odds: option.odds,
                eventDate: eventDate,
              );

              return MarketOddsButton(
                eventId: eventId.toString(),
                marketId: market.id,
                optionId: option.id,
                label: option.label,
                odds: option.odds,
                betSlipItem: betSlipItem,
              );
            },
          ),
        ],
      ),
    );
  }

  /// Reordena las opciones para que el empate quede en el medio (1, X, 2)
  MarketOption _getReorderedOption(BettingMarket market, int index) {
    // Solo reordenar si es un mercado 1X2 con exactamente 3 opciones
    if (market.options.length != 3) {
      return market.options[index];
    }

    // Buscar índices de cada opción
    int? homeIndex, drawIndex, awayIndex;
    for (int i = 0; i < market.options.length; i++) {
      final label = market.options[i].label.toLowerCase();
      if (label == homeTeam.toLowerCase() || label.contains('local')) {
        homeIndex = i;
      } else if (label == 'empate' ||
          label == 'x' ||
          label.toLowerCase().contains('draw')) {
        drawIndex = i;
      } else if (label == awayTeam.toLowerCase() ||
          label.contains('visitante')) {
        awayIndex = i;
      }
    }

    // Si encontramos las 3 opciones, reordenar
    if (homeIndex != null && drawIndex != null && awayIndex != null) {
      final reorderedIndices = [homeIndex, drawIndex, awayIndex];
      return market.options[reorderedIndices[index]];
    }

    // Fallback: devolver en el orden original
    return market.options[index];
  }
}
