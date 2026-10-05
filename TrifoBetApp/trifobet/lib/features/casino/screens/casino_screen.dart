// lib/features/casino/screens/casino_screen.dart

import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:trifobet/features/auth/services/auth_service.dart'; // Importa AuthService para getToken
import '../../../core/config/api_config.dart';

class CasinoScreen extends StatefulWidget {
  const CasinoScreen({super.key});

  @override
  State<CasinoScreen> createState() => _CasinoScreenState();
}

class _CasinoScreenState extends State<CasinoScreen> {
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';
  String _selectedCategory = 'Todos';

  static const List<String> categories = [
    'Todos',
    'Tragamonedas',
    'Crash Games',
    'Ruleta',
    'Blackjack',
  ];

  // AQUÍ ESTÁ TU LISTA DE JUEGOS 
  final List<GameModel> _allGames = [
    GameModel(
      id: 1,
      name: 'BlackJack',
      provider: 'TrifoBet Play',
      category: 'Blackjack',
      thumbnail: 'assets/juegos/Blackjack.png',
      url: '${ApiConfig.juegosUrl}/blackjack/main.html', 
      isFavorite: false,
    ),
    GameModel(
      id: 2,
      name: 'Tragaperras',
      provider: 'TrifoBet Play',
      category: 'Tragamonedas',
      thumbnail: 'assets/juegos/Tragamonedas.png',
      url: '${ApiConfig.juegosUrl}/Tragamonedas/tragamonedas.html',
      isFavorite: false,
    ),
    GameModel(
      id: 3,
      name: 'Nebula',
      provider: 'TrifoBet Play',
      category: 'Crash Games',
      thumbnail: 'assets/juegos/NebulaGame.png',
      url: '${ApiConfig.juegosUrl}/Nebula/nebula.html',
      isFavorite: false,
    ),
    GameModel(
      id: 4,
      name: 'Penalty',
      provider: 'TrifoBet Play',
      category: 'Ruleta',
      thumbnail: 'assets/juegos/Penalty.png',
      url: '${ApiConfig.juegosUrl}/Penales/crazy-time.html',
      isFavorite: false,
    ),
    GameModel(
      id: 5,
      name: 'Lightning Roulette',
      provider: 'TrifoBet Play',
      category: 'Ruleta',
      thumbnail: 'assets/juegos/Ruleta.png',
      url: '${ApiConfig.juegosUrl}/Ruleta/lightning-roulette.html',
      isFavorite: false,
    ),
    GameModel(
      id: 6,
      name: 'Plinko',
      provider: 'TrifoBet Play',
      category: 'Tragamonedas',
      thumbnail: 'assets/juegos/Plinko_Game.png',
      url: '${ApiConfig.juegosUrl}/Plinko/plinko.html',
      isFavorite: false,
    ),
    GameModel(
      id: 7,
      name: 'ChickenRoad',
      provider: 'TrifoBet Play',
      category: 'Crash Games',
      thumbnail: 'assets/juegos/ChickenRoad.png',
      url: '${ApiConfig.juegosUrl}/Chicken_Road/chicken.html', 
      isFavorite: false,
    ),
  ];

  List<GameModel> get _filteredGames {
    return _allGames.where((game) {
      final matchesSearch =
          game.name.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          game.provider.toLowerCase().contains(_searchQuery.toLowerCase());
      final matchesCategory =
          _selectedCategory == 'Todos' || game.category == _selectedCategory;
      return matchesSearch && matchesCategory;
    }).toList();
  }

  void _toggleFavorite(int id) {
    setState(() {
      final game = _allGames.firstWhere((g) => g.id == id);
      game.isFavorite = !game.isFavorite;
    });
  }

