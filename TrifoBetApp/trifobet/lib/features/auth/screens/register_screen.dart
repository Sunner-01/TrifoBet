// lib/features/auth/screens/register_screen.dart

import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';
import 'package:trifobet/features/auth/services/auth_service.dart';
import 'package:trifobet/features/home/home_screen.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nombre = TextEditingController();
  final _apellido1 = TextEditingController();
  final _apellido2 = TextEditingController();
  final _ci = TextEditingController();
  final _fechaNac = TextEditingController();
  final _usuario = TextEditingController();
  final _correo = TextEditingController();
  final _telefono = TextEditingController();
  final _pass = TextEditingController();
  final _pass2 = TextEditingController();

  List<Map<String, dynamic>> _paises = [];
  String? _paisSeleccionado = 'BO';
  String _codigoTelefono = '+591';

  bool _mayor18 = false;
  bool _terminos = false;
  bool _loading = false;
  bool _obscurePass = true;
  bool _obscurePass2 = true;

  // Color principal igual que el Login
  static const Color primaryGreen = Color(0xFF00FF88);

  @override
  void initState() {
    super.initState();
    _cargarPaises();
  }

  Future<void> _cargarPaises() async {
    // Ya no cargamos países dinámicamente, forzamos Bolivia
    setState(() {
      _paisSeleccionado = 'BO';
      _codigoTelefono = '+591';
      // _telefono.text no lleva el prefijo, usamos prefixText en la UI
    });
  }

  Future<void> _seleccionarFecha() async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now().subtract(const Duration(days: 18 * 365)),
      firstDate: DateTime(1900),
      lastDate: DateTime.now(),
      builder: (context, child) => Theme(
        data: ThemeData.dark().copyWith(
          colorScheme: const ColorScheme.dark(primary: primaryGreen),
        ),
        child: child!,
      ),
    );
    if (picked != null) {
      setState(() {
        _fechaNac.text = DateFormat('yyyy-MM-dd').format(picked);
      });
    }
  }

  Future<void> _registrarse() async {
    if (!_formKey.currentState!.validate()) return;
    
    // === NUEVA VALIDACIÓN DE EDAD ===
    if (_fechaNac.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Por favor, selecciona tu fecha de nacimiento')),
      );
      return;
    }

    try {
      final dob = DateFormat('yyyy-MM-dd').parse(_fechaNac.text);
      final today = DateTime.now();
      var age = today.year - dob.year;
      if (today.month < dob.month || (today.month == dob.month && today.day < dob.day)) {
        age--;
      }
      
      if (age < 18) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Según tu fecha de nacimiento, debes ser mayor de 18 años')),
        );
        return;
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Fecha de nacimiento inválida')),
      );
      return;
    }
    // ================================

    if (!_mayor18 || !_terminos) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Debes confirmar ser mayor de 18 y aceptar los términos')),
      );
      return;
    }

    setState(() => _loading = true);

    try {
      final result = await AuthService.register(
        nombre: _nombre.text.trim(),
        apellido1: _apellido1.text.trim(),
        apellido2: _apellido2.text.trim(),
        ci: _ci.text.trim(),
        fechaNacimiento: _fechaNac.text,
        nombreUsuario: _usuario.text.trim(),
        correo: _correo.text.trim(),
        telefono: '+591${_telefono.text.trim()}',
        contrasena: _pass.text,
        paisCodigo: 'BO',
      );

      if (!result['success']) throw Exception(result['error']);

      final loginResult = await AuthService.login(_usuario.text.trim(), _pass.text);
      if (!loginResult['success']) throw Exception(loginResult['error']);

      if (!mounted) return;

      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(builder: (_) => const HomeScreen()),
        (route) => false,
      );
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.toString().replaceFirst('Exception: ', '')),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;
    final isLargeScreen = size.height > 700;

    return Scaffold(
      backgroundColor: Colors.black,
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: primaryGreen, size: 26),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Stack(
        children: [
          // Fondo negro sólido
          Container(color: Colors.black),

          // Overlay suave (opcional, queda más elegante)
          Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  Colors.black.withOpacity(0.95),
                  Colors.black.withOpacity(0.85),
                  Colors.black.withOpacity(0.98),
                ],
              ),
            ),
          ),

          SafeArea(
            child: LayoutBuilder(
              builder: (context, constraints) {
                return SingleChildScrollView(
                  padding: EdgeInsets.symmetric(horizontal: size.width * 0.1, vertical: 20),
                  child: ConstrainedBox(
                    constraints: const BoxConstraints(maxWidth: 420),
                    child: Form(
                      key: _formKey,
                      child: Column(
                        children: [
                          SizedBox(height: isLargeScreen ? size.height * 0.05 : 30),

                          const Text(
                            'Crear cuenta',
                            style: TextStyle(
                              fontSize: 48,
                              fontWeight: FontWeight.bold,
                              color: primaryGreen,
                              letterSpacing: 2,
                            ),
                          ),
                          const SizedBox(height: 8),
                          const Text(
                            'Completa tus datos y empieza a ganar',
                            style: TextStyle(fontSize: 16, color: Colors.white70),
                          ),

                          SizedBox(height: isLargeScreen ? size.height * 0.08 : 60),

                          // === CAMPOS ===
                          _buildTextField(_nombre, 'Nombre', Icons.person),
                          const SizedBox(height: 16),
                          _buildTextField(_apellido1, 'Primer apellido', Icons.person_outline),
                          const SizedBox(height: 16),
                          _buildTextField(_apellido2, 'Segundo apellido (opcional)', Icons.person_outline, required: false),
                          const SizedBox(height: 16),
                          _buildTextField(_ci, 'Carnet de identidad', Icons.credit_card, keyboardType: TextInputType.number),
                          const SizedBox(height: 16),

                          GestureDetector(
                            onTap: _seleccionarFecha,
                            child: AbsorbPointer(
                              child: _buildTextField(_fechaNac, 'Fecha de nacimiento', Icons.calendar_today),
                            ),
                          ),
                          const SizedBox(height: 16),

                          const SizedBox(height: 16),
                          _buildPhoneField(),
                          const SizedBox(height: 16),

                          _buildTextField(_usuario, 'Nombre de usuario', Icons.alternate_email),
                          const SizedBox(height: 16),
                          _buildTextField(_correo, 'Correo electrónico', Icons.email, keyboardType: TextInputType.emailAddress),
                          const SizedBox(height: 16),
                          _buildPasswordField(_pass, 'Contraseña'),
                          const SizedBox(height: 16),
                          _buildPasswordField(_pass2, 'Confirmar contraseña', confirm: true),

                          const SizedBox(height: 24),

                          _buildCheckbox(_mayor18, 'Confirmo que soy mayor de 18 años', (v) => setState(() => _mayor18 = v!)),
                          _buildCheckbox(_terminos, 'Acepto los términos y condiciones', (v) => setState(() => _terminos = v!)),

                          const SizedBox(height: 32),

                          // BOTÓN CREAR CUENTA
                          SizedBox(
                            width: double.infinity,
                            height: 56,
                            child: ElevatedButton(
                              onPressed: _loading ? null : _registrarse,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: primaryGreen,
                                foregroundColor: Colors.black,
                                elevation: 8,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                              ),
                              child: _loading
                                  ? const SizedBox(
                                      height: 24,
                                      width: 24,
                                      child: CircularProgressIndicator(color: Colors.black, strokeWidth: 2.5),
                                    )
                                  : const Text(
                                      'CREAR CUENTA',
                                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, letterSpacing: 1.5),
                                    ),
                            ),
                          ),

                          const SizedBox(height: 30),

                          // VOLVER AL LOGIN
                          TextButton(
                            onPressed: () => Navigator.pop(context),
                            child: const Text(
                              'Volver al inicio de sesión',
                              style: TextStyle(color: primaryGreen, fontSize: 15),
                            ),
                          ),

                          const SizedBox(height: 40),
                        ],
                      ),
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

  // ===================== WIDGETS REUTILIZABLES =====================

  Widget _buildTextField(
    TextEditingController controller,
    String label,
    IconData icon, {
    TextInputType keyboardType = TextInputType.text,
    bool obscureText = false,
    bool required = true,
  }) {
    return TextFormField(
      controller: controller,
      keyboardType: keyboardType,
      obscureText: obscureText,
      style: const TextStyle(color: Colors.white, fontSize: 16),
      validator: required ? (v) => v!.trim().isEmpty ? 'Campo obligatorio' : null : null,
      decoration: InputDecoration(
        labelText: label,
        labelStyle: const TextStyle(color: Colors.white70),
        prefixIcon: Icon(icon, color: Colors.white, size: 22),
        filled: true,
        fillColor: Colors.white.withOpacity(0.08),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: primaryGreen, width: 1.5),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: primaryGreen, width: 2.5),
        ),
        contentPadding: const EdgeInsets.symmetric(vertical: 18, horizontal: 16),
      ),
    );
  }

  Widget _buildPasswordField(TextEditingController c, String label, {bool confirm = false}) {
    final obscure = confirm ? _obscurePass2 : _obscurePass;
    return TextFormField(
      controller: c,
      obscureText: obscure,
      style: const TextStyle(color: Colors.white, fontSize: 16),
      validator: confirm
          ? (v) => v != _pass.text ? 'Las contraseñas no coinciden' : null
          : (v) {
              if (v == null || v.length < 6) return 'Mínimo 6 caracteres';
              if (!RegExp(r'((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$').hasMatch(v)) {
                return 'Requiere mayúscula, minúscula y número';
              }
              return null;
            },
      decoration: InputDecoration(
        labelText: label,
        labelStyle: const TextStyle(color: Colors.white70),
        prefixIcon: const Icon(Icons.lock, color: Colors.white, size: 22),
        suffixIcon: IconButton(
          icon: Icon(obscure ? Icons.visibility_off : Icons.visibility, color: Colors.white70),
          onPressed: () => setState(() => confirm ? _obscurePass2 = !_obscurePass2 : _obscurePass = !_obscurePass),
        ),
        filled: true,
        fillColor: Colors.white.withOpacity(0.08),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: primaryGreen, width: 1.5),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: primaryGreen, width: 2.5),
        ),
        contentPadding: const EdgeInsets.symmetric(vertical: 18, horizontal: 16),
      ),
    );
  }

  Widget _buildDropdown() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 4),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.08),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: primaryGreen, width: 1.5),
      ),
      child: DropdownButtonFormField<String>(
        value: _paisSeleccionado,
        dropdownColor: Colors.grey[900],
        style: const TextStyle(color: Colors.white),
        decoration: const InputDecoration(
          labelText: 'País',
          labelStyle: TextStyle(color: Colors.white70),
          prefixIcon: Icon(Icons.public, color: Colors.white),
          border: InputBorder.none,
          contentPadding: EdgeInsets.symmetric(horizontal: 12),
        ),
        items: _paises.map<DropdownMenuItem<String>>((p) {
          return DropdownMenuItem<String>(
            value: p['codigo'] as String,
            child: Text("${p['codigo_telefonico']} ${p['nombre_es']}"),
          );
        }).toList(),
        onChanged: (value) {
          if (value != null) {
            final pais = _paises.firstWhere((p) => p['codigo'] == value);
            setState(() {
              _paisSeleccionado = value;
              _codigoTelefono = pais['codigo_telefonico'] ?? '+591';
              _telefono.text = _codigoTelefono;
              _telefono.selection = TextSelection.fromPosition(
                TextPosition(offset: _codigoTelefono.length),
              );
            });
          }
        },
      ),
    );
  }

  Widget _buildPhoneField() {
    return TextFormField(
      controller: _telefono,
      keyboardType: TextInputType.phone,
      style: const TextStyle(color: Colors.white, fontSize: 16),
      validator: (v) {
        if (v == null || v.trim().isEmpty) return 'Campo obligatorio';
        if (v.trim().length != 8) return 'El número debe tener 8 dígitos';
        if (!v.trim().startsWith('6') && !v.trim().startsWith('7')) return 'Debe empezar con 6 o 7';
        return null;
      },
      decoration: InputDecoration(
        labelText: 'Teléfono',
        hintText: '71234567',
        prefixText: '+591 ',
        prefixStyle: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
        hintStyle: const TextStyle(color: Colors.white30),
        labelStyle: const TextStyle(color: Colors.white70),
        prefixIcon: const Icon(Icons.phone, color: Colors.white, size: 22),
        filled: true,
        fillColor: Colors.white.withOpacity(0.08),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: primaryGreen, width: 1.5),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: primaryGreen, width: 2.5),
        ),
        contentPadding: const EdgeInsets.symmetric(vertical: 18, horizontal: 16),
      ),
    );
  }

  Widget _buildCheckbox(bool value, String text, Function(bool?) onChanged) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Checkbox(
            value: value,
            onChanged: onChanged,
            activeColor: primaryGreen,
            checkColor: Colors.black,
            side: const BorderSide(color: primaryGreen, width: 2),
          ),
          const SizedBox(width: 8),
          Expanded(child: Text(text, style: const TextStyle(color: Colors.white70, fontSize: 14))),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _nombre.dispose();
    _apellido1.dispose();
    _apellido2.dispose();
    _ci.dispose();
    _fechaNac.dispose();
    _usuario.dispose();
    _correo.dispose();
    _telefono.dispose();
    _pass.dispose();
    _pass2.dispose();
    super.dispose();
  }
}