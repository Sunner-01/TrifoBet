import 'package:flutter/material.dart';

class AmountChip extends StatelessWidget {
  final double amount;
  final bool isSelected;
  final VoidCallback onTap;

  const AmountChip({
    super.key,
    required this.amount,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    // Colores tipo ficha de casino
    Color chipColor;
    Color borderColor;

    if (amount <= 50) {
      chipColor = const Color(0xFF00FF88); // Verde
      borderColor = const Color(0xFF00CC6A);
    } else if (amount <= 200) {
      chipColor = const Color(0xFF448AFF); // Azul
      borderColor = const Color(0xFF2962FF);
    } else if (amount <= 500) {
      chipColor = const Color(0xFFFFD700); // Dorado
      borderColor = const Color(0xFFFFA000);
    } else {
      chipColor = const Color(0xFFFF3366); // Rojo/Rosa
      borderColor = const Color(0xFFD50000);
    }

    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        width: 80,
        height: 80,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          gradient: isSelected
              ? RadialGradient(
                  colors: [chipColor, borderColor],
                  center: Alignment.topLeft,
                  radius: 1.2,
                )
              : LinearGradient(
                  colors: [const Color(0xFF2A2A2A), const Color(0xFF1A1A1A)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
          border: Border.all(
            color: isSelected ? Colors.white : chipColor.withOpacity(0.5),
            width: isSelected ? 3 : 2,
          ),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: chipColor.withOpacity(0.6),
                    blurRadius: 16,
                    spreadRadius: 2,
                  ),
                ]
              : [],
        ),
        child: Stack(
          alignment: Alignment.center,
          children: [
            // Decoración interna (anillos de ficha)
            Container(
              width: 60,
              height: 60,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(
                  color: isSelected
                      ? Colors.black.withOpacity(0.2)
                      : Colors.white.withOpacity(0.05),
                  width: 1,
                ),
              ),
            ),
            Container(
              width: 50,
              height: 50,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(
                  color: isSelected
                      ? Colors.black.withOpacity(0.2)
                      : Colors.white.withOpacity(0.05),
                  width: 1, // Dashed effect simulated
                ),
              ),
            ),

            // Texto
            Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  'Bs${amount.toInt()}',
                  style: TextStyle(
                    color: isSelected ? Colors.black : Colors.white,
                    fontWeight: FontWeight.w900,
                    fontSize: 18,
                    shadows: isSelected
                        ? []
                        : [
                            BoxShadow(
                              color: chipColor.withOpacity(0.8),
                              blurRadius: 8,
                            ),
                          ],
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
