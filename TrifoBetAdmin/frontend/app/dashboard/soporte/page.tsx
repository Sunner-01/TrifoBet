'use client'

import { useState } from 'react'
import { Send, Image as ImageIcon, User } from 'lucide-react'

interface ChatMessage {
  id: string
  usuario: string
  usuarioId: string
  contenido: string
  imagen?: string
  timestamp: string
  tipo: 'usuario' | 'admin'
}

const mockChats: ChatMessage[] = [
  {
    id: '1',
    usuario: 'Juan García',
    usuarioId: 'user_1',
    contenido: 'Hola, tengo un problema con mi deposito que no se ha procesado',
    timestamp: '2024-06-09 10:30',
    tipo: 'usuario',
  },
  {
    id: '2',
    usuario: 'Admin',
    usuarioId: 'admin',
    contenido: 'Hola Juan, verificaré tu transacción. ¿Cuál es el ID de la transacción?',
    timestamp: '2024-06-09 10:35',
    tipo: 'admin',
  },
  {
    id: '3',
    usuario: 'Juan García',
    usuarioId: 'user_1',
    contenido: 'El ID es TXN-20240609-001',
    timestamp: '2024-06-09 10:36',
    tipo: 'usuario',
  },
  {
    id: '4',
    usuario: 'María López',
    usuarioId: 'user_2',
    contenido: 'No puedo acceder a mi cuenta, aparece error 403',
    timestamp: '2024-06-09 09:45',
    tipo: 'usuario',
  },
  {
    id: '5',
    usuario: 'Admin',
    usuarioId: 'admin',
    contenido: 'Estamos verificando el acceso. Intenta limpiar cookies y caché.',
    timestamp: '2024-06-09 09:50',
    tipo: 'admin',
  },
]

export default function SoportePage() {
  const [chats, setChats] = useState<ChatMessage[]>(mockChats)
  const [selectedUserId, setSelectedUserId] = useState<string>('user_1')
  const [newMessage, setNewMessage] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const uniqueUsers = Array.from(
    new Map(chats.map((chat) => [chat.usuarioId, chat])).values()
  ).filter((c) => c.tipo === 'usuario')

  const selectedUserChats = chats.filter(
    (chat) => chat.usuarioId === selectedUserId || (chat.tipo === 'admin' && chats.find((c) => c.usuarioId === selectedUserId && c.id < chat.id))
  )

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() && !selectedFile) return

    const newChat: ChatMessage = {
      id: Date.now().toString(),
      usuario: 'Admin',
      usuarioId: 'admin',
      contenido: newMessage,
      imagen: selectedFile ? URL.createObjectURL(selectedFile) : undefined,
      timestamp: new Date().toLocaleString('es-BO'),
      tipo: 'admin',
    }

    setChats([...chats, newChat])
    setNewMessage('')
    setSelectedFile(null)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  return (
    <div className="space-y-6 h-[calc(100vh-200px)]">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Centro de Soporte</h1>
        <p className="text-muted-foreground">Chat en tiempo real con usuarios</p>
      </div>

      {/* Main Chat Layout */}
      <div className="flex gap-6 h-full">
        {/* Users List */}
        <div className="w-80 bg-card border border-border rounded-lg overflow-hidden flex flex-col">
          <div className="p-4 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">Usuarios</h2>
          </div>
          <div className="overflow-y-auto flex-1">
            {uniqueUsers.map((user) => (
              <button
                key={user.usuarioId}
                onClick={() => setSelectedUserId(user.usuarioId)}
                className={`w-full p-4 text-left border-b border-border transition-colors ${
                  selectedUserId === user.usuarioId
                    ? 'bg-primary/10 border-l-4 border-l-primary'
                    : 'hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <User size={16} className="text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground text-sm">{user.usuario}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.contenido}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 bg-card border border-border rounded-lg overflow-hidden flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-border">
            <h3 className="text-lg font-semibold text-foreground">
              {chats.find((c) => c.usuarioId === selectedUserId)?.usuario || 'Selecciona un usuario'}
            </h3>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {selectedUserChats.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.tipo === 'admin' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-md ${
                    message.tipo === 'admin'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  } rounded-lg p-4 space-y-2`}
                >
                  {message.imagen && (
                    <img
                      src={message.imagen}
                      alt="adjunto"
                      className="max-w-xs rounded-lg"
                    />
                  )}
                  <p className="text-sm">{message.contenido}</p>
                  <p className="text-xs opacity-70">{message.timestamp}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-border space-y-3">
            {selectedFile && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ImageIcon size={16} />
                {selectedFile.name}
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Escribe tu respuesta..."
                className="flex-1 px-4 py-2 border border-border bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <label className="p-2 hover:bg-muted rounded-lg cursor-pointer transition-colors">
                <ImageIcon size={20} className="text-muted-foreground" />
                <input
                  type="file"
                  onChange={handleFileSelect}
                  accept="image/*"
                  className="hidden"
                />
              </label>
              <button
                type="submit"
                className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors"
              >
                <Send size={20} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
