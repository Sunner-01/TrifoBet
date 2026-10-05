class ApiConfig {
  /// IP of the local machine for physical device testing.
  /// Replace with 10.0.2.2 if testing on Android Emulator.
  static const String localIp = '192.168.1.8';

  /// Backend NestJS base URL (Production)
  static const String baseUrl = 'https://trifobetbackend.onrender.com';

  /// Local Juegos server base URL (Production)
  static const String juegosUrl = 'https://trifo-bet-juegos.vercel.app';
}
