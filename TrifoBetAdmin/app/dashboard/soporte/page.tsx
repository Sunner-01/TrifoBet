'use client'

import { API_URL } from '@/lib/api'
import { useState, useEffect, useRef } from 'react'
import { Send, Image as ImageIcon, User, CheckCircle, Tag } from 'lucide-react'
import { io, Socket } from 'socket.io-client'

interface UsuarioInfo {
  nombre?: string;
  apellido1?: string;
  correo?: string;
}

interface Ticket {
  id: number;
  asunto: string;
  categoria: string;
  estado: string;
  usuario_id: number;
  usuario?: UsuarioInfo;
}

interface Message {
  id: number;
  contenido: string;
  imagen_url?: string;
  fecha_creacion: string;
  remitente_tipo: 'usuario' | 'admin';
}

export default function SoportePage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [socket, setSocket] = useState<Socket | null>(null)
  
  // Filtros
  const [filterEstado, setFilterEstado] = useState('abierto')
  const [filterCategoria, setFilterCategoria] = useState('Todos')

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchTickets()

    const token = sessionStorage.getItem("admin_token")
    if (token) {
      const baseUrl = API_URL
      const newSocket = io(`${baseUrl}/soporte`, {
        auth: { token: `Bearer ${token}` }
      })
      
      newSocket.on("newMessage", (msg: Message) => {
        setMessages((prev) => [...prev, msg])
        scrollToBottom()
      })
      
      setSocket(newSocket)
      return () => {
        newSocket.close()
      }
    }
  }, [])

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, 100)
  }

  const fetchTickets = async () => {
    try {
      const token = sessionStorage.getItem("admin_token")
      if (!token) return
      
      const baseUrl = API_URL
      const res = await fetch(`${baseUrl}/soporte/admin/tickets`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setTickets(data)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const selectTicket = async (ticket: Ticket) => {
    if (socket && activeTicket) {
      socket.emit("leaveTicket", { ticketId: activeTicket.id })
    }
    
    setActiveTicket(ticket)
    
    try {
      const token = sessionStorage.getItem("admin_token")
      const baseUrl = API_URL
      const res = await fetch(`${baseUrl}/soporte/ticket/${ticket.id}/mensajes`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setMessages(data)
        scrollToBottom()
      }
    } catch (e) {
      console.error(e)
    }

    if (socket) {
      socket.emit("joinTicket", { ticketId: ticket.id })
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() && !selectedFile) return
    if (!socket || !activeTicket) return

    let imagenUrl = null

    if (selectedFile) {
      const formData = new FormData()
      formData.append("file", selectedFile)
      
      try {
        const token = sessionStorage.getItem("admin_token")
        const baseUrl = API_URL
        const res = await fetch(`${baseUrl}/soporte/upload`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        })
        
        if (res.ok) {
          const data = await res.json()
          imagenUrl = data.url
        }
      } catch (err) {
        console.error("Error subiendo imagen", err)
        return
      }
    }

    socket.emit("sendMessage", {
      ticketId: activeTicket.id,
      contenido: newMessage || "Archivo adjunto",
      imagenUrl,
      remitenteTipo: 'admin'
    })

    setNewMessage('')
    setSelectedFile(null)
  }

  const closeTicket = async () => {
    if (!activeTicket) return
    try {
      const token = sessionStorage.getItem("admin_token")
      const baseUrl = API_URL
      const res = await fetch(`${baseUrl}/soporte/admin/ticket/${activeTicket.id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ estado: "cerrado" })
      })
      
      if (res.ok) {
        fetchTickets()
        setActiveTicket({ ...activeTicket, estado: 'cerrado' })
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  // Filtrado
  const filteredTickets = tickets.filter(t => {
    if (filterEstado !== 'Todos' && t.estado !== filterEstado) return false
    if (filterCategoria !== 'Todos' && t.categoria !== filterCategoria) return false
    return true
  })

  // Categorías únicas para el filtro
  const categoriasUnicas = ['Todos', ...Array.from(new Set(tickets.map(t => t.categoria)))]

  return (
    <div className="space-y-4 h-[calc(100vh-150px)] flex flex-col">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Gestión de Soporte</h1>
        <p className="text-muted-foreground">Sistema de Tickets y Chat en vivo</p>
      </div>

      <div className="flex gap-4 h-full">
        {/* Panel Izquierdo: Lista de Tickets */}
        <div className="w-80 bg-card border border-border rounded-lg flex flex-col overflow-hidden">
          <div className="p-4 border-b border-border space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Bandeja de Entrada</h2>
            
            <div className="flex flex-col gap-2">
              <select 
                className="w-full text-sm p-2 bg-background border border-border rounded"
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
              >
                <option value="Todos">Todos los estados</option>
                <option value="abierto">Abiertos</option>
                <option value="cerrado">Cerrados</option>
              </select>

              <select 
                className="w-full text-sm p-2 bg-background border border-border rounded"
                value={filterCategoria}
                onChange={(e) => setFilterCategoria(e.target.value)}
              >
                {categoriasUnicas.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          </div>

          <div className="overflow-y-auto flex-1">
            {filteredTickets.map((ticket) => (
              <button
                key={ticket.id}
                onClick={() => selectTicket(ticket)}
                className={`w-full p-4 text-left border-b border-border transition-colors ${
                  activeTicket?.id === ticket.id
                    ? 'bg-primary/10 border-l-4 border-l-primary'
                    : 'hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm truncate">#{ticket.id} {ticket.asunto}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${ticket.estado === 'cerrado' ? 'bg-gray-500' : 'bg-green-500'} text-white`}>
                    {ticket.estado}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                  <User size={12} /> {ticket.usuario?.nombre || 'Usuario'} | <Tag size={12} /> {ticket.categoria}
                </div>
              </button>
            ))}
            {filteredTickets.length === 0 && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No hay tickets que coincidan con los filtros.
              </div>
            )}
          </div>
        </div>

        {/* Panel Derecho: Área de Chat */}
        <div className="flex-1 bg-card border border-border rounded-lg overflow-hidden flex flex-col">
          {activeTicket ? (
            <>
              {/* Header de Chat */}
              <div className="p-4 border-b border-border flex justify-between items-center bg-muted/20">
                <div>
                  <h3 className="text-lg font-bold text-foreground">
                    #{activeTicket.id} - {activeTicket.asunto}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Jugador: {activeTicket.usuario?.nombre} {activeTicket.usuario?.apellido1} ({activeTicket.usuario?.correo})
                  </p>
                </div>
                {activeTicket.estado !== 'cerrado' && (
                  <button 
                    onClick={closeTicket}
                    className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-md transition-colors text-sm font-medium"
                  >
                    <CheckCircle size={16} /> Cerrar Ticket
                  </button>
                )}
              </div>

              {/* Mensajes */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[url('https://web.whatsapp.com/img/bg-chat-tile-dark_a4be512e7195b6b733d9110b408f075d.png')] bg-repeat bg-[#0b141a]">
                {messages.length === 0 ? (
                  <div className="flex justify-center mt-10">
                    <div className="bg-[#1e2b33] text-gray-300 text-sm py-2 px-4 rounded-xl shadow-md border border-[#2a3942]">
                      No hay mensajes en este ticket aún.
                    </div>
                  </div>
                ) : (
                  messages.map((message) => {
                    const isMe = message.remitente_tipo === 'admin'
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`relative max-w-[75%] rounded-lg p-3 shadow-sm ${
                            isMe
                              ? 'bg-[#005c4b] text-[#e9edef] rounded-tr-none'
                              : 'bg-[#202c33] text-[#e9edef] rounded-tl-none'
                          }`}
                        >
                          {!isMe && (
                            <p className="text-xs font-bold text-[#53bdeb] mb-1">
                              {activeTicket.usuario?.nombre || 'Jugador'}
                            </p>
                          )}
                          {isMe && (
                            <p className="text-xs font-bold text-[#00a884] mb-1">
                              Soporte TrifoBet
                            </p>
                          )}
                          
                          {message.imagen_url && (
                            <div className="mb-2 overflow-hidden rounded-md cursor-pointer hover:opacity-90 transition-opacity">
                              <img
                                src={message.imagen_url}
                                alt="adjunto"
                                className="max-w-xs md:max-w-sm max-h-64 object-cover"
                              />
                            </div>
                          )}
                          <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{message.contenido}</p>
                          <div className="flex items-center justify-end gap-1 mt-1">
                            <span className="text-[11px] text-gray-400">
                              {new Date(message.fecha_creacion).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {isMe && <CheckCircle size={12} className="text-[#53bdeb]" />}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Área */}
              {activeTicket.estado !== 'cerrado' ? (
                <form onSubmit={handleSendMessage} className="p-4 bg-[#202c33] border-t border-[#2a3942] flex items-center gap-3">
                  <label className="p-2 text-gray-400 hover:text-gray-200 hover:bg-[#2a3942] rounded-full cursor-pointer transition-colors">
                    <ImageIcon size={24} />
                    <input
                      type="file"
                      onChange={handleFileSelect}
                      accept="image/*"
                      className="hidden"
                    />
                  </label>
                  
                  {selectedFile ? (
                    <div className="flex-1 bg-[#2a3942] text-[#e9edef] px-4 py-3 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ImageIcon size={18} className="text-[#00a884]" />
                        <span className="text-sm truncate max-w-[200px]">{selectedFile.name}</span>
                      </div>
                      <button type="button" onClick={() => setSelectedFile(null)} className="text-red-400 text-xs hover:underline">Quitar</button>
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Escribe un mensaje..."
                      className="flex-1 bg-[#2a3942] text-[#e9edef] px-4 py-3 rounded-lg focus:outline-none placeholder-gray-400"
                    />
                  )}

                  <button
                    type="submit"
                    className="p-3 bg-[#00a884] hover:bg-[#029676] text-white rounded-full transition-colors flex items-center justify-center shadow-md disabled:opacity-50"
                    disabled={!newMessage.trim() && !selectedFile}
                  >
                    <Send size={20} className="ml-1" />
                  </button>
                </form>
              ) : (
                <div className="p-4 bg-[#202c33] border-t border-[#2a3942] text-center text-gray-400 text-sm">
                  Este ticket ha sido cerrado. No se pueden enviar más mensajes.
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground flex-col gap-4">
              <Send size={48} className="opacity-20" />
              <p>Selecciona un ticket de la lista para ver la conversación.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
