import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../constants.dart';
import '../models/event_model.dart';
import '../models/bet_slip_item.dart';
import '../services/bet_slip_service.dart';
import 'pulsing_wrapper.dart';
import 'live_match_timer.dart';

/// Tarjeta de evento deportivo con diseño premium
class EventCard extends StatelessWidget {
  final SportsEvent event;
  final VoidCallback onTap;

  const EventCard({super.key, required this.event, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final isLive = ['1H', '2H', 'HT', 'ET', 'P', 'BT'].contains(event.status);
    final mainOdds = event.mainOdds;

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      color: const Color(0xFF1E1E1E),
      elevation: 4,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
        side: BorderSide(
          color: isLive ? Colors.redAccent : Colors.white10,
          width: 1,
        ),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(8),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            children: [
              // Header: Liga y Tiempo
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      if (isLive)
                        PulsingWrapper(
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 6,
                              vertical: 2,
                            ),
                            margin: const EdgeInsets.only(right: 8),
                            decoration: BoxDecoration(
                              color: Colors.red,
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: const Text(
                              'EN VIVO',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ),
                      Text(
                        event.league,
                        style: const TextStyle(
                          color: Colors.white54,
                          fontSize: 11,
                        ),
                      ),
                    ],
                  ),
                  isLive
                      ? LiveMatchTimer(
                          initialMinute: event.liveMinute ?? "0",
                          isLive: true,
                          style: TextStyle(
                            color: SportsConstants.primaryGold,
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                          ),
                        )
                      : Text(
                          _formatEventTime(event.dateTime),
                          style: const TextStyle(
                            color: Colors.white54,
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                ],
              ),
              const SizedBox(height: 12),

              // Equipos y Marcador
              Row(
                children: [
                  // Local
                  Expanded(
                    child: Row(
                      children: [
                        _buildTeamLogo(event.homeLogo),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            event.homeTeam,
                            style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.w600,
                              fontSize: 13,
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        if (isLive)
                          Text(
                            '${event.scoreHome ?? 0}',
                            style: const TextStyle(
                              color: Color(0xFF00e676),
                              fontWeight: FontWeight.bold,
                              fontSize: 14,
                            ),
                          ),
                      ],
                    ),
                  ),

                  const Padding(
                    padding: EdgeInsets.symmetric(horizontal: 8),
                    child: Text(
                      'VS', // Siempre VS si no es live (porque el score solo se muestra si isLive)
                      style: TextStyle(
                        color: Colors.white24,
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                      ),
                    ),
                  ),

                  // Visitante
                  Expanded(
                    child: Row(
                      children: [
                        if (isLive)
                          Text(
                            '${event.scoreAway ?? 0}',
                            style: const TextStyle(
                              color: Color(0xFF00e676),
                              fontWeight: FontWeight.bold,
                              fontSize: 14,
                            ),
                          ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            event.awayTeam,
                            style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.w600,
                              fontSize: 13,
                            ),
                            overflow: TextOverflow.ellipsis,
                            textAlign: TextAlign.end,
                          ),
                        ),
                        const SizedBox(width: 8),
                        _buildTeamLogo(event.awayLogo),
                      ],
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 12),

              // Cuotas 1X2
              if (mainOdds.isNotEmpty)
                Row(
                  children: [
                    _OddsButton(
                      label: '1',
                      odds: mainOdds['1'] ?? 0,
                      event: event,
                      selectionId: '1',
                      selectionLabel: event.homeTeam,
                    ),
                    const SizedBox(width: 8),
                    _OddsButton(
                      label: 'X',
                      odds: mainOdds['X'] ?? 0,
                      event: event,
                      selectionId: 'X',
                      selectionLabel: 'Empate',
                    ),
                    const SizedBox(width: 8),
                    _OddsButton(
                      label: '2',
                      odds: mainOdds['2'] ?? 0,
                      event: event,
                      selectionId: '2',
                      selectionLabel: event.awayTeam,
                    ),
                  ],
                ),

              // Footer: Más mercados
              if (event.markets.length > 1)
                Padding(
                  padding: const EdgeInsets.only(top: 8),
                  child: Align(
                    alignment: Alignment.centerRight,
                    child: Text(
                      '+${event.markets.length} Mercados >',
                      style: const TextStyle(
                        color: Colors.white38,
                        fontSize: 10,
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTeamLogo(String path) {
    if (path.startsWith('http')) {
      return Image.network(
        path,
        width: 30,
        height: 30,
        errorBuilder: (_, __, ___) =>
            const Icon(Icons.shield, size: 24, color: Colors.white24),
      );
    }
    return Image.asset(
      path,
      width: 30,
      height: 30,
      errorBuilder: (_, __, ___) =>
          const Icon(Icons.shield, size: 24, color: Colors.white24),
    );
  }

  String _formatEventTime(DateTime dt) {
    final now = DateTime.now();
    final difference = dt.difference(now);

    if (difference.inHours > 24) {
      // Mostrar fecha y hora (ej: 09/12 15:00)
      return '${dt.day.toString().padLeft(2, '0')}/${dt.month.toString().padLeft(2, '0')} ${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}';
    } else {
      // Mostrar solo hora (ej: 15:00)
      return '${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}';
    }
  }
}

class _OddsButton extends StatelessWidget {
  final String label;
  final double odds;
  final SportsEvent event;
  final String selectionId;
  final String selectionLabel;

  const _OddsButton({
    required this.label,
    required this.odds,
    required this.event,
    required this.selectionId,
    required this.selectionLabel,
  });

  @override
  Widget build(BuildContext context) {
    final betSlip = BetSlipService();

    return Expanded(
      child: ListenableBuilder(
        listenable: betSlip,
        builder: (context, _) {
          final fullId = '${event.id}_1x2_$selectionId';
          final isSelected = betSlip.hasItem(fullId);

          return InkWell(
            onTap: () {
              HapticFeedback.lightImpact();
              final item = BetSlipItem(
                id: fullId,
                eventId: event.id,
                homeTeam: event.homeTeam,
                awayTeam: event.awayTeam,
                league: event.league,
                marketName: '1X2',
                selectedOption: selectionLabel,
                odds: odds,
                eventDate: event.dateTime,
              );
              betSlip.toggleItem(item);
            },
            borderRadius: BorderRadius.circular(4),
            child: Container(
              padding: const EdgeInsets.symmetric(vertical: 8),
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
                children: [
                  Text(
                    label,
                    style: TextStyle(
                      color: isSelected ? Colors.black : Colors.white54,
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    odds.toStringAsFixed(2),
                    style: TextStyle(
                      color: isSelected ? Colors.black : Colors.white,
                      fontSize: 13,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
