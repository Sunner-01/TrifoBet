import 'package:flutter/material.dart';

import '../models/event_model.dart';
import '../services/bet_slip_service.dart';
import '../widgets/bet_slip_bottom_sheet.dart';
import '../widgets/market_category_section.dart';
import '../widgets/live_match_timer.dart';

class EventDetailsScreen extends StatefulWidget {
  final SportsEvent event;

  const EventDetailsScreen({super.key, required this.event});

  @override
  State<EventDetailsScreen> createState() => _EventDetailsScreenState();
}

class _EventDetailsScreenState extends State<EventDetailsScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final BetSlipService _betSlip = BetSlipService();

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: _categories.length, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  List<String> get _categories {
    final categories = <String>[];
    for (final market in widget.event.markets) {
      if (!categories.contains(market.category)) {
        categories.add(market.category);
      }
    }
    return categories;
  }

  @override
  Widget build(BuildContext context) {
    final isLive = [
      '1H',
      '2H',
      'HT',
      'ET',
      'P',
      'BT',
    ].contains(widget.event.status);

    return Scaffold(
      backgroundColor: const Color(0xFF121212),
      body: NestedScrollView(
        headerSliverBuilder: (context, innerBoxIsScrolled) {
          return [
            SliverAppBar(
              expandedHeight: 260.0,
              floating: false,
              pinned: true,
              backgroundColor: const Color(0xFF1E1E1E),
              leading: IconButton(
                icon: const Icon(Icons.arrow_back_ios, color: Colors.white),
                onPressed: () => Navigator.pop(context),
              ),
              flexibleSpace: FlexibleSpaceBar(
                background: Container(
                  decoration: const BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [Color(0xFF2C2C2C), Color(0xFF121212)],
                    ),
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const SizedBox(height: 40),
                      if (widget.event.leagueLogo.isNotEmpty)
                        Padding(
                          padding: const EdgeInsets.only(bottom: 8.0),
                          child: _buildTeamLogo(widget.event.leagueLogo, 30),
                        ),
                      Text(
                        widget.event.league.toUpperCase(),
                        style: const TextStyle(
                          color: Colors.white54,
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 1.0,
                        ),
                      ),
                      const SizedBox(height: 20),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                        children: [
                          // Local
                          Expanded(
                            child: Column(
                              children: [
                                _buildTeamLogo(widget.event.homeTeamLogo, 50),
                                const SizedBox(height: 8),
                                Text(
                                  widget.event.homeTeam,
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 14,
                                  ),
                                  textAlign: TextAlign.center,
                                  maxLines: 2,
                                ),
                              ],
                            ),
                          ),
                          // Score / VS
                          Column(
                            children: [
                              if (isLive) ...[
                                Text(
                                  '${widget.event.scoreHome} - ${widget.event.scoreAway}',
                                  style: const TextStyle(
                                    color: Color(0xFF00e676),
                                    fontSize: 32,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 8,
                                    vertical: 2,
                                  ),
                                  decoration: BoxDecoration(
                                    color: Colors.red,
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                  child: LiveMatchTimer(
                                    initialMinute:
                                        widget.event.liveMinute ?? "0",
                                    isLive: true,
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 12,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                              ] else ...[
                                Text(
                                  _formatEventTime(widget.event.dateTime),
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 24,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                const Text(
                                  'VS',
                                  style: TextStyle(
                                    color: Colors.white54,
                                    fontSize: 14,
                                  ),
                                ),
                              ],
                            ],
                          ),
                          // Visitante
                          Expanded(
                            child: Column(
                              children: [
                                _buildTeamLogo(widget.event.awayTeamLogo, 50),
                                const SizedBox(height: 8),
                                Text(
                                  widget.event.awayTeam,
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 14,
                                  ),
                                  textAlign: TextAlign.center,
                                  maxLines: 2,
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
              bottom: TabBar(
                controller: _tabController,
                isScrollable: true,
                indicatorColor: const Color(0xFF00e676),
                labelColor: const Color(0xFF00e676),
                unselectedLabelColor: Colors.white54,
                indicatorSize: TabBarIndicatorSize.label,
                dividerColor: Colors.transparent,
                tabs: _categories
                    .map((c) => Tab(text: c.toUpperCase()))
                    .toList(),
              ),
            ),
          ];
        },
        body: TabBarView(
          controller: _tabController,
          children: _categories.map((category) {
            final markets = widget.event.markets
                .where((m) => m.category == category)
                .toList();
            return ListView.builder(
              padding: const EdgeInsets.all(12),
              itemCount: markets.length,
              itemBuilder: (context, index) {
                return MarketCategorySection(
                  market: markets[index],
                  eventId: widget.event.id,
                  homeTeam: widget.event.homeTeam,
                  awayTeam: widget.event.awayTeam,
                  league: widget.event.league,
                  eventDate: widget.event.dateTime,
                );
              },
            );
          }).toList(),
        ),
      ),
      floatingActionButton: ListenableBuilder(
        listenable: _betSlip,
        builder: (context, _) {
          if (_betSlip.isEmpty) {
            return FloatingActionButton(
              onPressed: () => showBetSlipBottomSheet(context),
              backgroundColor: const Color.fromARGB(255, 0, 162, 84),
              child: const Icon(Icons.receipt, color: Colors.black),
            );
          }

          return FloatingActionButton.extended(
            onPressed: () => showBetSlipBottomSheet(context),
            backgroundColor: const Color.fromARGB(255, 0, 162, 84),
            icon: Badge(
              label: Text('${_betSlip.itemCount}'),
              backgroundColor: Colors.white,
              textColor: Colors.black,
              child: const Icon(Icons.receipt, color: Colors.black),
            ),
            label: Text(
              'Cuota: ${_betSlip.totalOdds.toStringAsFixed(2)}',
              style: const TextStyle(
                color: Colors.black,
                fontWeight: FontWeight.bold,
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildTeamLogo(String path, double size) {
    if (path.startsWith('http')) {
      return Image.network(
        path,
        width: size,
        height: size,
        errorBuilder: (_, __, ___) =>
            Icon(Icons.shield, size: size, color: Colors.white24),
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
