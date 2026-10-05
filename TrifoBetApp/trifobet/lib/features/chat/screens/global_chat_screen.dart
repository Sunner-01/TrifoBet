import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/chat_service.dart';
import '../../../shared/utils/jwt_utils.dart';

class GlobalChatScreen extends StatefulWidget {
  const GlobalChatScreen({super.key});

  @override
  State<GlobalChatScreen> createState() => _GlobalChatScreenState();
}

class _GlobalChatScreenState extends State<GlobalChatScreen> {
  final TextEditingController _controller = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  late final ChatService _chatService;
  final List<dynamic> _messages = [];
  
  int? _currentUserId;
  String? _editingMessageId;
  dynamic _replyingTo;
  bool _showEmojiPicker = false;

  final List<String> _commonEmojis = [
    "😀","😂","🤣","😊","😍","🥰","😘","😜","🤪","😎",
    "🤩","🥳","😏","😒","😔","😢","😭","😡","🤬","🤯",
    "👍","👎","❤️","🔥","💯","✅","❌","⚽","🏀","🎾"
  ];

  @override
  void initState() {
    super.initState();
    _initChat();
  }

  Future<void> _initChat() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');
    if (token != null) {
      _currentUserId = JwtUtils.getUserId(token);
    }

    _chatService = ChatService(namespace: '/chat');
    await _chatService.connect();

    _chatService.onHistory.listen((history) {
      if (mounted) {
        setState(() {
          _messages.clear();
          _messages.addAll(history.reversed);
        });
        _scrollToBottom();
      }
    });

