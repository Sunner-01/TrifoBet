// lib/features/profile/widgets/edit_profile_sheet.dart
import 'package:flutter/material.dart';
import 'package:trifobet/features/profile/services/profile_service.dart';

class EditProfileSheet {
  static void show(BuildContext context, Map<String, dynamic> userData, VoidCallback onSuccess) {
    final formKey = GlobalKey<FormState>();
    final nombreCtrl = TextEditingController(text: userData['nombre'] ?? '');
    final apellido1Ctrl = TextEditingController(text: userData['apellido1'] ?? '');
    final apellido2Ctrl = TextEditingController(text: userData['apellido2'] ?? '');
    final ciCtrl = TextEditingController(text: userData['ci'] ?? '');
    final telefonoCtrl = TextEditingController(text: userData['telefono'] ?? '');

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        height: MediaQuery.of(context).size.height * 0.9,
        decoration: const BoxDecoration(
          color: Colors.black,
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: Padding(
          padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
          child: Form(
            key: formKey,
            child: ListView(
              padding: const EdgeInsets.all(20),
              children: [
                const Text('Editar Perfil', style: TextStyle(fontSize: 24, color: Color(0xFF00FF88), fontWeight: FontWeight.bold)),
                const SizedBox(height: 20),
                TextFormField(
                  controller: nombreCtrl, 
                  decoration: const InputDecoration(labelText: 'Nombre', labelStyle: TextStyle(color: Colors.white70)), 
                  style: const TextStyle(color: Colors.white),
                  validator: (value) {
                    if (value == null || value.trim().isEmpty) return 'Requerido';
                    if (value.trim().length < 3) return 'Mínimo 3 caracteres';
                    if (!RegExp(r'^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$').hasMatch(value)) return 'Solo letras';
                    return null;
                  },
                ),
                TextFormField(
                  controller: apellido1Ctrl, 
                  decoration: const InputDecoration(labelText: 'Primer apellido', labelStyle: TextStyle(color: Colors.white70)), 
                  style: const TextStyle(color: Colors.white),
                  validator: (value) {
                    if (value == null || value.trim().isEmpty) return 'Requerido';
                    if (value.trim().length < 3) return 'Mínimo 3 caracteres';
                    if (!RegExp(r'^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$').hasMatch(value)) return 'Solo letras';
                    return null;
                  },
                ),
                TextFormField(
                  controller: apellido2Ctrl, 
                  decoration: const InputDecoration(labelText: 'Segundo apellido (opcional)', labelStyle: TextStyle(color: Colors.white70)), 
                  style: const TextStyle(color: Colors.white),
                  validator: (value) {
                    if (value != null && value.trim().isNotEmpty) {
                      if (!RegExp(r'^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$').hasMatch(value)) return 'Solo letras';
                    }
                    return null;
                  },
                ),
                TextFormField(
                  controller: ciCtrl, 
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(labelText: 'CI (Solo modificable si no estás verificado)', labelStyle: TextStyle(color: Colors.white70)), 
                  style: const TextStyle(color: Colors.white),
                  validator: (value) {
                    if (value != null && value.trim().isNotEmpty) {
                      if (!RegExp(r'^[0-9]+$').hasMatch(value)) return 'Solo números';
                    }
                    return null;
                  },
                ),
                TextFormField(
                  controller: telefonoCtrl, 
                  keyboardType: TextInputType.phone,
                  decoration: const InputDecoration(labelText: 'Teléfono', labelStyle: TextStyle(color: Colors.white70)), 
                  style: const TextStyle(color: Colors.white),
                  validator: (value) {
                    if (value != null && value.trim().isNotEmpty) {
                      if (!RegExp(r'^[67][0-9]{7}$').hasMatch(value.trim())) return 'Debe empezar con 6 o 7 y tener 8 dígitos';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 30),
                ElevatedButton(
                  onPressed: () async {
                    if (formKey.currentState!.validate()) {
                      final success = await ProfileService.updateProfile({
                        "nombre": nombreCtrl.text.trim(),
                        "apellido1": apellido1Ctrl.text.trim(),
                        "apellido2": apellido2Ctrl.text.trim(),
                        "ci": ciCtrl.text.trim(),
                        "telefono": telefonoCtrl.text.trim(),
                      });
                      if (success) {
                        Navigator.pop(context);
                        onSuccess();
                      }
                    }
                  },
                  style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF00FF88)),
                  child: const Text('Guardar cambios', style: TextStyle(color: Colors.black)),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}