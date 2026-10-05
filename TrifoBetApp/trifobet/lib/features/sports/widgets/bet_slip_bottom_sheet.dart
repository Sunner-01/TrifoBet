import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../constants.dart';
import '../services/bet_slip_service.dart';
import '../services/sports_betting_service.dart';
import 'bet_slip_header.dart';
import 'bet_type_selector.dart';
import 'selection_card.dart';

/// Bottom sheet profesional del cupón de apuestas
class BetSlipBottomSheet extends StatefulWidget {
  const BetSlipBottomSheet({super.key});

  @override
  State<BetSlipBottomSheet> createState() => _BetSlipBottomSheetState();
}

class _BetSlipBottomSheetState extends State<BetSlipBottomSheet>
    with SingleTickerProviderStateMixin {
  final TextEditingController _amountController = TextEditingController();
  final BetSlipService _betSlip = BetSlipService();
  late TabController _tabController;
  bool _isPlacing = false;

  // Historial
  List<dynamic> _historyBets = [];
  bool _isLoadingHistory = false;
  String? _historyFilter; // null, 'pendiente', 'ganada', 'perdida'

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _amountController.text = _betSlip.betAmount.toStringAsFixed(0);
    _amountController.text = _betSlip.betAmount.toStringAsFixed(0);
    _betSlip.addListener(_onBetSlipChanged);
    _betSlip.init();
    _loadHistory(); // Cargar historial inicial
  }

  @override
  void dispose() {
    _betSlip.removeListener(_onBetSlipChanged);
    _tabController.dispose();
    _amountController.dispose();
    super.dispose();
  }

  void _onBetSlipChanged() {
    if (mounted &&
        _amountController.text != _betSlip.betAmount.toStringAsFixed(0)) {
      setState(() {
        _amountController.text = _betSlip.betAmount.toStringAsFixed(0);
      });
    }
  }

  void _updateAmount(String value) {
    final amount = double.tryParse(value);
    if (amount != null) {
      _betSlip.updateBetAmount(amount);
    }
  }

  Future<void> _loadHistory() async {
    if (!mounted) return;
    setState(() => _isLoadingHistory = true);

    try {
      final data = await SportsBettingService.getBetHistory(
        estado: _historyFilter,
        limit: 20, // Límite menor para el bottom sheet
      );
      if (mounted) {
        setState(() {
          _historyBets = data['apuestas'];
          _isLoadingHistory = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoadingHistory = false);
        // Opcional: mostrar error discreto o ignorar
      }
    }
  }

  Future<void> _placeBet() async {
    if (!_betSlip.canPlaceBet) return;

    HapticFeedback.mediumImpact();
    setState(() => _isPlacing = true);

    try {
      final success = await _betSlip.placeBet();

      if (!mounted) return;
      setState(() => _isPlacing = false);

      if (success) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Row(
              children: const [
                Icon(Icons.check_circle, color: Colors.white),
                SizedBox(width: 12),
                Expanded(child: Text('¡Apuesta realizada con éxito!')),
              ],
            ),
            backgroundColor: SportsConstants.primaryGreen,
            behavior: SnackBarBehavior.floating,
            duration: const Duration(seconds: 3),
          ),
        );
      }
    } catch (e) {
      if (!mounted) return;
      setState(() => _isPlacing = false);

      // Extraer mensaje de error limpio
      String errorMessage = e.toString();
      if (errorMessage.startsWith('Exception: ')) {
        errorMessage = errorMessage.substring(11);
      }

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              const Icon(Icons.error_outline, color: Colors.white),
              const SizedBox(width: 12),
              Expanded(child: Text(errorMessage)),
            ],
          ),
          backgroundColor: Colors.red,
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  void _showSaveDialog() {
    final nameController = TextEditingController();
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: SportsConstants.darkBackground,
        title: const Text('Guardar Cupón'),
        content: TextField(
          controller: nameController,
          decoration: const InputDecoration(
            hintText: 'Nombre del cupón',
            fillColor: Colors.black26,
            filled: true,
          ),
          autofocus: true,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancelar'),
          ),
          ElevatedButton(
            onPressed: () {
              if (nameController.text.isNotEmpty) {
                _betSlip.saveBetSlip(nameController.text);
                Navigator.pop(context);
                ScaffoldMessenger.of(
                  context,
                ).showSnackBar(const SnackBar(content: Text('Cupón guardado')));
              }
            },
            child: const Text('Guardar'),
          ),
        ],
      ),
    );
  }

  void _showShareDialog() {
    final code = _betSlip.generateShareCode();
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: SportsConstants.darkBackground,
        title: const Text('Compartir Cupón'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('Código del cupón:', style: SportsConstants.captionStyle),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.black26,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                code,
                style: const TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 4,
                  color: Colors.white,
                ),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              Clipboard.setData(ClipboardData(text: code));
              Navigator.pop(context);
              ScaffoldMessenger.of(
                context,
              ).showSnackBar(const SnackBar(content: Text('Código copiado')));
            },
            child: const Text('Copiar'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cerrar'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        gradient: SportsConstants.darkGradient,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: ListenableBuilder(
        listenable: _betSlip,
        builder: (context, _) {
          return Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Header profesional
              BetSlipHeader(
                selectionsCount: _betSlip.itemCount,
                totalOdds: _betSlip.totalOdds,
                potentialWin: _betSlip.potentialWin,
                stake: _betSlip.betAmount,
                onClose: () => Navigator.pop(context),
                onClear: _betSlip.itemCount > 0
                    ? () {
                        HapticFeedback.lightImpact();
                        _betSlip.clearAll();
                      }
                    : null,
              ),

              // Tab Bar
              if (_betSlip.isNotEmpty || _betSlip.betHistory.isNotEmpty)
                Container(
                  color: SportsConstants.darkBackground,
                  child: TabBar(
                    controller: _tabController,
                    indicatorColor: SportsConstants.primaryGold,
                    labelColor: SportsConstants.primaryGold,
                    unselectedLabelColor: SportsConstants.textSecondary,
                    tabs: [
                      Tab(
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.receipt, size: 18),
                            const SizedBox(width: 6),
                            Flexible(
                              child: Text(
                                'Cupón (${_betSlip.itemCount})',
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ],
                        ),
                      ),
                      Tab(
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.history, size: 18),
                            const SizedBox(width: 6),
                            Flexible(
                              child: Text(
                                'Historial (${_betSlip.betHistory.length})',
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ],
                        ),
                      ),
                      Tab(
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.bookmark, size: 18),
                            const SizedBox(width: 6),
                            Flexible(
                              child: Text(
                                'Guardados (${_betSlip.savedBetsCount})',
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),

              // Tab Bar View
              Flexible(
                child: (_betSlip.isNotEmpty || _betSlip.betHistory.isNotEmpty)
                    ? TabBarView(
                        controller: _tabController,
                        children: [
                          _buildBetSlipTab(),
                          _buildHistoryTab(),
                          _buildSavedTab(),
                        ],
                      )
                    : _buildEmptyState(),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildEmptyState() {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 60),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            Icons.sports_soccer,
            size: 80,
            color: SportsConstants.textTertiary,
          ),
          const SizedBox(height: 24),
          Text('No hay selecciones', style: SportsConstants.titleStyle),
          const SizedBox(height: 8),
          Text(
            'Selecciona cuotas para agregar al cupón',
            style: SportsConstants.captionStyle,
          ),
        ],
      ),
    );
  }

  Widget _buildBetSlipTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(SportsConstants.paddingLarge),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Controles superiores
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              // Toggle vista compacta
              Flexible(
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      Icons.view_compact,
                      size: 16,
                      color: SportsConstants.textSecondary,
                    ),
                    const SizedBox(width: 4),
                    Flexible(
                      child: Text(
                        'Compacta',
                        style: SportsConstants.captionStyle,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    Switch(
                      value: _betSlip.isCompactView,
                      onChanged: (_) => _betSlip.toggleCompactView(),
                      activeColor: const Color.fromARGB(255, 0, 156, 81),
                      materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    ),
                  ],
                ),
              ),

              const SizedBox(width: 8),

              // Modo stake
              SegmentedButton<StakeMode>(
                segments: const [
                  ButtonSegment(
                    value: StakeMode.total,
                    label: Text('Total', style: TextStyle(fontSize: 10)),
                    icon: Icon(Icons.money, size: 14),
                  ),
                  ButtonSegment(
                    value: StakeMode.individual,
                    label: Text('Individual', style: TextStyle(fontSize: 10)),
                    icon: Icon(Icons.splitscreen, size: 14),
                  ),
                ],
                selected: {_betSlip.stakeMode},
                onSelectionChanged: (Set<StakeMode> newSelection) {
                  _betSlip.setStakeMode(newSelection.first);
                },
                style: ButtonStyle(
                  backgroundColor: WidgetStateProperty.resolveWith((states) {
                    if (states.contains(WidgetState.selected)) {
                      return const Color.fromARGB(255, 0, 156, 81);
                    }
                    return SportsConstants.cardBackground;
                  }),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Selector de tipo de apuesta
          BetTypeSelector(
            selectedType: _betSlip.betType,
            onTypeChanged: (type) => _betSlip.setBetType(type),
            selectionsCount: _betSlip.itemCount,
          ),
          const SizedBox(height: 16),

          // Lista de selecciones
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: _betSlip.items.length,
            itemBuilder: (context, index) {
              final item = _betSlip.items[index];
              return SelectionCard(
                item: item,
                isCompactView: _betSlip.isCompactView,
                onRemove: () => _betSlip.removeItem(item.id),
              );
            },
          ),

          // Validación
          if (_betSlip.validationError != null)
            Container(
              margin: const EdgeInsets.only(top: 12, bottom: 12),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.orange.withOpacity(0.2),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.orange),
              ),
              child: Row(
                children: [
                  const Icon(
                    Icons.warning_amber,
                    color: Colors.orange,
                    size: 20,
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      _betSlip.validationError!,
                      style: SportsConstants.captionStyle.copyWith(
                        color: Colors.orange,
                      ),
                    ),
                  ),
                ],
              ),
            ),

          const SizedBox(height: 16),
          _buildStakeSection(),
          const SizedBox(height: 16),
          _buildActionButtons(),
        ],
      ),
    );
  }

  Widget _buildHistoryTab() {
    return Column(
      children: [
        // Filtro
        Padding(
          padding: const EdgeInsets.symmetric(
            horizontal: SportsConstants.paddingLarge,
            vertical: 8,
          ),
          child: Row(
            children: [
              Text('Estado:', style: SportsConstants.bodyStyle),
              const SizedBox(width: 12),
              Expanded(
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  decoration: BoxDecoration(
                    color: SportsConstants.cardBackground,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.white24),
                  ),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<String?>(
                      value: _historyFilter,
                      dropdownColor: SportsConstants.cardBackground,
                      isExpanded: true,
                      icon: const Icon(
                        Icons.arrow_drop_down,
                        color: Colors.white,
                      ),
                      style: SportsConstants.bodyStyle,
                      items: const [
                        DropdownMenuItem(value: null, child: Text('Todos')),
                        DropdownMenuItem(
                          value: 'pendiente',
                          child: Text('Pendientes'),
                        ),
                        DropdownMenuItem(
                          value: 'ganada',
                          child: Text('Ganadas'),
                        ),
                        DropdownMenuItem(
                          value: 'perdida',
                          child: Text('Perdidas'),
                        ),
                      ],
                      onChanged: (value) {
                        setState(() => _historyFilter = value);
                        _loadHistory();
                      },
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),

        // Lista
        Expanded(
          child: _isLoadingHistory
              ? Center(
                  child: CircularProgressIndicator(
                    color: SportsConstants.primaryGreen,
                  ),
                )
              : _historyBets.isEmpty
              ? Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        Icons.history,
                        size: 64,
                        color: SportsConstants.textTertiary,
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'Sin historial',
                        style: SportsConstants.subtitleStyle,
                      ),
                    ],
                  ),
                )
              : ListView.builder(
                  padding: const EdgeInsets.all(SportsConstants.paddingLarge),
                  itemCount: _historyBets.length,
                  itemBuilder: (context, index) {
                    final bet = _historyBets[index];
                    return _buildHistoryCard(bet);
                  },
                ),
        ),
      ],
    );
  }

  Widget _buildSavedTab() {
    if (_betSlip.savedBets.isEmpty) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.bookmark_border,
              size: 64,
              color: SportsConstants.textTertiary,
            ),
            const SizedBox(height: 16),
            Text('Sin cupones guardados', style: SportsConstants.subtitleStyle),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(SportsConstants.paddingLarge),
      itemCount: _betSlip.savedBets.length,
      itemBuilder: (context, index) {
        final saved = _betSlip.savedBets[index];
        return _buildSavedBetCard(saved);
      },
    );
  }

  Widget _buildStakeSection() {
    if (_betSlip.stakeMode == StakeMode.individual) {
      return const SizedBox.shrink();
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Quick amounts
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: BetSlipService.quickAmounts.map((amount) {
            final isSelected = _betSlip.betAmount == amount;
            return ElevatedButton(
              onPressed: () {
                HapticFeedback.selectionClick();
                _betSlip.setQuickAmount(amount);
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: isSelected
                    ? SportsConstants.primaryGreen
                    : SportsConstants.cardBackground,
                foregroundColor: isSelected
                    ? Colors.white
                    : SportsConstants.textSecondary,
                padding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 10,
                ),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              child: Text(
                '${_betSlip.currencySymbol} ${amount.toStringAsFixed(0)}',
              ),
            );
          }).toList(),
        ),
        const SizedBox(height: 12),

        // Input stake
        TextField(
          controller: _amountController,
          keyboardType: TextInputType.number,
          onChanged: _updateAmount,
          decoration: InputDecoration(
            labelText: 'Monto Total',
            prefixText: '${_betSlip.currencySymbol} ',
            filled: true,
            fillColor: SportsConstants.cardBackground,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(SportsConstants.buttonRadius),
            ),
          ),
          style: SportsConstants.titleStyle,
        ),
      ],
    );
  }

  Widget _buildActionButtons() {
    return Column(
      children: [
        // Resumen
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [
                SportsConstants.primaryGreen.withOpacity(0.15),
                SportsConstants.darkGold.withOpacity(0.15),
              ],
            ),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: SportsConstants.primaryGold.withOpacity(0.4),
              width: 2,
            ),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Ganancia Potencial', style: SportsConstants.bodyStyle),
                  const SizedBox(height: 4),
                  Text(
                    '${_betSlip.currencySymbol}${_betSlip.potentialWin.toStringAsFixed(0)}',
                    style: const TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                      color: SportsConstants.lightGreen,
                    ),
                  ),
                ],
              ),
              Icon(
                Icons.trending_up,
                size: 40,
                color: SportsConstants.primaryGold,
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),

        // Botones de acción
        Row(
          children: [
            Expanded(
              child: OutlinedButton.icon(
                onPressed: _betSlip.isNotEmpty ? _showSaveDialog : null,
                icon: const Icon(Icons.bookmark_border, size: 18),
                label: const Text('Guardar'),
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  side: BorderSide(color: SportsConstants.primaryGold),
                  foregroundColor: SportsConstants.primaryGold,
                ),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: OutlinedButton.icon(
                onPressed: _betSlip.isNotEmpty ? _showShareDialog : null,
                icon: const Icon(Icons.share, size: 18),
                label: const Text('Compartir'),
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  side: BorderSide(color: SportsConstants.primaryGold),
                  foregroundColor: SportsConstants.primaryGold,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),

        // Botón principal
        SizedBox(
          width: double.infinity,
          height: 56,
          child: ElevatedButton(
            onPressed: _betSlip.canPlaceBet && !_isPlacing ? _placeBet : null,
            style: ElevatedButton.styleFrom(
              backgroundColor: SportsConstants.primaryGreen,
              foregroundColor: Colors.white,
              disabledBackgroundColor: SportsConstants.textTertiary,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              elevation: _betSlip.canPlaceBet ? 8 : 0,
            ),
            child: _isPlacing
                ? const CircularProgressIndicator(color: Colors.white)
                : const Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      SizedBox(width: 12),
                      Text(
                        'Realizar Apuesta',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
          ),
        ),
      ],
    );
  }

  Widget _buildHistoryCard(Map<String, dynamic> bet) {
    final estado = bet['estado'] ?? 'pendiente';
    final isWon = estado == 'ganada';
    final isPending = estado == 'pendiente';

    Color statusColor;
    IconData statusIcon;

    switch (estado) {
      case 'ganada':
        statusColor = SportsConstants.primaryGreen;
        statusIcon = Icons.check_circle;
        break;
      case 'perdida':
        statusColor = Colors.red;
        statusIcon = Icons.cancel;
        break;
      default:
        statusColor = Colors.orange;
        statusIcon = Icons.access_time_filled;
    }

    final selecciones = (bet['selecciones'] as List)
        .cast<Map<String, dynamic>>();
    final isSimple = bet['tipo'] == 'simple' && selecciones.isNotEmpty;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: SportsConstants.cardBackground,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: statusColor.withOpacity(0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: statusColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Row(
                  children: [
                    Icon(statusIcon, size: 12, color: statusColor),
                    const SizedBox(width: 4),
                    Text(
                      estado.toString().toUpperCase(),
                      style: TextStyle(
                        color: statusColor,
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
              Text(
                '${_betSlip.currencySymbol}${bet['monto']}',
                style: const TextStyle(color: Colors.white70, fontSize: 12),
              ),
            ],
          ),
          const SizedBox(height: 8),
          if (isSimple) ...[
            Text(
              selecciones[0]['seleccionDisplay'] ?? 'Selección',
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
                fontSize: 14,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            Text(
              selecciones[0]['eventoNombre'] ?? 'Evento',
              style: const TextStyle(color: Colors.white54, fontSize: 12),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ] else ...[
            Text(
              'Apuesta Combinada (${selecciones.length})',
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
                fontSize: 14,
              ),
            ),
          ],
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Cuota: ${bet['cuotaTotal'].toStringAsFixed(2)}',
                style: TextStyle(
                  color: SportsConstants.primaryGold,
                  fontSize: 12,
                ),
              ),
              Text(
                'Ganancia: ${_betSlip.currencySymbol}${bet['gananciaPotencial']}',
                style: TextStyle(
                  color: isWon
                      ? SportsConstants.primaryGreen
                      : (isPending ? Colors.white : Colors.white54),
                  fontWeight: FontWeight.bold,
                  fontSize: 12,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSavedBetCard(SavedBet saved) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: SportsConstants.cardBackground,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: SportsConstants.primaryGold.withOpacity(0.3)),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  saved.name,
                  style: SportsConstants.bodyStyle.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  '${saved.selections.length} selecciones • ${_betSlip.currencySymbol}${saved.stake.toStringAsFixed(0)}',
                ),
              ],
            ),
          ),
          IconButton(
            onPressed: () {
              _betSlip.loadSavedBet(saved.id);
              _tabController.animateTo(0); // Cambiar a la pestaña "Cupón"
              HapticFeedback.mediumImpact();
            },
            icon: const Icon(Icons.play_arrow),
            color: SportsConstants.primaryGreen,
          ),
          IconButton(
            onPressed: () => _betSlip.removeSavedBet(saved.id),
            icon: const Icon(Icons.delete_outline),
            color: Colors.red,
          ),
        ],
      ),
    );
  }
}

/// Función helper para mostrar el bottom sheet del cupón
void showBetSlipBottomSheet(BuildContext context) {
  showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (context) => DraggableScrollableSheet(
      initialChildSize: 0.75,
      minChildSize: 0.5,
      maxChildSize: 0.95,
      builder: (context, scrollController) => const BetSlipBottomSheet(),
    ),
  );
}
