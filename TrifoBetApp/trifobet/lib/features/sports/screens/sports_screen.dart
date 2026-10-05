import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter_svg/flutter_svg.dart';
import '../constants.dart';

import '../models/event_model.dart';
import '../services/bet_slip_service.dart';
import '../services/sports_service.dart';
import '../screens/event_details_screen.dart';
import '../widgets/event_card.dart';
import '../widgets/bet_slip_bottom_sheet.dart';
import '../widgets/date_selector.dart';
import '../widgets/sports_drawer.dart';
import '../../profile/services/profile_service.dart';
import '../../deposit/screens/deposit_screen.dart';
import 'dart:async';

class SportsScreen extends StatefulWidget {
  const SportsScreen({super.key});

  @override
  State<SportsScreen> createState() => _SportsScreenState();
}

class _SportsScreenState extends State<SportsScreen> {
  final BetSlipService _betSlip = BetSlipService();
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();

  // Data
  Map<String, List<SportsEvent>> _eventsByDate = {};
  List<String> _availableDates = [];
  bool _isLoading = true;

  // State
  String _selectedDate = '';
  String? _filterCountry;
  String? _filterLeague;
  String _searchQuery = '';
  bool _isSearchVisible = false;
  final TextEditingController _searchController = TextEditingController();
  double _userBalance = 0.0;
  Timer? _refreshTimer;

  @override
  void initState() {
    super.initState();
    _betSlip.init();
    _loadEvents();
    _loadBalance();
    // Auto-actualización cada 15 segundos
    _refreshTimer = Timer.periodic(const Duration(seconds: 15), (_) {
      _loadBalance();
      // También podríamos recargar eventos si fuera necesario
    });

    // Escuchar cambios en el cupón para actualizar saldo al apostar
    _betSlip.addListener(_onBetSlipChanged);
  }