  // Función para abrir el juego, appendeando token para todos
  Future<void> _openGame(GameModel game) async {
    String gameUrl = game.url;

    // Appendea el token para todos los juegos
    final token = await AuthService.getToken();
    if (token == null) {
      // No hay token: redirige a login o muestra error
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Sesión expirada. Inicia sesión nuevamente.'),
          ),
        );
        Navigator.pushReplacementNamed(context, '/login');
      }
      return;
    }

    // Codificar el token por si acaso tiene caracteres especiales
    final encodedToken = Uri.encodeComponent(token);

    // Manejo básico de parámetros existentes
    if (gameUrl.contains('?')) {
      gameUrl = '$gameUrl&token=$encodedToken';
    } else {
      gameUrl = '$gameUrl?token=$encodedToken';
    }

    // AGREGAR TOKEN COMO HASH (#) TAMBIÉN PARA QUE SOBREVIVA AL REDIRECT
    gameUrl = '$gameUrl#token=$encodedToken';

    // LOG PARA DEPURACIÓN
    debugPrint('--------------------------------------------------');
    debugPrint('OPENING GAME: ${game.name}');
    debugPrint('ORIGINAL URL: ${game.url}');
    debugPrint('FINAL URL   : $gameUrl');
    debugPrint('TOKEN       : $token');
    debugPrint('--------------------------------------------------');

    if (!mounted) return;

    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => GameWebViewScreen(
          url: gameUrl,
          title: game.name,
          token: token, // Pasamos el token crudo para inyectarlo
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F1116),

      body: Column(
        children: [
          // Buscador
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 46, 16, 8),
            child: TextField(
              controller: _searchController,
              style: const TextStyle(color: Colors.white),
              decoration: InputDecoration(
                hintText: 'Buscar juego o proveedor...',
                hintStyle: const TextStyle(color: Colors.grey),
                prefixIcon: const Icon(Icons.search, color: Colors.grey),
                filled: true,
                fillColor: const Color(0xFF1E2129),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
              ),
              onChanged: (value) => setState(() => _searchQuery = value),
            ),
          ),

          // Categorías
          SizedBox(
            height: 50,
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 12),
              scrollDirection: Axis.horizontal,
              itemCount: categories.length,
              itemBuilder: (context, index) {
                final category = categories[index];
                final isSelected = _selectedCategory == category;
                return Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 6),
                  child: ChoiceChip(
                    label: Text(category),
                    selected: isSelected,
                    onSelected: (_) =>
                        setState(() => _selectedCategory = category),
                    selectedColor: const Color.fromARGB(255, 0, 110, 50),
                    backgroundColor: const Color(0xFF1E2129),
                    labelStyle: TextStyle(
                      color: isSelected ? Colors.white : Colors.grey[400],
                      fontWeight: isSelected
                          ? FontWeight.bold
                          : FontWeight.normal,
                    ),
                  ),
                );
              },
            ),
          ),

          const SizedBox(height: 12),

          // Grid de juegos
          Expanded(
            child: _filteredGames.isEmpty
                ? const Center(
                    child: Text(
                      'No se encontraron juegos',
                      style: TextStyle(color: Colors.grey),
                    ),
                  )
                : GridView.builder(
                    padding: const EdgeInsets.all(12),
                    gridDelegate:
                        const SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 3,
                          childAspectRatio: 0.75,
                          crossAxisSpacing: 12,
                          mainAxisSpacing: 12,
                        ),
                    itemCount: _filteredGames.length,
                    itemBuilder: (context, index) {
                      final game = _filteredGames[index];

                      return GestureDetector(
                        onTap: () => _openGame(
                          game,
                        ), // Usa la función async en lugar de directo
                        child: Stack(
                          children: [
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Expanded(
                                  child: ClipRRect(
                                    borderRadius: BorderRadius.circular(12),
                                    child: Image.asset(
                                      game.thumbnail,
                                      fit: BoxFit.cover,
                                      width: double.infinity,
                                      errorBuilder: (_, __, ___) => Container(
                                        color: Colors.grey[800],
                                        child: const Icon(
                                          Icons.casino,
                                          color: Colors.grey,
                                          size: 40,
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                                const SizedBox(height: 6),
                                Text(
                                  game.name,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 11,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                Text(
                                  game.provider,
                                  style: const TextStyle(
                                    color: Colors.grey,
                                    fontSize: 9,
                                  ),
                                ),
                              ],
                            ),
                            // LIVE tag
                            if (game.category == 'Casino en Vivo')
                              const Positioned(
                                top: 6,
                                left: 6,
                                child: Chip(
                                  label: Text(
                                    'LIVE',
                                    style: TextStyle(
                                      fontSize: 8,
                                      color: Colors.white,
                                    ),
                                  ),
                                  backgroundColor: Colors.red,
                                  padding: EdgeInsets.symmetric(horizontal: 6),
                                ),
                              ),
                          ],
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}

// Modelo simple y limpio
class GameModel {
  final int id;
  final String name;
  final String provider;
  final String category;
  final String thumbnail;
  final String url;
  bool isFavorite;

  GameModel({
    required this.id,
    required this.name,
    required this.provider,
    required this.category,
    required this.thumbnail,
    required this.url,
    this.isFavorite = false,
  });
}

// Pantalla del WebView (puedes dejarla en este mismo archivo o separarla)
class GameWebViewScreen extends StatefulWidget {
  final String url;
  final String title;
  final String token; // Agregamos token para inyectarlo

  const GameWebViewScreen({
    super.key,
    required this.url,
    required this.title,
    required this.token,
  });

  @override
  State<GameWebViewScreen> createState() => _GameWebViewScreenState();
}

class _GameWebViewScreenState extends State<GameWebViewScreen> {
  late final WebViewController controller;

  @override
  void initState() {
    super.initState();
    controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0xFF0F1116))
      ..setOnConsoleMessage((message) {
        debugPrint('🎮 JS_GAME: ${message.message}');
      })
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageStarted: (url) => debugPrint('🌍 PAGE STARTED: $url'),
          onPageFinished: (url) {
            debugPrint('🏁 PAGE FINISHED: $url');
            // Inyectar token en localStorage como respaldo
            controller.runJavaScript(
              "localStorage.setItem('token', '${widget.token}');",
            );
            debugPrint('💉 Token injected into localStorage');
          },
          onWebResourceError: (error) =>
              debugPrint('❌ WEB RESOURCE ERROR: ${error.description}'),
        ),
      )
      ..setOnJavaScriptAlertDialog((request) async {
        await showDialog(
          context: context,
          builder: (context) => AlertDialog(
            title: const Text('JS Alert'),
            content: Text(request.message),
            actions: [
              TextButton(
                onPressed: () => Navigator.of(context).pop(),
                child: const Text('OK'),
              ),
            ],
          ),
        );
      })
      ..loadRequest(Uri.parse(widget.url));

    // Limpiar caché para asegurar que no cargue una versión vieja sin params
    controller.clearCache();
    controller.clearLocalStorage();
  }

  @override
  void dispose() {
    // Cargar una página en blanco para detener la ejecución de JS y audio
    controller.loadRequest(Uri.parse('about:blank'));
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.title),
        backgroundColor: const Color(0xFF1A1C24),
      ),
      body: WebViewWidget(controller: controller),
    );
  }
}
