import 'package:flutter/material.dart';

class RulesScreen extends StatelessWidget {
  const RulesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0a0a0a),
      appBar: AppBar(
        title: const Text(
          'Reglas de Apuestas',
          style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white),
        ),
        backgroundColor: const Color(0xFF1a1a1a),
        iconTheme: const IconThemeData(color: Colors.white),
        elevation: 0,
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          _buildRuleItem(
            '1. General',
            'Al realizar una apuesta en TrifoBet, aceptas nuestros términos y condiciones. Nos reservamos el derecho de anular apuestas si detectamos errores obvios en las cuotas o comportamiento fraudulento. Todas las decisiones de la administración son finales.',
          ),
          _buildRuleItem(
            '2. Apuestas Deportivas',
            'Las apuestas se liquidan según el resultado oficial al final del tiempo reglamentario (90 minutos en fútbol), a menos que se especifique lo contrario (ej. "Ganador del trofeo"). Prórrogas y penaltis no cuentan para apuestas de 1X2. Si un partido se juega en un terreno neutral, el equipo listado primero se considera local.',
          ),
          _buildRuleItem(
            '3. Apuestas en Vivo',
            'Las cuotas en vivo cambian dinámicamente. TrifoBet no se hace responsable por retrasos en la transmisión de datos o video. Es responsabilidad del usuario estar al tanto del estado actual del evento. Las apuestas aceptadas en momentos de peligro (ej. gol inminente) pueden ser anuladas.',
          ),
          _buildRuleItem(
            '4. Límites de Apuesta',
            'El monto mínimo de apuesta es de Bs. 1. El monto máximo varía según el evento y el mercado. TrifoBet se reserva el derecho de limitar la cantidad apostada por cualquier usuario sin previo aviso.',
          ),
          _buildRuleItem(
            '5. Cancelación de Eventos',
            'Si un evento se cancela o pospone por más de 24 horas, todas las apuestas simples serán anuladas y el dinero devuelto. En apuestas combinadas, la selección se considerará nula (cuota 1.00), pero el resto de la combinada seguirá activa.',
          ),
          _buildRuleItem(
            '6. Juego Responsable',
            'El juego debe ser entretenimiento. Si sientes que tienes problemas con el juego, contacta a soporte para establecer límites de depósito o autoexclusión. Prohibido para menores de 18 años.',
          ),
          _buildRuleItem(
            '7. Retiros y Depósitos',
            'Los retiros se procesan al mismo método de pago utilizado para depositar siempre que sea posible. TrifoBet puede solicitar documentación adicional para verificar la identidad antes de procesar el primer retiro (KYC).',
          ),
          _buildRuleItem(
            '8. Bonos y Promociones',
            'Los bonos están sujetos a requisitos de apuesta (rollover) antes de poder ser retirados. El abuso de bonos resultará en la cancelación de los mismos y posibles sanciones a la cuenta.',
          ),
          _buildRuleItem(
            '9. Errores Técnicos',
            'En caso de error en el sistema o software, todas las apuestas afectadas serán anuladas. TrifoBet no se hace responsable por pérdidas derivadas de fallos de conexión del usuario.',
          ),
        ],
      ),
    );
  }

  Widget _buildRuleItem(String title, String content) {
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
            title,
            style: const TextStyle(
              color: Color(0xFF00e676),
              fontWeight: FontWeight.bold,
              fontSize: 16,
            ),
          ),
          iconColor: const Color(0xFF00e676),
          collapsedIconColor: Colors.white54,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
              child: Text(
                content,
                style: TextStyle(
                  color: Colors.white.withOpacity(0.8),
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
