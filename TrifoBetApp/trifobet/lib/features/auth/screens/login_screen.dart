import 'dart:async';
import 'package:flutter/material.dart';

import 'package:trifobet/features/auth/screens/register_screen.dart';
import 'package:trifobet/features/auth/screens/recovery_screen.dart';
import 'package:trifobet/features/home/home_screen_with_shake.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import '../services/auth_service.dart';
import '../services/biometric_service.dart';
import 'package:geolocator/geolocator.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isLoading = false;
  String? _errorMessage;
  Timer? _errorTimer;
  bool _biometricAvailable = false;
  bool _biometricEnabled = false;

  @override
  void initState() {
    super.initState();
    _usernameController.addListener(_clearErrorOnTyping);
    _passwordController.addListener(_clearErrorOnTyping);
    _checkBiometric();
  }

  Future<void> _checkBiometric() async {
    final available = await BiometricService.isBiometricAvailable();
    final enabled = await BiometricService.isBiometricEnabled();
    setState(() {
      _biometricAvailable = available;
      _biometricEnabled = enabled;
    });
  }

  void _clearErrorOnTyping() {
    if (_errorMessage != null) {
      setState(() => _errorMessage = null);
      _errorTimer?.cancel();
    }
  }

  void _showError(String message) {
    setState(() => _errorMessage = message);
    _errorTimer?.cancel();
    _errorTimer = Timer(const Duration(seconds: 3), () {
      if (mounted) setState(() => _errorMessage = null);
    });
  }

  Future<void> _login() async {
    final identifier = _usernameController.text.trim();
    final password = _passwordController.text.trim();

    if (identifier.isEmpty || password.isEmpty) {
      _showError('Por favor completa todos los campos');
      return;
    }

    setState(() => _isLoading = true);

    try {
      // 1. Verificar permisos de ubicación
      bool serviceEnabled;
      LocationPermission permission;

      serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        throw 'Por favor activa la ubicación del dispositivo';
      }

      permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          throw 'Necesitamos tu ubicación para iniciar sesión';
        }
      }

      if (permission == LocationPermission.deniedForever) {
        throw 'Habilita los permisos de ubicación en Configuración';
      }

      // 2. Obtener ubicación y verificar con API
      final position = await Geolocator.getCurrentPosition();
      final isAllowed = await AuthService.verifyLocation(
        position.latitude,
        position.longitude,
      );

      if (!isAllowed) {
        throw 'El App solo está disponible en Bolivia';
      }

      // 3. Proceder con login
      final result = await AuthService.login(identifier, password);

      if (!mounted) return;

      if (result['success'] == true) {
        // ¡LOGIN EXITOSO!
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('¡Bienvenido de vuelta!'),
            backgroundColor: Colors.green,
            duration: Duration(seconds: 1),
          ),
        );

        Navigator.pushAndRemoveUntil(
          context,
          MaterialPageRoute(builder: (_) => const HomeScreenWithShakeSupport()),
          (route) =>
              false, // Borra toda la pila → no puede volver al login con back
        );
      } else {
        _showError(result['error'] ?? 'Credenciales inválidas');
      }
    } catch (e) {
      if (!mounted) return;
      _showError(e.toString().replaceAll('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _loginWithBiometric() async {
    setState(() => _isLoading = true);

    try {
      final credentials = await BiometricService.authenticateWithBiometric();

      if (credentials == null) {
        if (mounted) {
          _showError('Autenticación biométrica cancelada');
        }
        return;
      }

      // 1. Verificar ubicación antes de login
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        if (mounted) _showError('Activa la ubicación');
        return;
      }

      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          if (mounted) _showError('Permiso de ubicación denegado');
          return;
        }
      }

      if (permission == LocationPermission.deniedForever) {
        if (mounted) _showError('Habilita ubicación en Configuración');
        return;
      }

      final position = await Geolocator.getCurrentPosition();
      final isAllowed = await AuthService.verifyLocation(
        position.latitude,
        position.longitude,
      );

      if (!isAllowed) {
        if (mounted) _showError('Servicio solo en Bolivia');
        return;
      }

      // Usar credenciales para login
      final result = await AuthService.login(
        credentials['username']!,
        credentials['password']!,
      );

      if (!mounted) return;

      if (result['success'] == true) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('¡Bienvenido de vuelta!'),
            backgroundColor: Colors.green,
            duration: Duration(seconds: 1),
          ),
        );

        Navigator.pushAndRemoveUntil(
          context,
          MaterialPageRoute(builder: (_) => const HomeScreenWithShakeSupport()),
          (route) => false,
        );
      } else {
        // Credenciales inválidas, desactivar biométrico
        await BiometricService.disableBiometric();
        setState(() => _biometricEnabled = false);
        _showError('Credenciales expiradas. Inicia sesión nuevamente.');
      }
    } catch (e) {
      if (!mounted) return;
      _showError('Error al autenticar con huella');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;
    final isLargeScreen = size.height > 700;

    return Scaffold(
      extendBodyBehindAppBar: true,
      body: Stack(
        children: [
          // === FONDO ===
          Container(
            width: double.infinity,
            height: double.infinity,
            child: Image.asset(
              'assets/images/fondo_login.png',
              fit: BoxFit.cover,
            ),
          ),

          // === OVERLAY ===
          Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  Colors.black.withOpacity(0.8),
                  Colors.black.withOpacity(0.6),
                  const Color.fromARGB(45, 0, 0, 0).withOpacity(0.9),
                ],
              ),
            ),
          ),

          // === CONTENIDO RESPONSIVO ===
          SafeArea(
            child: LayoutBuilder(
              builder: (context, constraints) {
                return SingleChildScrollView(
                  padding: EdgeInsets.symmetric(
                    horizontal: size.width * 0.1,
                    vertical: 20,
                  ),
                  child: ConstrainedBox(
                    constraints: const BoxConstraints(maxWidth: 420),
                    child: Column(
                      children: [
                        // === TÍTULO ARRIBA ===
                        SizedBox(
                          height: isLargeScreen ? size.height * 0.12 : 60,
                        ),

                        const Text(
                          'TrifoBet',
                          style: TextStyle(
                            fontSize: 56,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF00FF88),
                            letterSpacing: 3,
                            height: 1.1,
                          ),
                        ),
                        const SizedBox(height: 8),
                        const Text(
                          'Inicia sesión y empieza a ganar',
                          style: TextStyle(
                            fontSize: 16,
                            color: Colors.white70,
                            fontWeight: FontWeight.w300,
                          ),
                        ),

                        // === ESPACIO ANTES DEL FORMULARIO ===
                        SizedBox(
                          height: isLargeScreen ? size.height * 0.12 : 90,
                        ),

                        // === CAMPOS (SIN CARD, LIMPIOS) ===
                        _buildTextField(
                          controller: _usernameController,
                          label: 'Nombre de usuario',
                          icon: FontAwesomeIcons.user,
                        ),
                        const SizedBox(height: 20),
                        _buildTextField(
                          controller: _passwordController,
                          label: 'Contraseña',
                          icon: FontAwesomeIcons.lock,
                          obscureText: true,
                        ),
                        const SizedBox(height: 24),

                        // Botón
                        SizedBox(
                          width: double.infinity,
                          height: 56,
                          child: ElevatedButton(
                            onPressed: _isLoading ? null : _login,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF00FF88),
                              foregroundColor: Colors.black,
                              elevation: 8,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(14),
                              ),
                            ),
                            child: _isLoading
                                ? const SizedBox(
                                    height: 24,
                                    width: 24,
                                    child: CircularProgressIndicator(
                                      color: Colors.black,
                                      strokeWidth: 2.5,
                                    ),
                                  )
                                : const Text(
                                    'INICIAR SESIÓN',
                                    style: TextStyle(
                                      fontSize: 18,
                                      fontWeight: FontWeight.bold,
                                      letterSpacing: 1.5,
                                    ),
                                  ),
                          ),
                        ),

                        // Botón de huella centrado (solo si está disponible y habilitado)
                        if (_biometricAvailable && _biometricEnabled) ...[
                          const SizedBox(height: 20),
                          Center(
                            child: Container(
                              width: 60,
                              height: 60,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                gradient: LinearGradient(
                                  colors: [
                                    const Color(0xFF00FF88),
                                    const Color(0xFF00DD70),
                                  ],
                                ),
                                boxShadow: [
                                  BoxShadow(
                                    color: const Color(
                                      0xFF00FF88,
                                    ).withOpacity(0.4),
                                    blurRadius: 12,
                                    offset: const Offset(0, 4),
                                  ),
                                ],
                              ),
                              child: Material(
                                color: Colors.transparent,
                                child: InkWell(
                                  onTap: _isLoading
                                      ? null
                                      : _loginWithBiometric,
                                  borderRadius: BorderRadius.circular(30),
                                  child: const Center(
                                    child: Icon(
                                      Icons.fingerprint,
                                      size: 36,
                                      color: Colors.black,
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ],

                        // Error (sin card, solo fondo suave)
                        if (_errorMessage != null)
                          Padding(
                            padding: const EdgeInsets.only(top: 16),
                            child: AnimatedOpacity(
                              opacity: 1.0,
                              duration: const Duration(milliseconds: 300),
                              child: Container(
                                width: double.infinity,
                                padding: const EdgeInsets.symmetric(
                                  vertical: 12,
                                  horizontal: 16,
                                ),
                                decoration: BoxDecoration(
                                  color: Colors.red.withOpacity(0.15),
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(
                                    color: Colors.redAccent,
                                    width: 1.2,
                                  ),
                                ),
                                child: Row(
                                  children: [
                                    const Icon(
                                      FontAwesomeIcons.circleXmark,
                                      color: Colors.redAccent,
                                      size: 18,
                                    ),
                                    const SizedBox(width: 10),
                                    Expanded(
                                      child: Text(
                                        _errorMessage!,
                                        style: const TextStyle(
                                          color: Colors.white,
                                          fontSize: 14,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),

                        // === ESPACIO INFERIOR + ENLACES ===
                        SizedBox(
                          height: isLargeScreen ? size.height * 0.1 : 60,
                        ),

                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            TextButton(
                              onPressed: () => Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (_) => const RegisterScreen(),
                                ),
                              ),
                              child: const Text(
                                'Registrarse',
                                style: TextStyle(
                                  color: Color(0xFF00FF88),
                                  fontSize: 15,
                                ),
                              ),
                            ),
                            const Text(
                              ' • ',
                              style: TextStyle(color: Colors.white60),
                            ),
                            TextButton(
                              onPressed: () => Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (_) => const RecoveryScreen(),
                                ),
                              ),
                              child: const Text(
                                'Recuperar cuenta',
                                style: TextStyle(
                                  color: Color(0xFF00FF88),
                                  fontSize: 15,
                                ),
                              ),
                            ),
                          ],
                        ),

                        const SizedBox(height: 40),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required IconData icon,
    bool obscureText = false,
  }) {
    return TextField(
      controller: controller,
      obscureText: obscureText,
      style: const TextStyle(color: Colors.white, fontSize: 16),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: const TextStyle(color: Colors.white70),
        prefixIcon: Icon(
          icon,
          color: const Color.fromARGB(255, 255, 255, 255),
          size: 22,
        ),
        filled: true,
        fillColor: Colors.white.withOpacity(0.08),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: Color(0xFF00FF88), width: 1.5),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: Color(0xFF00FF88), width: 2.5),
        ),
        contentPadding: const EdgeInsets.symmetric(
          vertical: 18,
          horizontal: 16,
        ),
      ),
    );
  }

  @override
  void dispose() {
    _usernameController.removeListener(_clearErrorOnTyping);
    _passwordController.removeListener(_clearErrorOnTyping);
    _usernameController.dispose();
    _passwordController.dispose();
    _errorTimer?.cancel();
    super.dispose();
  }
}
