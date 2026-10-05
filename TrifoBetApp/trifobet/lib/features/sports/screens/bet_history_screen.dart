import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../constants.dart';
import '../services/sports_betting_service.dart';
import '../services/bet_pdf_service.dart';
import '../../profile/services/profile_service.dart';

class BetHistoryScreen extends StatefulWidget {
  const BetHistoryScreen({super.key});

  @override
  State<BetHistoryScreen> createState() => _BetHistoryScreenState();
}

class _BetHistoryScreenState extends State<BetHistoryScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  bool _isLoading = true;
  List<dynamic> _bets = [];
  String? _filterStatus; // null (todos), 'pendiente', 'ganada', 'perdida'

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
    _tabController.addListener(_handleTabSelection);
    _loadHistory();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  void _handleTabSelection() {
    if (_tabController.indexIsChanging) {
      setState(() {
        switch (_tabController.index) {
          case 0:
            _filterStatus = null;
            break;
          case 1:
            _filterStatus = 'pendiente';
            break;
          case 2:
            _filterStatus = 'ganada';
            break;
          case 3:
            _filterStatus = 'perdida';
            break;
        }
        _isLoading = true;
      });
      _loadHistory();
    }
  }

  Future<void> _loadHistory() async {
    try {
      final data = await SportsBettingService.getBetHistory(
        estado: _filterStatus,
        limit: 50,
      );
      if (mounted) {
        debugPrint('📜 Historial recibido: ${data['apuestas']}');
        setState(() {
          _bets = data['apuestas'];
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error al cargar historial: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Future<void> _exportPdf() async {
    if (_bets.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('No hay datos para exportar')),
      );
      return;
    }

    try {
      // Mostrar indicador de carga
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Generando PDF...'),
          duration: Duration(seconds: 1),
        ),
      );

      // Obtener nombre de usuario
      String userName = 'Usuario';
      try {
        final profile = await ProfileService.getProfile();
        if (profile != null) {
          final firstName = profile['nombre'] ?? profile['first_name'] ?? '';
          final lastName = profile['apellido'] ?? profile['last_name'] ?? '';
          userName = '$firstName $lastName'.trim();
          if (userName.isEmpty) {
            userName = profile['username'] ?? profile['email'] ?? 'Usuario';
          }
        }
      } catch (e) {
        debugPrint('Error obteniendo perfil para PDF: $e');
      }

      await BetPdfService.generateAndDownloadPdf(_bets, userName: userName);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('PDF generado correctamente'),
            backgroundColor: SportsConstants.primaryGreen,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error generando PDF: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: SportsConstants.primaryBlack,
      appBar: AppBar(
        backgroundColor: SportsConstants.darkBackground,
        title: const Text(
          'Mis Apuestas',
          style: TextStyle(color: Colors.white),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.picture_as_pdf, color: Colors.white),
            tooltip: 'Exportar PDF',
            onPressed: _exportPdf,
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: SportsConstants.primaryGreen,
          labelColor: SportsConstants.primaryGreen,
          unselectedLabelColor: Colors.white54,
          tabs: const [
            Tab(text: 'TODAS'),
            Tab(text: 'PENDIENTES'),
            Tab(text: 'GANADAS'),
            Tab(text: 'PERDIDAS'),
          ],
        ),
      ),
      body: _isLoading
          ? Center(
              child: CircularProgressIndicator(
                color: SportsConstants.primaryGreen,
              ),
            )
          : _bets.isEmpty
          ? _buildEmptyState()
          : RefreshIndicator(
              onRefresh: _loadHistory,
              color: SportsConstants.primaryGreen,
              child: ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: _bets.length,
                itemBuilder: (context, index) {
                  return _buildBetCard(_bets[index]);
                },
              ),
            ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.receipt_long,
            size: 64,
            color: SportsConstants.textTertiary,
          ),
          const SizedBox(height: 16),
          Text(
            'No hay apuestas en este estado',
            style: SportsConstants.subtitleStyle,
          ),
        ],
      ),
    );
  }

  Widget _buildBetCard(Map<String, dynamic> bet) {
    final estado = bet['estado'] ?? 'pendiente';
    final isPending = estado == 'pendiente';
    final isWon = estado == 'ganada';

    Color statusColor;
    IconData statusIcon;
    String statusText;

    switch (estado) {
      case 'ganada':
        statusColor = SportsConstants.primaryGreen;
        statusIcon = Icons.check_circle;
        statusText = 'GANADA';
        break;
      case 'perdida':
        statusColor = Colors.red;
        statusIcon = Icons.cancel;
        statusText = 'PERDIDA';
        break;
      default:
        statusColor = Colors.orange;
        statusIcon = Icons.access_time_filled;
        statusText = 'PENDIENTE';
    }

    final date = DateTime.parse(bet['fechaCreacion']).toLocal();
    final formattedDate = DateFormat('dd/MM/yyyy HH:mm').format(date);
    final selecciones = (bet['selecciones'] as List)
        .cast<Map<String, dynamic>>();

    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      color: SportsConstants.cardBackground,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: statusColor.withOpacity(0.3), width: 1),
      ),
      child: ExpansionTile(
        tilePadding: const EdgeInsets.all(16),
        collapsedIconColor: Colors.white54,
        iconColor: SportsConstants.primaryGreen,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: statusColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(4),
                    border: Border.all(color: statusColor.withOpacity(0.5)),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(statusIcon, size: 14, color: statusColor),
                      const SizedBox(width: 4),
                      Text(
                        statusText,
                        style: TextStyle(
                          color: statusColor,
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
                Text(
                  formattedDate,
                  style: const TextStyle(color: Colors.white54, fontSize: 12),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      if (bet['tipo'] == 'simple' &&
                          selecciones.isNotEmpty) ...[
                        Text(
                          selecciones[0]['seleccionDisplay'] ?? 'Selección',
                          style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                            fontSize: 16,
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 4),
                        Text(
                          selecciones[0]['eventoNombre'] ?? 'Evento',
                          style: const TextStyle(
                            color: Colors.white70,
                            fontSize: 13,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ] else ...[
                        Text(
                          'Apuesta Combinada',
                          style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                            fontSize: 16,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '${selecciones.length} selecciones',
                          style: const TextStyle(
                            color: Colors.white70,
                            fontSize: 13,
                          ),
                        ),
                      ],
                      const SizedBox(height: 4),
                      Text(
                        'Cuota Total: ${bet['cuotaTotal'].toStringAsFixed(2)}',
                        style: TextStyle(
                          color: SportsConstants.primaryGold,
                          fontWeight: FontWeight.bold,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 12),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      'Apostado: Bs${bet['monto']}',
                      style: const TextStyle(
                        color: Colors.white70,
                        fontSize: 12,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Ganancia: Bs${bet['gananciaPotencial']}',
                      style: TextStyle(
                        color: isWon
                            ? SportsConstants.primaryGreen
                            : (isPending ? Colors.white : Colors.white54),
                        fontWeight: FontWeight.bold,
                        fontSize: 14,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ],
        ),
        children: [
          Container(
            decoration: BoxDecoration(
              color: Colors.black12,
              border: Border(
                top: BorderSide(color: Colors.white.withOpacity(0.1)),
              ),
            ),
            child: Column(
              children: selecciones
                  .map((sel) => _buildSelectionItem(sel))
                  .toList(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSelectionItem(Map<String, dynamic> selection) {
    final resultado =
        selection['resultado']; // true (ganó), false (perdió), null (pendiente)

    IconData icon;
    Color color;

    if (resultado == true) {
      icon = Icons.check_circle_outline;
      color = SportsConstants.primaryGreen;
    } else if (resultado == false) {
      icon = Icons.cancel_outlined;
      color = Colors.red;
    } else {
      icon = Icons.hourglass_empty;
      color = Colors.white24;
    }

    return Padding(
      padding: const EdgeInsets.all(12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 20, color: color),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  selection['seleccionDisplay'] ?? '',
                  style: TextStyle(
                    color: color == Colors.white24 ? Colors.white : color,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  selection['eventoNombre'] ?? '',
                  style: const TextStyle(color: Colors.white70, fontSize: 13),
                ),
                Text(
                  'Mercado: ${selection['mercado']}',
                  style: const TextStyle(color: Colors.white38, fontSize: 12),
                ),
              ],
            ),
          ),
          Text(
            '@${selection['cuota']}',
            style: const TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }
}
