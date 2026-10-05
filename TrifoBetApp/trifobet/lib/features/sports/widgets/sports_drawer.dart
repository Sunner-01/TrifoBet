import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import '../constants.dart';
import '../models/event_model.dart';
import '../screens/bet_history_screen.dart';
import '../services/sports_betting_service.dart';
import 'pulsing_wrapper.dart';

class SportsDrawer extends StatelessWidget {
  final Map<String, List<SportsEvent>> eventsByDate;
  final Function(String?, String?) onFilterSelected;

  const SportsDrawer({
    super.key,
    required this.eventsByDate,
    required this.onFilterSelected,
  });

  @override
  Widget build(BuildContext context) {
    // 1. Extraer todos los eventos únicos de todas las fechas
    final allEvents = eventsByDate.values.expand((element) => element).toList();

    // 2. Agrupar por País -> Ligas (con metadatos de logos)
    final countryLogos = <String, String>{};
    final grouped = <String, Map<String, String>>{};

    for (var event in allEvents) {
      // Guardar logo del país (prioriza si ya existe uno no vacío)
      if (!countryLogos.containsKey(event.country) ||
          (countryLogos[event.country]!.isEmpty &&
              event.countryFlag.isNotEmpty)) {
        countryLogos[event.country] = event.countryFlag;
      }

      if (!grouped.containsKey(event.country)) {
        grouped[event.country] = {};
      }

      // Guardar logo de la liga
      grouped[event.country]![event.league] = event.leagueLogo;
    }

    // 3. Ordenar países (Prioridad + Alfabético)
    final sortedCountries = grouped.keys.toList()
      ..sort((a, b) {
        const priority = [
          'World',
          'Europe',
          'England',
          'Spain',
          'Italy',
          'Germany',
          'France',
        ];
        final indexA = priority.indexOf(a);
        final indexB = priority.indexOf(b);
        if (indexA != -1 && indexB != -1) return indexA.compareTo(indexB);
        if (indexA != -1) return -1;
        if (indexB != -1) return 1;
        return a.compareTo(b);
      });

    return Drawer(
      backgroundColor: const Color(0xFF121212),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.only(top: 50, bottom: 20, left: 20),
            width: double.infinity,
            color: SportsConstants.primaryBlack,
            child: const Text(
              'Competiciones',
              style: TextStyle(
                color: Colors.white,
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          Expanded(
            child: ListView.builder(
              padding: EdgeInsets.zero,
              itemCount:
                  sortedCountries.length +
                  4, // +1 Ver Todo, +1 Mis Apuestas, +1 Estadísticas, +1 En Vivo
              itemBuilder: (context, index) {
                if (index == 0) {
                  return ListTile(
                    leading: const Icon(
                      Icons.sports_soccer,
                      color: Colors.white,
                    ),
                    title: const Text(
                      'Ver Todo',
                      style: TextStyle(color: Colors.white),
                    ),
                    onTap: () {
                      onFilterSelected(null, null);
                      Navigator.pop(context);
                    },
                  );
                }

                if (index == 1) {
                  return ListTile(
                    leading: const Icon(Icons.history, color: Colors.white),
                    title: const Text(
                      'Mis Apuestas',
                      style: TextStyle(color: Colors.white),
                    ),
                    onTap: () {
                      Navigator.pop(context);
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => const BetHistoryScreen(),
                        ),
                      );
                    },
                  );
                }

                if (index == 2) {
                  return ListTile(
                    leading: const Icon(Icons.bar_chart, color: Colors.white),
                    title: const Text(
                      'Estadísticas',
                      style: TextStyle(color: Colors.white),
                    ),
                    onTap: () {
                      Navigator.pop(context);
                      _showStatisticsDialog(context);
                    },
                  );
                }

                if (index == 3) {
                  return ListTile(
                    leading: PulsingWrapper(
                      child: const Icon(
                        Icons.fiber_manual_record,
                        color: Colors.red,
                      ),
                    ),
                    title: PulsingWrapper(
                      child: const Text(
                        'En Vivo',
                        style: TextStyle(
                          color: Colors.red,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    onTap: () {
                      onFilterSelected('LIVE', null);
                      Navigator.pop(context);
                    },
                  );
                }

                final country = sortedCountries[index - 4];
                final leaguesMap = grouped[country]!;
                final leagues = leaguesMap.keys.toList()..sort();
                final countryFlag = countryLogos[country] ?? '';

                return Theme(
                  data: Theme.of(
                    context,
                  ).copyWith(dividerColor: Colors.transparent),
                  child: ExpansionTile(
                    leading: _buildLogo(countryFlag, 24, countryName: country),
                    title: Text(
                      country,
                      style: const TextStyle(color: Colors.white),
                    ),
                    iconColor: SportsConstants.primaryGold,
                    collapsedIconColor: Colors.white54,
                    children: leagues.map((league) {
                      final leagueLogo = leaguesMap[league] ?? '';
                      return ListTile(
                        contentPadding: const EdgeInsets.only(
                          left: 20, // Ajustado para dar espacio al logo
                          right: 20,
                        ),
                        leading: Padding(
                          padding: const EdgeInsets.only(left: 20.0),
                          child: _buildLogo(leagueLogo, 20),
                        ),
                        title: Text(
                          league,
                          style: const TextStyle(
                            color: Colors.white70,
                            fontSize: 14,
                          ),
                        ),
                        onTap: () {
                          onFilterSelected(country, league);
                          Navigator.pop(context);
                        },
                      );
                    }).toList(),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  void _showStatisticsDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: SportsConstants.cardBackground,
        title: const Text(
          'Estadísticas de Apuestas',
          style: TextStyle(color: Colors.white),
        ),
        content: FutureBuilder<Map<String, dynamic>>(
          future: SportsBettingService.getStatistics(),
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const SizedBox(
                height: 100,
                child: Center(child: CircularProgressIndicator()),
              );
            }

            if (snapshot.hasError) {
              return Text(
                'Error al cargar estadísticas',
                style: TextStyle(color: Colors.red[300]),
              );
            }

            final stats = snapshot.data!;
            return Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                _buildStatRow('Total Apuestas', '${stats['totalApuestas']}'),
                _buildStatRow(
                  'Ganadas',
                  '${stats['apuestasGanadas']}',
                  Colors.green,
                ),
                _buildStatRow(
                  'Perdidas',
                  '${stats['apuestasPerdidas']}',
                  Colors.red,
                ),
                const Divider(color: Colors.white24),
                _buildStatRow('Tasa de Éxito', '${stats['tasaExito']}%'),
                _buildStatRow(
                  'Beneficio Neto',
                  'Bs${stats['beneficioNeto']}',
                  (stats['beneficioNeto'] as num) >= 0
                      ? Colors.green
                      : Colors.red,
                ),
              ],
            );
          },
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cerrar', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  Widget _buildStatRow(String label, String value, [Color? valueColor]) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Colors.white70)),
          Text(
            value,
            style: TextStyle(
              color: valueColor ?? Colors.white,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLogo(String path, double size, {String? countryName}) {
    // Caso especial: World
    if (countryName != null &&
        (countryName == 'World' || countryName == 'Mundo')) {
      return Icon(Icons.public, color: Colors.white54, size: size);
    }

    if (path.isEmpty) {
      return Icon(Icons.flag, color: Colors.white54, size: size);
    }

    // Manejo de SVGs
    if (path.endsWith('.svg')) {
      if (path.startsWith('http')) {
        return SvgPicture.network(
          path,
          width: size,
          height: size,
          placeholderBuilder: (_) =>
              Icon(Icons.flag, size: size, color: Colors.white24),
        );
      } else {
        return SvgPicture.asset(
          path,
          width: size,
          height: size,
          placeholderBuilder: (_) =>
              Icon(Icons.flag, size: size, color: Colors.white24),
        );
      }
    }

    // Manejo de imágenes normales (PNG, JPG, etc.)
    if (path.startsWith('http')) {
      return Image.network(
        path,
        width: size,
        height: size,
        errorBuilder: (_, __, ___) =>
            Icon(Icons.broken_image, size: size, color: Colors.white24),
      );
    }

    return Image.asset(
      path,
      width: size,
      height: size,
      errorBuilder: (_, __, ___) =>
          Icon(Icons.shield, size: size, color: Colors.white24),
    );
  }
}
