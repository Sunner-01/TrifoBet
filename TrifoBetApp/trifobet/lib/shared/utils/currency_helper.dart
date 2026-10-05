import '../../features/auth/services/auth_service.dart';

class CurrencyHelper {
  static const Map<String, String> _currencySymbols = {
    'BO': 'Bs.',
    'US': '\$',
    'PE': 'S/',
    'AR': '\$',
    'BR': 'R\$',
    'CL': '\$',
    'CO': '\$',
    'MX': '\$',
    'ES': '€',
  };

  static String getSymbol(String countryCode) {
    return _currencySymbols[countryCode.trim().toUpperCase()] ?? 'Bs.';
  }

  static Future<String> getUserCurrencySymbol() async {
    final user = await AuthService.getUser();
    if (user != null && user['pais_codigo'] != null) {
      return getSymbol(user['pais_codigo']);
    }
    return 'Bs.';
  }
}
