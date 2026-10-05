// lib/main.dart → VERSIÓN FINAL QUE SÍ FUNCIONA

import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'features/auth/screens/login_screen.dart';
import 'features/auth/services/auth_service.dart';
import 'features/home/home_screen_with_shake.dart';
// SERVICIOS
import 'core/services/shake_service.dart';
import 'core/services/proximity_service.dart';
import 'features/deposit/services/notification_service.dart';

// CONTROLADOR GLOBAL
final ValueNotifier<int> bottomNavIndex = ValueNotifier<int>(0);

class MyHttpOverrides extends HttpOverrides {
  @override
  HttpClient createHttpClient(SecurityContext? context) {
    return super.createHttpClient(context)
      ..badCertificateCallback =
          (X509Certificate cert, String host, int port) => true;
  }
}

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  HttpOverrides.global = MyHttpOverrides();

  // Inicializar notificaciones
  await NotificationService().init();

  final prefs = await SharedPreferences.getInstance();
  final isLoggedIn = prefs.getBool('isLoggedIn') ?? false;

  runApp(MyApp(isLoggedIn: isLoggedIn));
}

class MyApp extends StatefulWidget {
  final bool isLoggedIn;
  const MyApp({super.key, required this.isLoggedIn});

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> with WidgetsBindingObserver {
  static final GlobalKey<NavigatorState> navigatorKey =
      GlobalKey<NavigatorState>();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _initSensors();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _stopSensors();
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    debugPrint('🔄 AppLifecycleState changed to: $state');
    if (state == AppLifecycleState.resumed) {
      _initSensors();
    } else if (state == AppLifecycleState.paused ||
        state == AppLifecycleState.detached) {
      _stopSensors();
    }
  }

  void _initSensors() {
    debugPrint('📡 Iniciando sensores...');

    // SHAKE → siguiente pestaña + vibración
    ShakeService().startListening(() {
      debugPrint('🔄 Shake callback ejecutado');
      final next = (bottomNavIndex.value + 1) % 5;
      debugPrint('🔄 Cambiando de ${bottomNavIndex.value} → $next');
      bottomNavIndex.value = next;
      debugPrint('🔄 bottomNavIndex actualizado a: ${bottomNavIndex.value}');

      // Vibración al cambiar de pantalla
      HapticFeedback.mediumImpact();
    });

    // PROXIMIDAD → vibración continua + cierre a los 5 segundos
    ProximityService().startListening(() async {
      final context = navigatorKey.currentContext;
      if (context == null || !context.mounted) return;

      // Usar logout selectivo para preservar configuración biométrica
      await AuthService.logout();

      if (!context.mounted) return;

      Navigator.of(context).pushAndRemoveUntil(
        MaterialPageRoute(builder: (_) => const LoginScreen()),
        (route) => false,
      );
    });
  }

  void _stopSensors() {
    debugPrint('🛑 Deteniendo sensores...');
    ShakeService().stopListening();
    ProximityService().stopListening();
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      navigatorKey: navigatorKey,
      debugShowCheckedModeBanner: false,
      title: 'Trifobet',
      theme: ThemeData(
        scaffoldBackgroundColor: Colors.black,
        colorScheme: ColorScheme.fromSeed(
          seedColor: Colors.green,
          brightness: Brightness.dark,
        ),
        useMaterial3: true,
      ),
      home: widget.isLoggedIn
          ? const HomeScreenWithShakeSupport()
          : const LoginScreen(),
    );
  }
}
