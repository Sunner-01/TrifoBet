import 'dart:async';
import 'package:flutter/material.dart';

class LiveMatchTimer extends StatefulWidget {
  final String initialMinute;
  final TextStyle? style;
  final bool isLive;

  const LiveMatchTimer({
    super.key,
    required this.initialMinute,
    required this.isLive,
    this.style,
  });

  @override
  State<LiveMatchTimer> createState() => _LiveMatchTimerState();
}

class _LiveMatchTimerState extends State<LiveMatchTimer> {
  late int _currentMinute;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _parseMinute();
    if (widget.isLive) {
      _startTimer();
    }
  }

  @override
  void didUpdateWidget(LiveMatchTimer oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.initialMinute != oldWidget.initialMinute) {
      _syncMinute();
    }
    if (widget.isLive != oldWidget.isLive) {
      if (widget.isLive) {
        _startTimer();
      } else {
        _timer?.cancel();
      }
    }
  }

  void _parseMinute() {
    final cleanMinute = widget.initialMinute.replaceAll(RegExp(r'[^0-9]'), '');
    _currentMinute = int.tryParse(cleanMinute) ?? 0;
  }

  void _syncMinute() {
    final cleanMinute = widget.initialMinute.replaceAll(RegExp(r'[^0-9]'), '');
    final serverMinute = int.tryParse(cleanMinute) ?? 0;

    // Solo actualizamos si el servidor nos da un minuto MAYOR al que tenemos simulado
    // Esto evita que el tiempo "retroceda" si el servidor tarda en actualizarse
    if (serverMinute > _currentMinute) {
      setState(() {
        _currentMinute = serverMinute;
      });
    }
  }

  void _startTimer() {
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 60), (timer) {
      if (mounted) {
        setState(() {
          // Simplemente incrementamos el minuto
          // Podríamos poner un límite como 45 o 90, pero el usuario quiere simulación simple
          _currentMinute++;
        });
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // Si no es live, mostramos el texto original (probablemente fecha/hora)
    // Pero este widget se usa específicamente para el minuto live.
    // Asumiremos que si se usa este widget es para mostrar minutos.

    // Formato especial para 45+ o 90+ si fuera necesario, pero por ahora simple:
    return Text("$_currentMinute'", style: widget.style);
  }
}
