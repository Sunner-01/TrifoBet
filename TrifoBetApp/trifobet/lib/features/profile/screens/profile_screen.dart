// lib/features/profile/screens/profile_screen.dart
import 'dart:io';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:trifobet/features/auth/screens/login_screen.dart';
import 'package:trifobet/features/profile/services/profile_service.dart';
import 'package:trifobet/features/profile/widgets/edit_profile_sheet.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:device_info_plus/device_info_plus.dart';
import 'package:trifobet/features/auth/services/biometric_service.dart';
import 'package:trifobet/features/auth/services/auth_service.dart';
import 'package:trifobet/features/deposit/screens/transactions_tab_screen.dart';
import 'package:trifobet/shared/utils/currency_helper.dart';
import 'package:trifobet/features/support/screens/support_screen.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  Map<String, dynamic> userData = {};
  bool isLoading = true;
  bool _notificationsEnabled = true;
  bool _biometricsEnabled = false;

  @override
  void initState() {
    super.initState();
    _loadProfile();
    _loadBiometricState();
  }

  Future<void> _loadBiometricState() async {
    final enabled = await BiometricService.isBiometricEnabled();
    setState(() => _biometricsEnabled = enabled);
  }

  Future<void> _loadProfile() async {
    final data = await ProfileService.getProfile();
    if (data != null) {
      setState(() {
        userData = data;
        isLoading = false;
      });
    } else {
      if (mounted) {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (_) => const LoginScreen()),
        );
      }
    }
  }

  Future<void> _pickAndUploadPhoto() async {
    // Detectar versión de Android y usar el permiso correcto
    Permission permission;
    if (Platform.isAndroid) {
      final androidInfo = await DeviceInfoPlugin().androidInfo;
      if (androidInfo.version.sdkInt >= 33) {
        // Android 13+ → Permission.photos
        permission = Permission.photos;
      } else {
        // Android 12 y menores → Permission.storage
        permission = Permission.storage;
      }
    } else {
      permission = Permission.photos;
    }

    // Pedir permiso
    var status = await permission.request();

    // Si lo negó permanentemente → abrir ajustes
    if (status.isPermanentlyDenied) {
      await openAppSettings();
      return;
    }

    // Si no está concedido → salir
    if (!status.isGranted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text("Necesitamos permiso para acceder a tus fotos"),
        ),
      );
      return;
    }

    // AHORA SÌ ABRIR LA GALERÌA REAL
    final XFile? pickedFile = await ImagePicker().pickImage(
      source: ImageSource.gallery,
      imageQuality: 85,
      maxWidth: 1000,
      maxHeight: 1000,
    );

    if (!mounted) return;
    if (pickedFile == null) return;

    setState(() => isLoading = true);

    final newUrl = await ProfileService.uploadProfilePhoto(
      File(pickedFile.path),
    );

    if (!mounted) return;

    setState(() => isLoading = false);

    if (newUrl != null) {
      userData['foto_perfil_url'] = newUrl;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text("¡Foto actualizada!"),
          backgroundColor: Colors.green,
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text("Error al subir la foto"),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  void _showFullImage() {
    if (userData['foto_perfil_url'] == null) return;

    final String photoUrl = userData['foto_perfil_url'];
    final bool isDefaultPhoto =
        photoUrl.contains('default-avatar') ||
        photoUrl.contains('default') ||
        photoUrl.contains('placeholder');

    showDialog(
      context: context,
      barrierColor: Colors.black.withOpacity(0.95),
      builder: (_) => Dialog(
        backgroundColor: Colors.transparent,
        insetPadding: const EdgeInsets.all(20),
        child: Stack(
          children: [
            // Foto en tamaño completo
            Center(
              child: CachedNetworkImage(
                imageUrl: photoUrl,
                fit: BoxFit.contain,
                placeholder: (_, __) =>
                    const CircularProgressIndicator(color: Color(0xFF00FF88)),
              ),
            ),

            // Botón cerrar
            Positioned(
              top: 40,
              right: 20,
              child: IconButton(
                icon: const Icon(Icons.close, color: Colors.white, size: 34),
                onPressed: () => Navigator.pop(context),
              ),
            ),

            // NUEVO: Botón eliminar (solo si NO es foto predeterminada)
            if (!isDefaultPhoto)
              Positioned(
                bottom: 40,
                left: 0,
                right: 0,
                child: Center(
                  child: GestureDetector(
                    onTap: () async {
                      final confirm = await showDialog<bool>(
                        context: context,
                        builder: (_) => AlertDialog(
                          backgroundColor: const Color.fromARGB(255, 5, 93, 218),
                          title: const Text(
                            "Eliminar foto",
                            style: TextStyle(color: Colors.white),
                          ),
                          content: const Text(
                            "¿Seguro que quieres eliminar tu foto de perfil?",
                            style: TextStyle(color: Colors.white70),
                          ),
                          actions: [
                            TextButton(
                              onPressed: () => Navigator.pop(context, false),
                              child: const Text("Cancelar"),
                            ),
                            TextButton(
                              onPressed: () => Navigator.pop(context, true),
                              child: const Text(
                                "Eliminar",
                                style: TextStyle(color: Colors.red),
                              ),
                            ),
                          ],
                        ),
                      );

                      if (confirm == true && mounted) {
                        Navigator.pop(context); // Cerrar el diálogo de foto
                        setState(() => isLoading = true);

                        final newUrl =
                            await ProfileService.deleteProfilePhoto();

                        if (newUrl != null && mounted) {
                          setState(() {
                            userData['foto_perfil_url'] = newUrl;
                            isLoading = false;
                          });
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text("Foto eliminada"),
                              backgroundColor: Colors.red,
                            ),
                          );
                        } else {
                          setState(() => isLoading = false);
                        }
                      }
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 32,
                        vertical: 14,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.red.withOpacity(0.9),
                        borderRadius: BorderRadius.circular(30),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black45,
                            blurRadius: 10,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            Icons.delete_forever,
                            color: Colors.white,
                            size: 22,
                          ),
                          SizedBox(width: 8),
                          Text(
                            "Eliminar foto",
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Future<void> _logout(BuildContext context) async {
    // Usar el servicio de autenticación que ahora hace logout selectivo
    await AuthService.logout();

    // NO llamar a BiometricService.clearAll() para preservar configuración

    if (!mounted) return;
    Navigator.pushAndRemoveUntil(
      context,
      MaterialPageRoute(builder: (_) => const LoginScreen()),
      (route) => false,
    );
  }

  Future<void> _handleBiometricToggle(bool value) async {
    if (value) {
      // Activar: mostrar dialog para ingresar contraseña
      final result = await _showBiometricSetupDialog();
      if (result == true) {
        setState(() => _biometricsEnabled = true);
      }
    } else {
      // Desactivar
      await BiometricService.disableBiometric();
      setState(() => _biometricsEnabled = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Huella dactilar desactivada'),
            backgroundColor: Colors.orange,
          ),
        );
      }
    }
  }

  Future<bool?> _showBiometricSetupDialog() async {
    final passwordController = TextEditingController();
    return showDialog<bool>(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF1a1a1a),
        title: const Row(
          children: [
            Icon(Icons.fingerprint, color: Color(0xFF00e676)),
            SizedBox(width: 12),
            Text('Activar Huella Dactilar'),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              'Ingresa tu contraseña actual para activar el login con huella dactilar',
              style: TextStyle(color: Colors.white70),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: passwordController,
              obscureText: true,
              style: const TextStyle(color: Colors.white),
              decoration: InputDecoration(
                labelText: 'Contraseña',
                labelStyle: const TextStyle(color: Colors.white60),
                filled: true,
                fillColor: const Color(0xFF0a0a0a),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: Colors.white24),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(
                    color: Color(0xFF00e676),
                    width: 2,
                  ),
                ),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancelar'),
          ),
          ElevatedButton(
            onPressed: () async {
              final password = passwordController.text.trim();
              if (password.isEmpty) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Ingresa tu contraseña')),
                );
                return;
              }

              // Verificar contraseña contra el backend
              try {
                final username = userData['username'] ?? userData['correo'];
                final result = await AuthService.login(username, password);

                if (result['success'] == true) {
                  // Contraseña correcta, activar biométrico
                  final enabled = await BiometricService.enableBiometric(
                    username: username,
                    password: password,
                  );

                  if (!context.mounted) return;

                  if (enabled) {
                    Navigator.pop(context, true);
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('¡Huella dactilar activada!'),
                        backgroundColor: Colors.green,
                      ),
                    );
                  } else {
                    Navigator.pop(context, false);
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text(
                          'No se pudo activar. Verifica que tu dispositivo tenga huella configurada.',
                        ),
                        backgroundColor: Colors.red,
                      ),
                    );
                  }
                } else {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Contraseña incorrecta'),
                      backgroundColor: Colors.red,
                    ),
                  );
                }
              } catch (e) {
                if (context.mounted) {
                  ScaffoldMessenger.of(
                    context,
                  ).showSnackBar(SnackBar(content: Text('Error: $e')));
                }
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF00e676),
              foregroundColor: Colors.black,
            ),
            child: const Text('Activar'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final String fullName =
        "${userData['nombre'] ?? ''} ${userData['apellido1'] ?? ''} ${userData['apellido2'] ?? ''}"
            .trim();
    final String email = userData['correo'] ?? 'usuario@trifobet.com';
    final String? photoUrl = userData['foto_perfil_url'];

    return Scaffold(
      backgroundColor: const Color(0xFF0F1419),
      body: isLoading
          ? const Center(
              child: CircularProgressIndicator(color: Color(0xFF00e676)),
            )
          : CustomScrollView(
              slivers: [
                SliverToBoxAdapter(
                  child: Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [
                          const Color.fromARGB(255, 0, 23, 10),
                          const Color.fromARGB(255, 0, 152, 81),
                        ],
                      ),
                    ),
                    child: SafeArea(
                      child: Padding(
                        padding: const EdgeInsets.all(24.0),
                        child: Column(
                          children: [
                            Stack(
                              children: [
                                GestureDetector(
                                  onTap: photoUrl != null
                                      ? _showFullImage
                                      : null,
                                  child: Container(
                                    decoration: BoxDecoration(
                                      shape: BoxShape.circle,
                                      border: Border.all(
                                        color: Colors.white,
                                        width: 3,
                                      ),
                                      boxShadow: [
                                        BoxShadow(
                                          color: Colors.black.withOpacity(0.3),
                                          blurRadius: 10,
                                          spreadRadius: 2,
                                        ),
                                      ],
                                    ),
                                    child: CircleAvatar(
                                      radius: 50,
                                      backgroundColor: Colors.white,
                                      backgroundImage: photoUrl != null
                                          ? CachedNetworkImageProvider(photoUrl)
                                                as ImageProvider
                                          : null,
                                      child: photoUrl == null
                                          ? const Icon(
                                              Icons.person,
                                              size: 50,
                                              color: Color(0xFF00e676),
                                            )
                                          : null,
                                    ),
                                  ),
                                ),
                                Positioned(
                                  bottom: 0,
                                  right: 0,
                                  child: GestureDetector(
                                    onTap: _pickAndUploadPhoto,
                                    child: Container(
                                      padding: const EdgeInsets.all(8),
                                      decoration: const BoxDecoration(
                                        color: Color(0xFF00e676),
                                        shape: BoxShape.circle,
                                      ),
                                      child: const Icon(
                                        Icons.camera_alt,
                                        color: Colors.black,
                                        size: 18,
                                      ),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 16),
                            Text(
                              fullName.isEmpty ? 'Usuario TrifoBet' : fullName,
                              style: const TextStyle(
                                fontSize: 26,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              email,
                              style: const TextStyle(
                                fontSize: 14,
                                color: Colors.white70,
                              ),
                            ),
                            const SizedBox(height: 20),
                            ElevatedButton.icon(
                              onPressed: () => EditProfileSheet.show(
                                context,
                                userData,
                                _loadProfile,
                              ),
                              icon: const Icon(Icons.edit, color: Colors.black),
                              label: const Text(
                                'Editar Perfil',
                                style: TextStyle(color: Colors.black),
                              ),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.white,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),

                // SALDO
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Container(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [
                            const Color.fromARGB(255, 0, 156, 86),
                            const Color.fromARGB(255, 0, 23, 10),
                          ],
                        ),
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: [
                          BoxShadow(
                            color: const Color.fromARGB(255, 255, 255, 255).withOpacity(0.3),
                            blurRadius: 4,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      padding: const EdgeInsets.all(20),
                      child: Column(
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text(
                                'Saldo disponible',
                                style: TextStyle(
                                  color: Colors.white70,
                                  fontSize: 14,
                                ),
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 8,
                                  vertical: 4,
                                ),
                                decoration: BoxDecoration(
                                  color: Colors.white24,
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: const Text(
                                  'BOB',
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontSize: 12,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Text(
                            '${userData['pais_codigo'] != null ? CurrencyHelper.getSymbol(userData['pais_codigo']) : 'Bs.'} ${userData['saldo']?.toStringAsFixed(2) ?? '0.00'}',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 32,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 16),
                          Row(
                            children: [
                              Expanded(
                                child: ElevatedButton.icon(
                                  onPressed: () {
                                    // Navegar a pestaña de depositar
                                    Navigator.push(
                                      context,
                                      MaterialPageRoute(
                                        builder: (_) =>
                                            const TransactionsTabScreen(
                                              initialIndex: 0,
                                            ),
                                      ),
                                    );
                                  },
                                  icon: const Icon(Icons.add_circle_outline),
                                  label: const Text('Depositar'),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: Colors.white,
                                    foregroundColor: Color(0xFF00c853),
                                    padding: const EdgeInsets.symmetric(
                                      vertical: 12,
                                    ),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(10),
                                    ),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: OutlinedButton.icon(
                                  onPressed: () {
                                    // Navegar a pestaña de retirar
                                    Navigator.push(
                                      context,
                                      MaterialPageRoute(
                                        builder: (_) =>
                                            const TransactionsTabScreen(
                                              initialIndex: 1,
                                            ),
                                      ),
                                    );
                                  },
                                  icon: const Icon(
                                    Icons.arrow_circle_up_outlined,
                                  ),
                                  label: const Text('Retirar'),
                                  style: OutlinedButton.styleFrom(
                                    foregroundColor: Colors.white,
                                    side: const BorderSide(
                                      color: Colors.white,
                                      width: 2,
                                    ),
                                    padding: const EdgeInsets.symmetric(
                                      vertical: 12,
                                    ),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(10),
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                ),

                // TU DISEÑO ORIGINAL COMPLETO (todo lo que tenías antes)
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: _buildStatCard(
                                'Apuestas',
                                '247',
                                Icons.sports_soccer,
                                Colors.blue,
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: _buildStatCard(
                                'Ganadas',
                                '156',
                                Icons.emoji_events,
                                const Color.fromARGB(255, 0, 157, 81),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: _buildStatCard(
                                'Bonus',
                                '${userData['pais_codigo'] != null ? CurrencyHelper.getSymbol(userData['pais_codigo']) : 'Bs.'} 50',
                                Icons.card_giftcard,
                                const Color.fromARGB(255, 183, 78, 199),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 24),
                        _buildSectionTitle('Mi Cuenta'),
                        _buildMenuItem(
                          icon: Icons.person_outline,
                          title: 'Información personal',
                          subtitle: 'Datos personales y verificación',
                          onTap: () => EditProfileSheet.show(
                            context,
                            userData,
                            _loadProfile,
                          ),
                        ),
                        _buildMenuItem(
                          icon: Icons.security,
                          title: 'Seguridad',
                          subtitle: 'Contraseña y autenticación',
                          onTap: () {},
                        ),
                        _buildMenuItem(
                          icon: Icons.verified_user,
                          title: 'Verificación de cuenta',
                          subtitle: 'KYC - Completado',
                          trailing: const Icon(
                            Icons.check_circle,
                            color: Color(0xFF00e676),
                          ),
                          onTap: () {},
                        ),
                        const SizedBox(height: 24),
                        _buildSectionTitle('Soporte y Ayuda'),
                        _buildMenuItem(
                          icon: Icons.headset_mic,
                          title: 'Centro de Ayuda',
                          subtitle: 'Chat en vivo, FAQ y contacto',
                          trailing: Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 4,
                            ),
                            decoration: BoxDecoration(
                              color: const Color(0xFF00e676).withOpacity(0.2),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: const Text(
                              '24/7',
                              style: TextStyle(
                                color: Color(0xFF00e676),
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                          onTap: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => const SupportScreen(),
                              ),
                            );
                          },
                        ),
                        const SizedBox(height: 24),
                        _buildSectionTitle('Actividad'),
                        _buildMenuItem(
                          icon: Icons.history,
                          title: 'Historial de apuestas',
                          subtitle: 'Ver todas tus apuestas',
                          onTap: () {},
                        ),
                        _buildMenuItem(
                          icon: Icons.account_balance_wallet,
                          title: 'Historial de transacciones',
                          subtitle: 'Depósitos y retiros',
                          onTap: () {},
                        ),
                        _buildMenuItem(
                          icon: Icons.receipt_long,
                          title: 'Extracto de cuenta',
                          subtitle: 'Resumen de movimientos',
                          onTap: () {},
                        ),
                        _buildMenuItem(
                          icon: Icons.favorite_border,
                          title: 'Favoritos',
                          subtitle: 'Deportes y equipos guardados',
                          onTap: () {},
                        ),
                        const SizedBox(height: 24),
                        _buildSectionTitle('Bonos y Promociones'),
                        _buildMenuItem(
                          icon: Icons.local_offer,
                          title: 'Mis bonos',
                          subtitle: '3 bonos activos',
                          trailing: Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 4,
                            ),
                            decoration: BoxDecoration(
                              color: Colors.red,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Text(
                              '3',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                          onTap: () {},
                        ),
                        _buildMenuItem(
                          icon: Icons.people_outline,
                          title: 'Referir amigos',
                          subtitle: 'Gana Bs. 100 por referido',
                          onTap: () {},
                        ),
                        const SizedBox(height: 24),
                        _buildSectionTitle('Juego Responsable'),
                        _buildMenuItem(
                          icon: Icons.schedule,
                          title: 'Límites de apuesta',
                          subtitle: 'Configura límites diarios/semanales',
                          onTap: () {},
                        ),
                        _buildMenuItem(
                          icon: Icons.timer_off,
                          title: 'Autoexclusión',
                          subtitle: 'Toma un descanso temporal',
                          onTap: () {},
                        ),
                        const SizedBox(height: 24),
                        _buildSectionTitle('Configuración'),
                        _buildSwitchMenuItem(
                          icon: Icons.notifications_outlined,
                          title: 'Notificaciones',
                          subtitle: 'Alertas de apuestas y promociones',
                          value: _notificationsEnabled,
                          onChanged: (v) =>
                              setState(() => _notificationsEnabled = v),
                        ),
                        _buildSwitchMenuItem(
                          icon: Icons.fingerprint,
                          title: 'Biometría',
                          subtitle: 'Acceso con huella digital',
                          value: _biometricsEnabled,
                          onChanged: _handleBiometricToggle,
                        ),
                        _buildMenuItem(
                          icon: Icons.language,
                          title: 'Idioma',
                          subtitle: 'Español',
                          onTap: () {},
                        ),
                        _buildMenuItem(
                          icon: Icons.dark_mode_outlined,
                          title: 'Tema',
                          subtitle: 'Oscuro',
                          onTap: () {},
                        ),
                        const SizedBox(height: 24),
                        _buildSectionTitle('Soporte'),
                        _buildMenuItem(
                          icon: Icons.help_outline,
                          title: 'Centro de ayuda',
                          subtitle: 'Preguntas frecuentes',
                          onTap: () {},
                        ),
                        _buildMenuItem(
                          icon: Icons.chat_bubble_outline,
                          title: 'Chat en vivo',
                          subtitle: 'Habla con un agente',
                          trailing: Container(
                            width: 10,
                            height: 10,
                            decoration: const BoxDecoration(
                              color: Colors.green,
                              shape: BoxShape.circle,
                            ),
                          ),
                          onTap: () {},
                        ),
                        _buildMenuItem(
                          icon: Icons.email_outlined,
                          title: 'Contacto',
                          subtitle: 'soporte@trifobet.com',
                          onTap: () {},
                        ),
                        _buildMenuItem(
                          icon: Icons.description_outlined,
                          title: 'Términos y condiciones',
                          onTap: () {},
                        ),
                        _buildMenuItem(
                          icon: Icons.privacy_tip_outlined,
                          title: 'Política de privacidad',
                          onTap: () {},
                        ),
                        const SizedBox(height: 24),
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton.icon(
                            onPressed: () => _logout(context),
                            icon: const Icon(Icons.logout),
                            label: const Text(
                              'Cerrar sesión',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.red.shade700,
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(vertical: 16),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(height: 16),
                        Text(
                          'TriFoBet v1.0.0',
                          style: TextStyle(
                            color: Colors.grey.shade600,
                            fontSize: 12,
                          ),
                        ),
                        const SizedBox(height: 32),
                      ],
                    ),
                  ),
                ),
              ],
            ),
    );
  }

  // Tus widgets originales (los dejo exactamente iguales)
  Widget _buildStatCard(
    String label,
    String value,
    IconData icon,
    Color color,
  ) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF1A1F26),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade800, width: 1),
      ),
      child: Column(
        children: [
          Icon(icon, color: color, size: 24),
          const SizedBox(height: 8),
          Text(
            value,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: TextStyle(color: Colors.grey.shade500, fontSize: 11),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12, top: 8),
      child: Row(
        children: [
          Text(
            title,
            style: TextStyle(
              color: Colors.grey.shade400,
              fontSize: 13,
              fontWeight: FontWeight.bold,
              letterSpacing: 0.5,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMenuItem({
    required IconData icon,
    required String title,
    String? subtitle,
    Widget? trailing,
    required VoidCallback onTap,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        color: const Color(0xFF1A1F26),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade800, width: 1),
      ),
      child: ListTile(
        onTap: onTap,
        leading: Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: Colors.green.withOpacity(0.1),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(icon, color: Colors.green, size: 22),
        ),
        title: Text(
          title,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 15,
            fontWeight: FontWeight.w500,
          ),
        ),
        subtitle: subtitle != null
            ? Text(
                subtitle,
                style: TextStyle(color: Colors.grey.shade500, fontSize: 12),
              )
            : null,
        trailing:
            trailing ?? Icon(Icons.chevron_right, color: Colors.grey.shade600),
      ),
    );
  }

  Widget _buildSwitchMenuItem({
    required IconData icon,
    required String title,
    String? subtitle,
    required bool value,
    required ValueChanged<bool> onChanged,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        color: const Color(0xFF1A1F26),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade800, width: 1),
      ),
      child: ListTile(
        leading: Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: Colors.green.withOpacity(0.1),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(icon, color: Colors.green, size: 22),
        ),
        title: Text(
          title,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 15,
            fontWeight: FontWeight.w500,
          ),
        ),
        subtitle: subtitle != null
            ? Text(
                subtitle,
                style: TextStyle(color: Colors.grey.shade500, fontSize: 12),
              )
            : null,
        trailing: Switch(
          value: value,
          onChanged: onChanged,
          activeColor: Colors.green,
        ),
      ),
    );
  }
}
