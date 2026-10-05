import 'package:flutter/material.dart';
import '../constants.dart';
import '../models/event_model.dart';

/// Delegado personalizado para búsqueda de eventos deportivos
class SportsSearchDelegate extends SearchDelegate<SportsEvent?> {
  final List<SportsEvent> allEvents;

  SportsSearchDelegate(this.allEvents);

  @override
  ThemeData appBarTheme(BuildContext context) {
    return ThemeData(
      appBarTheme: AppBarTheme(
        backgroundColor: SportsConstants.darkBackground,
        elevation: 0,
      ),
      scaffoldBackgroundColor: SportsConstants.primaryBlack,
      inputDecorationTheme: InputDecorationTheme(
        hintStyle: TextStyle(color: SportsConstants.textSecondary),
        border: InputBorder.none,
      ),
      textTheme: TextTheme(
        titleLarge: TextStyle(color: SportsConstants.textPrimary, fontSize: 18),
      ),
    );
  }

  @override
  String get searchFieldLabel => 'Buscar equipos, ligas...';

  @override
  List<Widget> buildActions(BuildContext context) {
    return [
      if (query.isNotEmpty)
        IconButton(
          icon: const Icon(Icons.clear),
          onPressed: () {
            query = '';
          },
          color: SportsConstants.textSecondary,
        ),
    ];
  }

  @override
  Widget buildLeading(BuildContext context) {
    return IconButton(
      icon: const Icon(Icons.arrow_back),
      onPressed: () {
        close(context, null);
      },
      color: SportsConstants.textPrimary,
    );
  }

  @override
  Widget buildResults(BuildContext context) {
    final results = _performSearch(query);
    return _buildResultsList(results);
  }

  @override
  Widget buildSuggestions(BuildContext context) {
    if (query.isEmpty) {
      return _buildEmptyState();
    }

    final suggestions = _performSearch(query);
    return _buildResultsList(suggestions);
  }

  List<SportsEvent> _performSearch(String searchQuery) {
    if (searchQuery.isEmpty) return [];

    final lowerQuery = searchQuery.toLowerCase();
    return allEvents.where((event) {
      return event.homeTeam.toLowerCase().contains(lowerQuery) ||
          event.awayTeam.toLowerCase().contains(lowerQuery) ||
          event.league.toLowerCase().contains(lowerQuery) ||
          event.country.toLowerCase().contains(lowerQuery);
    }).toList();
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.search, size: 64, color: SportsConstants.textTertiary),
          const SizedBox(height: 16),
          Text('Busca equipos o ligas', style: SportsConstants.subtitleStyle),
          const SizedBox(height: 8),
          Text('Escribe para comenzar', style: SportsConstants.captionStyle),
        ],
      ),
    );
  }

  Widget _buildResultsList(List<SportsEvent> results) {
    if (results.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.search_off,
              size: 64,
              color: SportsConstants.textTertiary,
            ),
            const SizedBox(height: 16),
            Text(
              'No se encontraron resultados',
              style: SportsConstants.subtitleStyle,
            ),
            const SizedBox(height: 8),
            Text(
              'Intenta con otros términos',
              style: SportsConstants.captionStyle,
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      itemCount: results.length,
      itemBuilder: (context, index) {
        final event = results[index];
        return _SearchResultTile(
          event: event,
          onTap: () => close(context, event),
        );
      },
    );
  }
}

class _SearchResultTile extends StatelessWidget {
  final SportsEvent event;
  final VoidCallback onTap;

  const _SearchResultTile({required this.event, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final isLive = event.status == 'LIVE';

    return ListTile(
      onTap: onTap,
      contentPadding: const EdgeInsets.symmetric(
        horizontal: SportsConstants.paddingMedium,
        vertical: SportsConstants.paddingSmall,
      ),
      leading: Container(
        width: 48,
        height: 48,
        decoration: BoxDecoration(
          color: SportsConstants.cardBackground,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: isLive
                ? Colors.red.withOpacity(0.5)
                : SportsConstants.primaryGold.withOpacity(0.3),
          ),
        ),
        child: Icon(Icons.sports_soccer, color: SportsConstants.primaryGold),
      ),
      title: Text(
        '${event.homeTeam} vs ${event.awayTeam}',
        style: SportsConstants.bodyStyle.copyWith(fontWeight: FontWeight.bold),
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
      ),
      subtitle: Row(
        children: [
          Expanded(
            child: Text(
              event.league,
              style: SportsConstants.captionStyle,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ),
          if (isLive) ...[
            const SizedBox(width: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
              decoration: BoxDecoration(
                color: Colors.red,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                'LIVE',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ],
        ],
      ),
      trailing: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          Text(
            event.odds['1']?.toStringAsFixed(2) ?? '-',
            style: SportsConstants.bodyStyle.copyWith(
              color: SportsConstants.primaryGold,
              fontWeight: FontWeight.bold,
            ),
          ),
          Text(
            'Cuota',
            style: SportsConstants.captionStyle.copyWith(fontSize: 10),
          ),
        ],
      ),
    );
  }
}
