import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../constants.dart';
import '../models/bet_slip_item.dart';
import '../services/bet_slip_service.dart';

/// Botón de apuesta rápida que agrega una selección al cupón con un solo tap
class QuickBetButton extends StatefulWidget {
  final BetSlipItem item;
  final double odds;

  const QuickBetButton({super.key, required this.item, required this.odds});

  @override
  State<QuickBetButton> createState() => _QuickBetButtonState();
}

class _QuickBetButtonState extends State<QuickBetButton>
    with SingleTickerProviderStateMixin {
  final BetSlipService _betSlip = BetSlipService();
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 200),
      vsync: this,
    );
    _scaleAnimation = Tween<double>(
      begin: 1.0,
      end: 0.9,
    ).animate(CurvedAnimation(parent: _controller, curve: Curves.easeInOut));
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _onTap() {
    // Vibración háptica
    HapticFeedback.lightImpact();

    // Animación
    _controller.forward().then((_) => _controller.reverse());

    // Agrega al cupón
    _betSlip.toggleItem(widget.item);

    // Feedback visual
    if (_betSlip.hasItem(widget.item.id)) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              const Icon(Icons.check_circle, color: Colors.white, size: 20),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  'Agregado al cupón',
                  style: SportsConstants.bodyStyle,
                ),
              ),
            ],
          ),
          backgroundColor: SportsConstants.primaryGreen,
          behavior: SnackBarBehavior.floating,
          duration: const Duration(milliseconds: 1500),
          margin: const EdgeInsets.only(bottom: 80, left: 16, right: 16),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: _betSlip,
      builder: (context, _) {
        final isSelected = _betSlip.hasItem(widget.item.id);

        return ScaleTransition(
          scale: _scaleAnimation,
          child: InkWell(
            onTap: _onTap,
            borderRadius: BorderRadius.circular(8),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                gradient: isSelected
                    ? LinearGradient(
                        colors: [
                          SportsConstants.primaryGreen,
                          SportsConstants.darkGreen,
                        ],
                      )
                    : null,
                color: isSelected
                    ? null
                    : SportsConstants.darkGreen.withOpacity(0.3),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(
                  color: isSelected
                      ? SportsConstants.lightGreen
                      : SportsConstants.primaryGreen.withOpacity(0.5),
                  width: isSelected ? 2 : 1,
                ),
                boxShadow: isSelected
                    ? [
                        BoxShadow(
                          color: SportsConstants.primaryGreen.withOpacity(0.3),
                          blurRadius: 8,
                          spreadRadius: 1,
                        ),
                      ]
                    : null,
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (isSelected)
                    const Icon(
                      Icons.check_circle,
                      size: 14,
                      color: Colors.white,
                    )
                  else
                    const Icon(
                      Icons.add_circle_outline,
                      size: 14,
                      color: SportsConstants.lightGreen,
                    ),
                  const SizedBox(width: 4),
                  Text(
                    widget.odds.toStringAsFixed(2),
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}
