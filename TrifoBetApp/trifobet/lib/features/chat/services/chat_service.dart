import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'package:shared_preferences/shared_preferences.dart';
import '../../../core/config/api_config.dart';

class ChatService {
  IO.Socket? _socket;
  final String namespace;
  
  // Streams for messages
  final _messageController = StreamController<dynamic>.broadcast();
  Stream<dynamic> get onMessage => _messageController.stream;

  final _historyController = StreamController<List<dynamic>>.broadcast();
  Stream<List<dynamic>> get onHistory => _historyController.stream;

  ChatService({required this.namespace});

  Future<void> connect() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');

    if (token == null) {
      debugPrint('ChatService: No token found. Cannot connect.');
      return;
    }

    final url = '${ApiConfig.baseUrl}$namespace';
    debugPrint('Connecting to socket: $url');

    _socket = IO.io(
      url,
      IO.OptionBuilder()
          .setTransports(['websocket'])
          .disableAutoConnect()
          .setAuth({'token': token})
          .setExtraHeaders({'Authorization': 'Bearer $token'})
          .build(),
    );

    _socket?.onConnect((_) {
      debugPrint('Connected to $namespace');
    });

    _socket?.onConnectError((err) {
      debugPrint('Connection Error ($namespace): $err');
    });

    _socket?.onDisconnect((_) {
      debugPrint('Disconnected from $namespace');
    });

    // Escuchar historial general (Chat Global)
    _socket?.on('chat_history', (data) {
      if (data is List) {
        _historyController.add(data);
      }
    });

    // Escuchar mensajes nuevos
    _socket?.on('new_message', (data) {
      _messageController.add(data);
    });

    // Escuchar mensajes de soporte
    _socket?.on('newMessage', (data) {
      _messageController.add(data);
    });

    // Escuchar mensajes editados
    _socket?.on('message_edited', (data) {
      _messageController.add({'type': 'edited', 'data': data});
    });

    // Escuchar reacciones
    _socket?.on('message_reacted', (data) {
      _messageController.add({'type': 'reacted', 'data': data});
    });

    _socket?.connect();
  }

  void sendMessageGlobal(String text, {dynamic replyTo}) {
    _socket?.emit('send_message', {'text': text, 'replyTo': replyTo});
  }

  void editMessage(String messageId, String text) {
    _socket?.emit('edit_message', {'messageId': messageId, 'text': text});
  }

  void reactMessage(String messageId, String reaction) {
    _socket?.emit('react_message', {'messageId': messageId, 'reaction': reaction});
  }

  void joinTicket(int ticketId) {
    _socket?.emit('joinTicket', {'ticketId': ticketId});
  }

  void leaveTicket(int ticketId) {
    _socket?.emit('leaveTicket', {'ticketId': ticketId});
  }

  void sendMessageSupport(int ticketId, String content) {
    _socket?.emit('sendMessage', {
      'ticketId': ticketId,
      'contenido': content,
    });
  }

  void disconnect() {
    _socket?.disconnect();
    _socket?.dispose();
    _messageController.close();
    _historyController.close();
  }
}
