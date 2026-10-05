import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:intl/intl.dart';
import '../../../core/config/api_config.dart';
import '../../chat/services/chat_service.dart';

class SupportChatScreen extends StatefulWidget {
  const SupportChatScreen({super.key});

  @override
  State<SupportChatScreen> createState() => _SupportChatScreenState();
}

class _SupportChatScreenState extends State<SupportChatScreen> {
  final TextEditingController _controller = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  late final ChatService _chatService;
  
  final List<dynamic> _messages = [];
  int? _activeTicketId;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _initSupport();
  }

  Future<void> _initSupport() async {
    _chatService = ChatService(namespace: '/soporte');
    await _chatService.connect();

    // Listeners
    _chatService.onMessage.listen((message) {
      if (mounted) {
        setState(() {
          _messages.insert(0, message);
        });
        _scrollToBottom();
      }
    });

    try {
      await _loadOrCreateTicket();
    } catch (e) {
      debugPrint('Error en soporte: $e');
    }

    if (mounted) {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _loadOrCreateTicket() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');
    if (token == null) return;

    final headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    };

    // 1. Fetch user tickets
    final resTickets = await http.get(
      Uri.parse('${ApiConfig.baseUrl}/soporte/mis-tickets'),
      headers: headers,
    );

    if (resTickets.statusCode == 200) {
      final List<dynamic> tickets = json.decode(resTickets.body);
      // Buscar ticket activo (abierto o en progreso)
      final active = tickets.firstWhere(
        (t) => t['estado'] != 'cerrado',
        orElse: () => null,
      );

      if (active != null) {
        _activeTicketId = active['id'];
      } else {
        // Create new ticket
        final resCreate = await http.post(
          Uri.parse('${ApiConfig.baseUrl}/soporte/ticket'),
          headers: headers,
          body: json.encode({'asunto': 'Ayuda General', 'categoria': 'general'}),
        );
        if (resCreate.statusCode == 201) {
          final newTicket = json.decode(resCreate.body);
          _activeTicketId = newTicket['id'];
        }
      }

      if (_activeTicketId != null) {
        // Load messages for this ticket
        final resMsgs = await http.get(
          Uri.parse('${ApiConfig.baseUrl}/soporte/ticket/$_activeTicketId/mensajes'),
          headers: headers,
        );
        if (resMsgs.statusCode == 200) {
          final List<dynamic> msgs = json.decode(resMsgs.body);
          if (mounted) {
            setState(() {
              _messages.addAll(msgs.reversed);
            });
          }
        }
        
        // Join ticket socket room
        _chatService.joinTicket(_activeTicketId!);
      }
    }
  }

  void _scrollToBottom() {
    if (_scrollController.hasClients) {
      _scrollController.animateTo(
        0,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
    }
  }

  void _sendMessage() {
    final text = _controller.text.trim();
    if (text.isEmpty || _activeTicketId == null) return;

    _chatService.sendMessageSupport(_activeTicketId!, text);
    _controller.clear();
  }

  @override
  void dispose() {
    if (_activeTicketId != null) {
      _chatService.leaveTicket(_activeTicketId!);
    }
    _chatService.disconnect();
    _controller.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        backgroundColor: Color(0xFF0a0a0a),
        body: Center(child: CircularProgressIndicator(color: Colors.green)),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Chat con Soporte'),
        backgroundColor: const Color(0xFF1a1a1a),
        elevation: 0,
      ),
      backgroundColor: const Color(0xFF0a0a0a),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              reverse: true,
              padding: const EdgeInsets.all(16),
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                final msg = _messages[index];
                return _buildMessage(msg);
              },
            ),
          ),
          _buildInputArea(),
        ],
      ),
    );
  }

  Widget _buildMessage(dynamic msg) {
    final isUser = msg['remitente_tipo'] == 'usuario';

    return Align(
      alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        constraints: BoxConstraints(
          maxWidth: MediaQuery.of(context).size.width * 0.75,
        ),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: isUser ? Colors.green.withOpacity(0.2) : Colors.white.withOpacity(0.05),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isUser ? Colors.green.withOpacity(0.5) : Colors.white12,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              isUser ? 'Tú' : 'Soporte',
              style: TextStyle(
                color: isUser ? Colors.green : Colors.blueAccent,
                fontSize: 12,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              msg['contenido'] ?? '',
              style: const TextStyle(color: Colors.white, fontSize: 14),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInputArea() {
    return Container(
      padding: const EdgeInsets.all(16).copyWith(
        bottom: MediaQuery.of(context).padding.bottom + 16,
      ),
      decoration: BoxDecoration(
        color: const Color(0xFF1a1a1a),
        border: Border(
          top: BorderSide(color: Colors.white.withOpacity(0.1)),
        ),
      ),
      child: Row(
        children: [
          Expanded(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              decoration: BoxDecoration(
                color: Colors.black,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: Colors.white.withOpacity(0.1)),
              ),
              child: TextField(
                controller: _controller,
                style: const TextStyle(color: Colors.white),
                decoration: const InputDecoration(
                  hintText: 'Escribe un mensaje...',
                  hintStyle: TextStyle(color: Colors.white54),
                  border: InputBorder.none,
                ),
                onSubmitted: (_) => _sendMessage(),
              ),
            ),
          ),
          const SizedBox(width: 12),
          GestureDetector(
            onTap: _sendMessage,
            child: Container(
              padding: const EdgeInsets.all(12),
              decoration: const BoxDecoration(
                color: Colors.green,
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.send, color: Colors.black, size: 20),
            ),
          ),
        ],
      ),
    );
  }
}
