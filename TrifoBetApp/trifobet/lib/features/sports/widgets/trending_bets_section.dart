import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../constants.dart';
import '../models/event_model.dart';
import '../models/bet_slip_item.dart';
import '../services/bet_slip_service.dart';
import '../screens/event_details_screen.dart';

/// Widget horizontal scrollable con apuestas destacadas/populares
class TrendingBetsSection extends StatelessWidget {
  final List<SportsEvent> events;

  const TrendingBetsSection({super.key, required this.events});

  @override
  Widget build(BuildContext context) {
    if (events.isEmpty) return const SizedBox.shrink();

    // Toma los primeros 5 eventos con mejores cuotas
    final trending = events.take(5).toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(
            horizontal: SportsConstants.paddingMedium,
            vertical: SportsConstants.paddingSmall,
          ),
          child: Row(
            children: [
              Icon(
                Icons.trending_up,
                color: SportsConstants.primaryGold,
                size: 20,
              ),
              const SizedBox(width: 8),
              Text(
                'Apuestas Destacadas',
                style: SportsConstants.subtitleStyle.copyWith(
                  fontWeight: FontWeight.bold,
                  color: SportsConstants.primaryGold,
                ),
              ),
            ],
          ),
        ),
        SizedBox(
          height: 140,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(
              horizontal: SportsConstants.paddingMedium,
            ),
            itemCount: trending.length,
            itemBuilder: (context, index) {
              return _TrendingBetCard(event: trending[index]);
            },
          ),
        ),
      ],
    );
  }
}

class _TrendingBetCard extends StatelessWidget {
  final SportsEvent event;

  const _TrendingBetCard({required this.event});

  @override
  Widget build(BuildContext context) {
    final BetSlipService betSlip = BetSlipService();

    // Encuentra la cuota más alta del evento
    if (event.odds.isEmpty) return const SizedBox.shrink();

    final bestOdds = event.odds.entries.reduce(
      (a, b) => a.value > b.value ? a : b,
    );

    return Container(
      width: 200,
      margin: const EdgeInsets.only(right: 12),
      child: InkWell(
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => EventDetailsScreen(event: event),
            ),
          );
        },
        borderRadius: BorderRadius.circular(SportsConstants.cardRadius),
        child: Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                SportsConstants.primaryGold.withOpacity(0.15),
                SportsConstants.cardBackground,
              ],
            ),
            borderRadius: BorderRadius.circular(SportsConstants.cardRadius),
            border: Border.all(
              color: SportsConstants.primaryGold.withOpacity(0.3),
              width: 1,
            ),
          ),
          padding: const EdgeInsets.all(SportsConstants.paddingMedium),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              // Badge "Hot"
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.orange,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: const [
                    Icon(
                      Icons.local_fire_department,
                      size: 12,
                      color: Colors.white,
                    ),
                    SizedBox(width: 4),
                    Text(
                      'HOT',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),

              // Equipos
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    event.homeTeam,
                    style: SportsConstants.bodyStyle.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 2),
                  Text('vs', style: SportsConstants.captionStyle),
                  const SizedBox(height: 2),
                  Text(
                    event.awayTeam,
                    style: SportsConstants.bodyStyle.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),

              // Cuota y botón
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(bestOdds.key, style: SportsConstants.captionStyle),
                      Text(
                        bestOdds.value.toStringAsFixed(2),
                        style: SportsConstants.titleStyle.copyWith(
                          color: SportsConstants.primaryGold,
                          fontSize: 20,
                        ),
                      ),
                    ],
                  ),
                  IconButton(
                    onPressed: () {
                      HapticFeedback.lightImpact();
                      final item = BetSlipItem(
                        id: '${event.id}_${bestOdds.key}',
                        eventId: event.id,
                        homeTeam: event.homeTeam,
                        awayTeam: event.awayTeam,
                        league: event.league,
                        marketName: 'Ganador',
                        selectedOption: bestOdds.key,
                        odds: bestOdds.value,
                        eventDate: event.dateTime,
                      );
                      betSlip.toggleItem(item);
                    },
                    icon: const Icon(Icons.add_circle),
                    color: SportsConstants.lightGreen,
                    iconSize: 28,
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
