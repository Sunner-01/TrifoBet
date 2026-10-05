import 'package:flutter/material.dart';
import '../constants.dart';

class SportsFilters extends StatefulWidget {
  final Function(String) onSearch;
  final Function(String?) onCountryFilter;
  final Function(String?) onLeagueFilter;

  const SportsFilters({
    super.key,
    required this.onSearch,
    required this.onCountryFilter,
    required this.onLeagueFilter,
  });

  @override
  State<SportsFilters> createState() => _SportsFiltersState();
}

class _SportsFiltersState extends State<SportsFilters> {
  final _searchController = TextEditingController();
  String? _selectedCountry;

  final countries = [
    'Todos',
    'Inglaterra',
    'España',
    'Francia',
    'Argentina',
    'Alemania',
    'Italia',
  ];

  @override
  Widget build(BuildContext context) {
    return SliverToBoxAdapter(
      child: Column(
        children: [
          // Barra de búsqueda
          Padding(
            padding: const EdgeInsets.all(SportsConstants.paddingMedium),
            child: TextField(
              controller: _searchController,
              onChanged: widget.onSearch,
              style: SportsConstants.bodyStyle,
              decoration: InputDecoration(
                hintText: 'Buscar equipo o liga...',
                hintStyle: SportsConstants.captionStyle,
                prefixIcon: Icon(
                  Icons.search,
                  color: SportsConstants.primaryGold,
                ),
                filled: true,
                fillColor: SportsConstants.cardBackground,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(
                    SportsConstants.cardRadius,
                  ),
                  borderSide: BorderSide(
                    color: SportsConstants.primaryGold.withOpacity(0.3),
                  ),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(
                    SportsConstants.cardRadius,
                  ),
                  borderSide: BorderSide(
                    color: SportsConstants.primaryGold.withOpacity(0.3),
                  ),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(
                    SportsConstants.cardRadius,
                  ),
                  borderSide: BorderSide(
                    color: SportsConstants.primaryGold,
                    width: 2,
                  ),
                ),
              ),
            ),
          ),

          // Filtros de país
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(
              horizontal: SportsConstants.paddingMedium,
            ),
            child: Row(
              children: countries.map((c) {
                final isSelected = _selectedCountry == c;
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: FilterChip(
                    label: Text(c),
                    selected: isSelected,
                    onSelected: (_) {
                      setState(
                        () =>
                            _selectedCountry = _selectedCountry == c ? null : c,
                      );
                      widget.onCountryFilter(
                        _selectedCountry == 'Todos' ? null : _selectedCountry,
                      );
                    },
                    backgroundColor: SportsConstants.cardBackground,
                    selectedColor: SportsConstants.primaryGreen.withOpacity(
                      0.3,
                    ),
                    checkmarkColor: SportsConstants.primaryGold,
                    labelStyle: TextStyle(
                      color: isSelected
                          ? SportsConstants.primaryGold
                          : SportsConstants.textSecondary,
                      fontWeight: isSelected
                          ? FontWeight.bold
                          : FontWeight.normal,
                    ),
                    side: BorderSide(
                      color: isSelected
                          ? SportsConstants.primaryGold
                          : SportsConstants.textTertiary.withOpacity(0.3),
                    ),
                  ),
                );
              }).toList(),
            ),
          ),
          const SizedBox(height: SportsConstants.paddingSmall),
        ],
      ),
    );
  }
}
