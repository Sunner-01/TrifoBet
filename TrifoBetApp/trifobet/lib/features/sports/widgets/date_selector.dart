import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../constants.dart';

class DateSelector extends StatelessWidget {
  final List<String> dates;
  final String selectedDate;
  final ValueChanged<String> onDateSelected;

  const DateSelector({
    super.key,
    required this.dates,
    required this.selectedDate,
    required this.onDateSelected,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 50,
      color: SportsConstants.darkBackground,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: dates.length,
        itemBuilder: (context, index) {
          final date = dates[index];
          final isSelected = date == selectedDate;
          final label = _formatDate(date);

          return GestureDetector(
            onTap: () => onDateSelected(date),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              decoration: BoxDecoration(
                border: Border(
                  bottom: BorderSide(
                    color: isSelected
                        ? SportsConstants.primaryGold
                        : Colors.transparent,
                    width: 3,
                  ),
                ),
              ),
              child: Text(
                label.toUpperCase(),
                style: TextStyle(
                  color: isSelected
                      ? SportsConstants.primaryGold
                      : SportsConstants.textSecondary,
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  String _formatDate(String dateStr) {
    final date = DateTime.parse(dateStr);
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final checkDate = DateTime(date.year, date.month, date.day);

    if (checkDate == today) return 'Hoy';
    if (checkDate == today.add(const Duration(days: 1))) return 'Mañana';

    // Formato simple: DD/MM (Ejemplo: 10/12)
    return '${date.day.toString().padLeft(2, '0')}/${date.month.toString().padLeft(2, '0')}';
  }
}
