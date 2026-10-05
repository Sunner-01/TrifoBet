import 'package:flutter/material.dart';

class FAQScreen extends StatelessWidget {
  const FAQScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0a0a0a),
      appBar: AppBar(
        title: const Text(
          'Preguntas Frecuentes',
          style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white),
        ),
        backgroundColor: const Color(0xFF1a1a1a),
        iconTheme: const IconThemeData(color: Colors.white),
        elevation: 0,
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          _buildCategory('Depósitos y Retiros'),
          _buildFAQItem(
            '¿Cuánto tiempo tarda un depósito?',
            'Los depósitos mediante QR y transferencia bancaria suelen acreditarse en cuestión de minutos una vez confirmados. Si tarda más de 15 minutos, contacta a soporte.',
          ),
          _buildFAQItem(
            '¿Cuál es el monto mínimo de retiro?',
            'El monto mínimo para retirar es de Bs. 50. Los retiros se procesan automáticamente a tu cuenta bancaria registrada.',
          ),
          _buildFAQItem(
            '¿Puedo cancelar un retiro?',
            'Sí, siempre y cuando el retiro esté en estado "Pendiente". Ve a tu historial de transacciones para gestionar tus solicitudes.',
          ),

          const SizedBox(height: 24),
          _buildCategory('Cuenta y Seguridad'),
          _buildFAQItem(
            '¿Cómo verifico mi cuenta?',
            'Para verificar tu cuenta, ve a "Mi Cuenta" > "Verificación" y sube una foto de tu documento de identidad. El proceso suele tardar menos de 24 horas.',
          ),
          _buildFAQItem(
            'Olvidé mi contraseña',
            'Puedes restablecer tu contraseña desde la pantalla de inicio de sesión pulsando en "¿Olvidaste tu contraseña?". Te enviaremos un correo con las instrucciones.',
          ),
          _buildFAQItem(
            '¿Es seguro jugar en TrifoBet?',
            'Absolutamente. Utilizamos encriptación SSL de última generación para proteger tus datos y transacciones. Además, operamos bajo licencia y regulaciones estrictas.',
          ),

          const SizedBox(height: 24),
          _buildCategory('Apuestas Deportivas'),
          _buildFAQItem(
            '¿Qué es una apuesta combinada?',
            'Una apuesta combinada te permite seleccionar múltiples eventos en un solo ticket. Todas las selecciones deben ser acertadas para ganar, pero las cuotas se multiplican para obtener mayores ganancias.',
          ),
          _buildFAQItem(
            '¿Qué pasa si se suspende un partido?',
            'Si un partido se suspende y no se reanuda en 24 horas, la apuesta se anula y se devuelve el importe apostado (o se calcula como cuota 1.00 en combinadas).',
          ),
        ],
      ),
    );
  }

  Widget _buildCategory(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Text(
        title,
        style: const TextStyle(
          color: Color(0xFF00e676),
          fontSize: 18,
          fontWeight: FontWeight.bold,
          letterSpacing: 1,
        ),
      ),
    );
  }

  Widget _buildFAQItem(String question, String answer) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: const Color(0xFF1a1a1a),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white.withOpacity(0.05)),
      ),
      child: Theme(
        data: ThemeData(dividerColor: Colors.transparent),
        child: ExpansionTile(
          title: Text(
            question,
            style: const TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.w600,
              fontSize: 15,
            ),
          ),
          iconColor: const Color(0xFF00e676),
          collapsedIconColor: Colors.white54,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
              child: Text(
                answer,
                style: TextStyle(
                  color: Colors.white.withOpacity(0.7),
                  height: 1.5,
                  fontSize: 14,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