  @override
  void dispose() {
    _refreshTimer?.cancel();
    _betSlip.removeListener(_onBetSlipChanged);
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadBalance() async {
    try {
      final profile = await ProfileService.getProfile();
      if (mounted && profile != null) {
        setState(() {
          _userBalance = (profile['saldo'] ?? profile['balance'] ?? 0.0)
              .toDouble();
        });
      }
    } catch (e) {
      debugPrint('Error cargando saldo: $e');
    }
  }

  void _onBetSlipChanged() {
    // Si el cupón se vacía (se hizo una apuesta), recargar saldo
    if (_betSlip.isEmpty) {
      _loadBalance();
    }
  }

  Future<void> _loadEvents() async {
    setState(() => _isLoading = true);
    final events = await SportsService.fetchEvents();

    if (mounted) {
      setState(() {
        _eventsByDate = events;
        _availableDates = events.keys.toList()..sort();
        // Seleccionar hoy por defecto si existe, o la primera fecha disponible
        final today = DateTime.now().toString().substring(0, 10);
        if (_availableDates.contains(today)) {
          _selectedDate = today;
        } else if (_availableDates.isNotEmpty) {
          _selectedDate = _availableDates.first;
        }
        _isLoading = false;
      });
    }
  }

  List<SportsEvent> _getFilteredEvents() {
    if (_eventsByDate.isEmpty) return [];

    // 1. Empezar con los eventos de la fecha seleccionada (o todos si hay filtro de liga)
    List<SportsEvent> events;

    if (_filterLeague != null || _filterCountry == 'LIVE') {
      // Si hay filtro de liga o es EN VIVO, buscamos en TODAS las fechas
      events = _eventsByDate.values.expand((e) => e).toList();
    } else {
      // Si no, solo la fecha seleccionada
      events = _eventsByDate[_selectedDate] ?? [];
    }

    // 2. FILTRAR PARTIDOS TERMINADOS (solo mostrar en vivo o futuros)
    events = events.where((e) {
      // Estos estados significan partido terminado/cancelado
      final finishedStatuses = ['FT', 'AET', 'PEN', 'CANC', 'SUSP', 'ABAN'];
      return !finishedStatuses.contains(e.status);
    }).toList();

    // 3. Filtrar por búsqueda
    if (_searchQuery.isNotEmpty) {
      final query = _searchQuery.toLowerCase();
      events = events.where((e) {
        return e.homeTeam.toLowerCase().contains(query) ||
            e.awayTeam.toLowerCase().contains(query) ||
            e.league.toLowerCase().contains(query);
      }).toList();
    }

    // 4. Filtrar por Sidebar (País / Liga / En Vivo)
    if (_filterCountry == 'LIVE') {
      events = events.where((e) {
        return ['1H', '2H', 'HT', 'ET', 'P', 'BT'].contains(e.status);
      }).toList();
    } else if (_filterCountry != null) {
      events = events.where((e) => e.country == _filterCountry).toList();
    }
    if (_filterLeague != null) {
      events = events.where((e) => e.league == _filterLeague).toList();
    }

    return events;
  }

  void _onDateSelected(String date) {
    setState(() {
      _selectedDate = date;
      _filterCountry = null; // Limpiar filtros al cambiar fecha
      _filterLeague = null;
    });
  }

  void _onFilterSelected(String? country, String? league) {
    setState(() {
      _filterCountry = country;
      _filterLeague = league;
      // Si seleccionamos una liga, limpiamos la búsqueda para ver todo
      _searchQuery = '';
      _searchController.clear();
    });
  }

  @override
  Widget build(BuildContext context) {
    final filteredEvents = _getFilteredEvents();

    return Scaffold(
      key: _scaffoldKey,
      backgroundColor: SportsConstants.primaryBlack,
      drawer: SportsDrawer(
        eventsByDate: _eventsByDate,
        onFilterSelected: _onFilterSelected,
      ),
      appBar: AppBar(
        backgroundColor: SportsConstants.darkBackground,
        leading: IconButton(
          icon: const Icon(Icons.menu, color: Colors.white),
          onPressed: () => _scaffoldKey.currentState?.openDrawer(),
        ),
        title: _isSearchVisible
            ? TextField(
                controller: _searchController,
                autofocus: true,
                style: const TextStyle(color: Colors.white),
                decoration: const InputDecoration(
                  hintText: 'Buscar equipo o liga...',
                  hintStyle: TextStyle(color: Colors.white54),
                  border: InputBorder.none,
                ),
                onChanged: (value) => setState(() => _searchQuery = value),
              )
            : GestureDetector(
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => const DepositScreen(),
                    ),
                  );
                },
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 8,
                  ),
                  decoration: BoxDecoration(
                    color: SportsConstants.primaryGreen.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: SportsConstants.primaryGreen.withOpacity(0.5),
                    ),
                  ),
                  child: Text(
                    'Bs.${_userBalance.toStringAsFixed(2)}',
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
                ),
              ),
        centerTitle: true,
        actions: [
          IconButton(
            icon: Icon(
              _isSearchVisible ? Icons.close : Icons.search,
              color: Colors.white,
            ),
            onPressed: () {
              setState(() {
                _isSearchVisible = !_isSearchVisible;
                if (!_isSearchVisible) {
                  _searchQuery = '';
                  _searchController.clear();
                }
              });
            },
          ),
        ],
      ),
      body: _isLoading
          ? Center(
              child: CircularProgressIndicator(
                color: SportsConstants.primaryGreen,
              ),
            )
          : Column(
              children: [
                // Selector de Fechas (Solo visible si no hay filtro de liga/live activo)
                if (_filterLeague == null &&
                    _filterCountry != 'LIVE' &&
                    _availableDates.isNotEmpty)
                  DateSelector(
                    dates: _availableDates,
                    selectedDate: _selectedDate,
                    onDateSelected: _onDateSelected,
                  ),

                // Filtro Activo Banner
                if (_filterLeague != null || _filterCountry == 'LIVE')
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(12),
                    color: SportsConstants.primaryGreen.withOpacity(0.2),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          _filterCountry == 'LIVE'
                              ? 'EN VIVO'
                              : '$_filterCountry - $_filterLeague',
                          style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        GestureDetector(
                          onTap: () => setState(() {
                            _filterCountry = null;
                            _filterLeague = null;
                          }),
                          child: const Icon(
                            Icons.close,
                            color: Colors.white,
                            size: 20,
                          ),
                        ),
                      ],
                    ),
                  ),

                // Lista de Eventos
                Expanded(child: _buildEventList(filteredEvents)),
              ],
            ),

      // Botón flotante del cupón
      floatingActionButton: ListenableBuilder(
        listenable: _betSlip,
        builder: (context, _) {
          if (_betSlip.isEmpty) {
            return FloatingActionButton(
              onPressed: () => showBetSlipBottomSheet(context),
              backgroundColor: const Color.fromARGB(255, 2, 136, 71),
              child: const Icon(Icons.receipt, color: Colors.white),
            );
          }

          return FloatingActionButton.extended(
            onPressed: () => showBetSlipBottomSheet(context),
            backgroundColor: const Color.fromARGB(255, 2, 136, 71),
            icon: Badge(
              label: Text('${_betSlip.itemCount}'),
              backgroundColor: const Color.fromARGB(255, 1, 193, 100),
              child: const Icon(Icons.receipt, color: Colors.white),
            ),
            label: Text(
              'Cuota: ${_betSlip.totalOdds.toStringAsFixed(2)}',
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildEventList(List<SportsEvent> events) {
    if (events.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.sports_soccer,
              size: 64,
              color: SportsConstants.textTertiary,
            ),
            const SizedBox(height: 16),
            Text(
              'No hay eventos disponibles',
              style: SportsConstants.subtitleStyle,
            ),
          ],
        ),
      );
    }

    // Agrupar por País -> Liga
    final groupedEvents = <String, Map<String, List<SportsEvent>>>{};
    for (var event in events) {
      if (!groupedEvents.containsKey(event.country)) {
        groupedEvents[event.country] = {};
      }
      if (!groupedEvents[event.country]!.containsKey(event.league)) {
        groupedEvents[event.country]![event.league] = [];
      }
      groupedEvents[event.country]![event.league]!.add(event);
    }

    // Ordenar países con Europa y Bolivia primero
    final sortedCountries = groupedEvents.keys.toList()
      ..sort((a, b) {
        const priorityCountries = [
          'Europe', // Champions/Europa League
          'World', // Competiciones mundiales
          'Bolivia', // Liga local
          'England', // Premier League
          'Spain', // La Liga
          'Italy', // Serie A
          'Germany', // Bundesliga
          'France', // Ligue 1
          'Argentina',
          'Brazil',
        ];
        final indexA = priorityCountries.indexOf(a);
        final indexB = priorityCountries.indexOf(b);
        if (indexA != -1 && indexB != -1) return indexA.compareTo(indexB);
        if (indexA != -1) return -1;
        if (indexB != -1) return 1;
        return a.compareTo(b);
      });

    return RefreshIndicator(
      onRefresh: _loadEvents,
      color: SportsConstants.primaryGreen,
      child: ListView.builder(
        padding: const EdgeInsets.only(bottom: 80),
        itemCount: sortedCountries.length,
        itemBuilder: (context, index) {
          final country = sortedCountries[index];
          final leaguesMap = groupedEvents[country]!;

          // Ordenar ligas por importancia
          final sortedLeagues = leaguesMap.keys.toList()
            ..sort((a, b) {
              // Función helper para obtener prioridad de liga
              int getLeaguePriority(String league) {
                final leagueLower = league.toLowerCase();

                // Prioridad 1: Copa del Mundo FIFA
                if (leagueLower.contains('world cup') ||
                    leagueLower.contains('copa del mundo'))
                  return 1;

                // Prioridad 2: UEFA Champions League (MÁS IMPORTANTE)
                // ESPECÍFICO: debe contener "uefa" Y "champions" para evitar AFC Champions
                if (leagueLower.contains('uefa') &&
                    leagueLower.contains('champions') &&
                    !leagueLower.contains('women') &&
                    !leagueLower.contains('youth'))
                  return 2;

                // Prioridad 3: Liga Boliviana
                if (leagueLower.contains('bolivia') ||
                    leagueLower.contains('división profesional') ||
                    leagueLower.contains('division profesional'))
                  return 3;

                // Prioridad 4: Copa América
                if (leagueLower.contains('copa america') ||
                    leagueLower.contains('copa américa'))
                  return 4;

                // Prioridad 5: Copa Libertadores
                if (leagueLower.contains('libertadores')) return 5;

                // Prioridad 6: UEFA Europa League
                if (leagueLower.contains('europa league')) return 6;

                // Prioridad 7: La Liga (España)
                if (leagueLower.contains('la liga') ||
                    leagueLower.contains('laliga'))
                  return 7;

                // Prioridad 8: Premier League (Inglaterra)
                if (leagueLower.contains('premier league')) return 8;

                // Prioridad 9: Serie A (Italia)
                if (leagueLower.contains('serie a') &&
                    !leagueLower.contains('serie b'))
                  return 9;

                // Prioridad 10: Bundesliga (Alemania)
                if (leagueLower.contains('bundesliga')) return 10;

                // Prioridad 11: Ligue 1 (Francia)
                if (leagueLower.contains('ligue 1')) return 11;

                // Prioridad 12: MLS
                if (leagueLower.contains('mls') ||
                    leagueLower.contains('major league soccer'))
                  return 12;

                // Prioridad 13: Copa Confederaciones
                if (leagueLower.contains('confederations') ||
                    leagueLower.contains('confederaciones'))
                  return 13;

                // Prioridad 14: Supercopa de Europa
                if (leagueLower.contains('super cup') ||
                    leagueLower.contains('supercopa'))
                  return 14;

                // Prioridad 15: FA Cup
                if (leagueLower.contains('fa cup')) return 15;

                // Prioridad 16: Copa del Rey
                if (leagueLower.contains('copa del rey')) return 16;

                // Prioridad 17: Copa de Italia (Coppa Italia)
                if (leagueLower.contains('coppa italia') ||
                    leagueLower.contains('copa de italia'))
                  return 17;

                // Prioridad 18: Superliga Argentina
                if (leagueLower.contains('superliga') &&
                    leagueLower.contains('argentin'))
                  return 18;
                if (leagueLower.contains('liga profesional') &&
                    leagueLower.contains('argentin'))
                  return 18;

                // Prioridad 19: Brasileirão Serie A
                if (leagueLower.contains('brasileir') ||
                    leagueLower.contains('serie a') &&
                        leagueLower.contains('bra'))
                  return 19;

                // Prioridad 20: Copa MX
                if (leagueLower.contains('copa mx') ||
                    leagueLower.contains('copa méxico'))
                  return 20;

                // Prioridad 21: Primeira Liga (Portugal)
                if (leagueLower.contains('primeira liga') ||
                    (leagueLower.contains('liga') &&
                        leagueLower.contains('portugal')))
                  return 21;

                // Prioridad 22: Eredivisie (Países Bajos)
                if (leagueLower.contains('eredivisie')) return 22;

                // Prioridad 23: J1 League (Japón)
                if (leagueLower.contains('j1 league') ||
                    leagueLower.contains('j-league'))
                  return 23;

                // Prioridad 24: A-League (Australia)
                if (leagueLower.contains('a-league')) return 24;

                // Prioridad 25: Chinese Super League
                if (leagueLower.contains('chinese super league') ||
                    leagueLower.contains('csl'))
                  return 25;

                // Prioridad 26-30: Segundas divisiones importantes
                if (leagueLower.contains('championship')) return 26;
                if (leagueLower.contains('segunda división') ||
                    leagueLower.contains('segunda division'))
                  return 27;
                if (leagueLower.contains('serie b')) return 28;
                if (leagueLower.contains('ligue 2')) return 29;

                // Prioridad 31: Copa Sudamericana
                if (leagueLower.contains('sudamericana')) return 31;

                // Resto: sin prioridad específica (orden alfabético)
                return 999;
              }

              final priorityA = getLeaguePriority(a);
              final priorityB = getLeaguePriority(b);

              if (priorityA != priorityB) {
                return priorityA.compareTo(priorityB);
              }

              // Si tienen la misma prioridad, ordenar alfabéticamente
              return a.compareTo(b);
            });

          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Cabecera de País (Solo si no estamos filtrando por liga específica)
              if (_filterLeague == null)
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 8,
                  ),
                  color: Colors.black54,
                  child: Row(
                    children: [
                      // Bandera o icono del país
                      _buildCountryIcon(
                        country,
                        groupedEvents[country]!.values.first.first,
                      ),
                      const SizedBox(width: 10),
                      Text(
                        country.toUpperCase(),
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 14,
                          letterSpacing: 1.0,
                        ),
                      ),
                    ],
                  ),
                ),

              // Lista de Ligas
              ...sortedLeagues.map((leagueName) {
                final leagueEvents = leaguesMap[leagueName]!;
                return Theme(
                  data: Theme.of(
                    context,
                  ).copyWith(dividerColor: Colors.transparent),
                  child: ExpansionTile(
                    initiallyExpanded: true,
                    collapsedIconColor: Colors.white70,
                    iconColor: SportsConstants.primaryGreen,
                    title: Row(
                      children: [
                        // Logo de la liga con caché
                        _buildLeagueLogo(leagueEvents.first),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            leagueName,
                            style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ],
                    ),
                    children: leagueEvents
                        .map(
                          (event) => EventCard(
                            event: event,
                            onTap: () => Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) =>
                                    EventDetailsScreen(event: event),
                              ),
                            ),
                          ),
                        )
                        .toList(),
                  ),
                );
              }).toList(),
            ],
          );
        },
      ),
    );
  }

  // Helper para mostrar bandera o icono de país
  Widget _buildCountryIcon(String country, SportsEvent event) {
    const size = 24.0;

    // Caso especial: Mundo
    if (country.toLowerCase() == 'world' || country.toLowerCase() == 'mundo') {
      return const Icon(Icons.public, size: size, color: Colors.white70);
    }

    final flagUrl = event.countryFlag;

    // Si es URL remota (SVG)
    if (flagUrl.startsWith('http')) {
      if (flagUrl.endsWith('.svg')) {
        return SvgPicture.network(
          flagUrl,
          width: size,
          height: size,
          placeholderBuilder: (context) => const SizedBox(
            width: size,
            height: size,
            child: CircularProgressIndicator(strokeWidth: 2),
          ),
        );
      } else {
        // PNG/JPG con caché
        return CachedNetworkImage(
          imageUrl: flagUrl,
          width: size,
          height: size,
          placeholder: (context, url) => const SizedBox(
            width: size,
            height: size,
            child: CircularProgressIndicator(strokeWidth: 2),
          ),
          errorWidget: (context, url, error) =>
              const Icon(Icons.flag, size: size, color: Colors.white70),
        );
      }
    }

    // Asset local SVG
    if (flagUrl.endsWith('.svg')) {
      return SvgPicture.asset(flagUrl, width: size, height: size);
    }

    // Fallback: ícono genérico
    return const Icon(Icons.flag, size: size, color: Colors.white70);
  }

  // Helper para mostrar logo de liga con caché
  Widget _buildLeagueLogo(SportsEvent event) {
    const size = 24.0;
    final logoUrl = event.leagueLogo;

    // Si es URL remota (PNG/JPG)
    if (logoUrl.startsWith('http')) {
      return CachedNetworkImage(
        imageUrl: logoUrl,
        width: size,
        height: size,
        placeholder: (context, url) => const SizedBox(
          width: size,
          height: size,
          child: CircularProgressIndicator(strokeWidth: 2),
        ),
        errorWidget: (context, url, error) =>
            const Icon(Icons.emoji_events, size: size, color: Colors.white70),
      );
    }

    // Asset local
    return Image.asset(
      logoUrl,
      width: size,
      height: size,
      errorBuilder: (_, __, ___) =>
          const Icon(Icons.emoji_events, size: size, color: Colors.white70),
    );
  }
}