    _chatService.onMessage.listen((data) {
      if (mounted) {
        if (data is Map && data['type'] == 'edited') {
          final updated = data['data'];
          setState(() {
            final idx = _messages.indexWhere((m) => m['id'].toString() == updated['id'].toString());
            if (idx != -1) _messages[idx] = updated;
          });
        } else if (data is Map && data['type'] == 'reacted') {
          final updated = data['data'];
          setState(() {
            final idx = _messages.indexWhere((m) => m['id'].toString() == updated['id'].toString());
            if (idx != -1) _messages[idx] = updated;
          });
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Reacción confirmada: ${updated['reactions']}')),
          );
        } else {
          // Es un mensaje nuevo
          setState(() {
            _messages.insert(0, data);
          });
          _scrollToBottom();
        }
      }
    });
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

  @override
  void dispose() {
    _controller.dispose();
    _scrollController.dispose();
    _chatService.disconnect();
    super.dispose();
  }

  void _sendMessage() {
    final text = _controller.text.trim();
    if (text.isEmpty) return;

    if (_editingMessageId != null) {
      _chatService.editMessage(_editingMessageId!, text);
      setState(() {
        _editingMessageId = null;
      });
    } else {
      _chatService.sendMessageGlobal(text, replyTo: _replyingTo);
      setState(() {
        _replyingTo = null;
      });
    }
    
    _controller.clear();
  }

  void _showReactionMenu(dynamic msg) {
    final reactions = ["👍", "❤️", "😂", "😮", "😢", "😡"];
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF1a1a1a),
      builder: (context) => Container(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('Reaccionar', style: TextStyle(color: Colors.white)),
            const SizedBox(height: 16),
            Wrap(
              alignment: WrapAlignment.spaceAround,
              spacing: 8,
              children: reactions.map((emoji) {
                return GestureDetector(
                  behavior: HitTestBehavior.opaque,
                  onTap: () {
                    final messageId = msg['id'].toString();
                    _chatService.reactMessage(messageId, emoji);
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Enviando reacción $emoji al mensaje $messageId')),
                    );
                    Navigator.pop(context);
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 12),
                    child: Text(emoji, style: const TextStyle(fontSize: 32)),
                  ),
                );
              }).toList(),
            ),
          ],
        ),
      ),
    );
  }

  void _showActionMenu(dynamic msg) {
    final isMine = msg['user_id'] == _currentUserId;
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF1a1a1a),
      builder: (context) => Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          ListTile(
            leading: const Icon(Icons.reply, color: Colors.white),
            title: const Text('Responder', style: TextStyle(color: Colors.white)),
            onTap: () {
              Navigator.pop(context);
              setState(() {
                _replyingTo = msg;
                _editingMessageId = null;
              });
            },
          ),
          if (isMine)
            ListTile(
              leading: const Icon(Icons.edit, color: Colors.white),
              title: const Text('Editar', style: TextStyle(color: Colors.white)),
              onTap: () {
                Navigator.pop(context);
                setState(() {
                  _editingMessageId = msg['id'].toString();
                  _controller.text = msg['message'] ?? '';
                  _replyingTo = null;
                });
              },
            ),
          if (!isMine)
            ListTile(
              leading: const Icon(Icons.emoji_emotions, color: Colors.white),
              title: const Text('Reaccionar', style: TextStyle(color: Colors.white)),
              onTap: () {
                Navigator.pop(context);
                _showReactionMenu(msg);
              },
            ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Cabecera del BottomSheet
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          decoration: BoxDecoration(
            color: const Color(0xFF1a1a1a),
            borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Chat Global',
                style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
              ),
              IconButton(
                icon: const Icon(Icons.close, color: Colors.white),
                onPressed: () => Navigator.pop(context),
              ),
            ],
          ),
        ),
        
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
        
        if (_replyingTo != null || _editingMessageId != null)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            color: Colors.grey.withOpacity(0.1),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    _editingMessageId != null
                        ? 'Editando mensaje...'
                        : 'Respondiendo a ${_replyingTo['username'] ?? "Usuario"}',
                    style: const TextStyle(color: Colors.green, fontSize: 12),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close, color: Colors.white54, size: 16),
                  onPressed: () => setState(() {
                    _replyingTo = null;
                    _editingMessageId = null;
                    _controller.clear();
                  }),
                ),
              ],
            ),
          ),
          
        _buildInputArea(),
        _buildEmojiPicker(),
      ],
    );
  }

  Widget _buildMessage(dynamic msg) {
    final isMine = msg['user_id'] == _currentUserId;

    return GestureDetector(
      onLongPress: () => _showActionMenu(msg),
      child: Align(
        alignment: isMine ? Alignment.centerRight : Alignment.centerLeft,
        child: Container(
          margin: const EdgeInsets.only(bottom: 12),
          constraints: BoxConstraints(
            maxWidth: MediaQuery.of(context).size.width * 0.75,
          ),
          child: Column(
            crossAxisAlignment: isMine ? CrossAxisAlignment.end : CrossAxisAlignment.start,
            children: [
              // Si es una respuesta
              if (msg['reply_to'] != null && msg['reply_to'] is Map)
                Container(
                  padding: const EdgeInsets.all(8),
                  margin: const EdgeInsets.only(bottom: 4),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.05),
                    borderRadius: BorderRadius.circular(8),
                    border: const Border(left: BorderSide(color: Colors.green, width: 3)),
                  ),
                  child: Text(
                    msg['reply_to']['message'] ?? msg['reply_to']['text'] ?? '',
                    style: const TextStyle(color: Colors.white54, fontSize: 12),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                decoration: BoxDecoration(
                  color: isMine ? Colors.green.withOpacity(0.2) : Colors.white.withOpacity(0.05),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: isMine ? Colors.green.withOpacity(0.5) : Colors.white12,
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      isMine ? 'Tú' : (msg['username'] ?? 'Usuario'),
                      style: TextStyle(
                        color: isMine ? Colors.green : Colors.blueAccent,
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      msg['message'] ?? '', // CORRECCIÓN AQUÍ: message en lugar de text
                      style: const TextStyle(color: Colors.white, fontSize: 14),
                    ),
                    if (msg['is_edited'] == true)
                      const Padding(
                        padding: EdgeInsets.only(top: 4.0),
                        child: Text(
                          '(editado)',
                          style: TextStyle(color: Colors.white38, fontSize: 10),
                        ),
                      ),
                  ],
                ),
              ),
              
              // Reacciones
              Builder(
                builder: (context) {
                  Map<String, dynamic>? reactionsMap;
                  final raw = msg['reactions'];
                  if (raw is Map) {
                    reactionsMap = Map<String, dynamic>.from(raw);
                  } else if (raw is String) {
                    try {
                      final decoded = jsonDecode(raw);
                      if (decoded is Map) {
                        reactionsMap = Map<String, dynamic>.from(decoded);
                      }
                    } catch (_) {}
                  }

                  if (reactionsMap == null || reactionsMap.isEmpty) {
                    return const SizedBox.shrink();
                  }

                  return Padding(
                    padding: const EdgeInsets.only(top: 4.0),
                    child: Wrap(
                      spacing: 4,
                      children: reactionsMap.entries.map((entry) {
                        final emoji = entry.key;
                        int count = 0;
                        if (entry.value is List) {
                          count = (entry.value as List).length;
                        } else if (entry.value is int) {
                          count = entry.value as int;
                        }
                        if (count == 0) return const SizedBox.shrink();

                        return Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text('$emoji $count', style: const TextStyle(fontSize: 12)),
                        );
                      }).toList(),
                    ),
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInputArea() {
    return Container(
      padding: const EdgeInsets.all(16).copyWith(
        bottom: MediaQuery.of(context).padding.bottom + 16, // Espacio para el teclado en BottomSheet
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
              padding: const EdgeInsets.symmetric(horizontal: 4),
              decoration: BoxDecoration(
                color: Colors.black,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: Colors.white.withOpacity(0.1)),
              ),
              child: Row(
                children: [
                  IconButton(
                    icon: Icon(
                      _showEmojiPicker ? Icons.keyboard : Icons.emoji_emotions,
                      color: Colors.white54,
                    ),
                    onPressed: () {
                      FocusScope.of(context).unfocus();
                      setState(() {
                        _showEmojiPicker = !_showEmojiPicker;
                      });
                    },
                  ),
                  Expanded(
                    child: TextField(
                      controller: _controller,
                      style: const TextStyle(color: Colors.white),
                      onTap: () {
                        if (_showEmojiPicker) {
                          setState(() => _showEmojiPicker = false);
                        }
                      },
                      decoration: const InputDecoration(
                        hintText: 'Escribe un mensaje...',
                        hintStyle: TextStyle(color: Colors.white54),
                        border: InputBorder.none,
                      ),
                      onSubmitted: (_) => _sendMessage(),
                    ),
                  ),
                ],
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

  Widget _buildEmojiPicker() {
    if (!_showEmojiPicker) return const SizedBox.shrink();
    return Container(
      height: 250,
      color: const Color(0xFF0a0a0a),
      child: GridView.builder(
        padding: const EdgeInsets.all(8),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 7,
          crossAxisSpacing: 8,
          mainAxisSpacing: 8,
        ),
        itemCount: _commonEmojis.length,
        itemBuilder: (context, index) {
          return GestureDetector(
            behavior: HitTestBehavior.opaque,
            onTap: () {
              _controller.text += _commonEmojis[index];
              _controller.selection = TextSelection.fromPosition(
                TextPosition(offset: _controller.text.length),
              );
            },
            child: Center(
              child: Text(_commonEmojis[index], style: const TextStyle(fontSize: 28)),
            ),
          );
        },
      ),
    );
  }
}
