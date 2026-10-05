"use client"

import { useState, useEffect, useRef } from "react"
import { MessageSquare, X, Send, Edit2, CornerUpLeft, Smile } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getStoredToken, getStoredUser } from "@/lib/auth"
import { io } from "socket.io-client"
import { API_Back_Url } from "@/lib/config"

export function LiveChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [socket, setSocket] = useState(null)
  const [isConnecting, setIsConnecting] = useState(false)
  
  const [editingMessageId, setEditingMessageId] = useState(null)
  const [replyingTo, setReplyingTo] = useState(null)
  const [hoveredMessageId, setHoveredMessageId] = useState(null)
  const [showReactionMenuFor, setShowReactionMenuFor] = useState(null)

  const messagesEndRef = useRef(null)
  const reactionOptions = ["👍", "❤️", "😂", "😮", "😢", "😡"]

  useEffect(() => {
    const token = getStoredToken()
    const storedUser = getStoredUser()
    
    if (token && storedUser) {
      setIsAuthenticated(true)
      setUser(storedUser)

      if (socket) return

      setIsConnecting(true)
      
      const newSocket = io(`${API_Back_Url}/chat`, {
        auth: { token }
      })

      newSocket.on("connect", () => {
        setIsConnecting(false)
      })

      newSocket.on("chat_history", (history) => {
        setMessages(history)
        scrollToBottom()
      })

      newSocket.on("new_message", (message) => {
        setMessages((prev) => [...prev, message])
        scrollToBottom()
      })

      newSocket.on("message_edited", (updatedMessage) => {
        setMessages((prev) => prev.map(m => m.id === updatedMessage.id ? updatedMessage : m))
      })

      newSocket.on("message_reacted", (updatedMessage) => {
        setMessages((prev) => prev.map(m => m.id === updatedMessage.id ? updatedMessage : m))
      })

      setSocket(newSocket)

      return () => {
        newSocket.disconnect()
      }
    } else {
      setIsAuthenticated(false)
      setUser(null)
      if (socket) {
        socket.disconnect()
        setSocket(null)
      }
    }
  }, []) 

  useEffect(() => {
    const handleAuthChange = () => {
      const token = getStoredToken()
      setIsAuthenticated(!!token)
      if (!token) {
        if (socket) {
          socket.disconnect()
          setSocket(null)
        }
        setIsOpen(false)
      } else {
        window.location.reload()
      }
    }
    
    window.addEventListener("auth-change", handleAuthChange)
    return () => window.removeEventListener("auth-change", handleAuthChange)
  }, [socket])

  const COMMON_EMOJIS = [
    "😀","😂","🤣","😊","😍","🥰","😘","😜","🤪","😎",
    "🤩","🥳","😏","😒","😔","😢","😭","😡","🤬","🤯",
    "😳","🥵","🥶","😱","🤔","🤫","🥱","😴","😷","🤢",
    "👍","👎","👌","✌️","🤞","🫶","❤️","🔥","💯","✨"
  ]

  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  // Cerrar menús al hacer click afuera
  useEffect(() => {
    const handleClickOutside = () => {
      if (showReactionMenuFor) setShowReactionMenuFor(null)
      if (showEmojiPicker) setShowEmojiPicker(false)
    }
    document.addEventListener("click", handleClickOutside)
    return () => document.removeEventListener("click", handleClickOutside)
  }, [showReactionMenuFor, showEmojiPicker])

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, 100)
  }

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !socket) return

    if (editingMessageId) {
      socket.emit("edit_message", { messageId: editingMessageId, text: newMessage })
      setEditingMessageId(null)
    } else {
      socket.emit("send_message", { text: newMessage, replyTo: replyingTo })
      setReplyingTo(null)
    }
    setNewMessage("")
    setShowEmojiPicker(false)
  }

  const handleReact = (e, messageId, reaction) => {
    e.stopPropagation()
    if (!socket) return
    socket.emit("react_message", { messageId, reaction })
    setShowReactionMenuFor(null)
  }

  if (!isAuthenticated) return null

  return (
    <div className="sticky top-24 z-30 flex flex-col items-end w-full">
      {!isOpen && (
        <Button
          onClick={() => {
            setIsOpen(true)
            scrollToBottom()
          }}
          className="w-full h-12 rounded-lg shadow-sm bg-muted/80 hover:bg-muted border flex items-center justify-between px-4 text-foreground transition-all"
        >
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <span className="font-bold text-sm">Chat Global</span>
          </div>
          <div className={`h-2 w-2 rounded-full ${isConnecting ? 'bg-yellow-500' : 'bg-green-500 animate-pulse'}`} />
        </Button>
      )}

      {isOpen && (
        <div className="w-full h-[550px] bg-card border border-border shadow-md rounded-xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between px-4 py-3 bg-muted/40 border-b border-border">
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${isConnecting ? 'bg-yellow-500' : 'bg-green-500 animate-pulse'}`} />
              <h3 className="font-bold text-sm">Chat Global</h3>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-7 w-7 rounded-full hover:bg-muted">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground text-xs text-center px-4 opacity-60">
                Aún no hay mensajes. ¡Rompe el hielo!
              </div>
            ) : (
              messages.map((msg, i) => {
                const isMe = msg.user_id === user?.id
                const isFirstInGroup = i === 0 || messages[i - 1].user_id !== msg.user_id

                // Procesar reacciones
                const reactionsObj = msg.reactions || {}
                const reactionEntries = Object.entries(reactionsObj).filter(([_, users]) => users.length > 0)
                // Ordenar por cantidad (mayor a menor)
                reactionEntries.sort((a, b) => b[1].length - a[1].length)
                
                const topReactions = reactionEntries.slice(0, 2)
                const hasMoreReactions = reactionEntries.length > 2

                return (
                  <div 
                    key={msg.id || i} 
                    className={`flex flex-col mb-2 ${isMe ? "items-end" : "items-start"}`}
                    onMouseEnter={() => setHoveredMessageId(msg.id)}
                    onMouseLeave={() => setHoveredMessageId(null)}
                  >
                    {/* FOTO y NOMBRE arriba del mensaje */}
                    {!isMe && isFirstInGroup && (
                      <div className="flex items-center gap-2 mb-1 ml-1">
                        <img 
                          src={msg.avatar_url || `https://ui-avatars.com/api/?name=${msg.username}&background=random`} 
                          alt={msg.username}
                          className="w-5 h-5 rounded-full object-cover shadow-sm"
                        />
                        <span className="text-[11px] font-bold text-muted-foreground">
                          {msg.username}
                        </span>
                      </div>
                    )}

                    <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[90%]`}>
                      
                      {/* Reply Reference */}
                      {msg.reply_to && (
                        <div className={`text-[10px] bg-muted/50 p-1.5 rounded-md mb-1 border-l-2 border-primary truncate max-w-full opacity-80 flex gap-1 ${isMe ? "mr-1" : "ml-1"}`}>
                          <span className="font-semibold">{msg.reply_to.username}: </span>
                          <span className="truncate">{msg.reply_to.text}</span>
                        </div>
                      )}

                      {/* Burbuja Principal */}
                      <div className={`group relative flex items-center gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                        <div
                          className={`px-3 py-2 text-sm shadow-sm relative ${
                            isMe 
                              ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-sm" 
                              : "bg-muted text-foreground rounded-2xl rounded-tl-sm"
                          }`}
                        >
                          {msg.message}
                        </div>

                        {/* Opciones (Responder / Editar) flotando libres al lado */}
                        {hoveredMessageId === msg.id && (
                          <div className={`flex gap-3 z-10 transition-opacity opacity-70 hover:opacity-100 ${isMe ? "mr-1" : "ml-1"}`}>
                            <button 
                              onClick={() => setReplyingTo({ id: msg.id, username: msg.username, text: msg.message })} 
                              className="text-muted-foreground hover:text-primary transition-transform hover:scale-110" 
                              title="Responder"
                            >
                              <CornerUpLeft className="w-4 h-4" />
                            </button>
                            {isMe && (
                              <button 
                                onClick={() => { setEditingMessageId(msg.id); setNewMessage(msg.message) }} 
                                className="text-muted-foreground hover:text-primary transition-transform hover:scale-110" 
                                title="Editar"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* Fila inferior: Reacciones y Hora */}
                      <div className={`flex items-center gap-2 mt-1 relative ${isMe ? "flex-row-reverse" : "flex-row"} w-full`}>
                        
                        {/* Botón Carita Feliz para reaccionar (Abajo a la izquierda siempre o depende de isMe) */}
                        <div className={`relative flex items-center ${isMe ? "mr-1" : "ml-1"}`}>
                          {hoveredMessageId === msg.id && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowReactionMenuFor(showReactionMenuFor === msg.id ? null : msg.id)
                              }}
                              className="text-muted-foreground hover:text-primary transition-transform hover:scale-110 p-0.5"
                              title="Reaccionar"
                            >
                              <Smile className="w-[14px] h-[14px]" />
                            </button>
                          )}

                          {/* Menú de Reacciones Estilo Facebook */}
                          {showReactionMenuFor === msg.id && (
                            <div 
                              className={`absolute bottom-full mb-1 flex gap-1 p-1.5 bg-background border border-border shadow-lg rounded-full z-50 animate-in fade-in zoom-in-95 ${isMe ? "right-0" : "left-0"}`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              {reactionOptions.map((emoji) => {
                                const hasReacted = reactionsObj[emoji]?.includes(user?.id)
                                return (
                                  <button
                                    key={emoji}
                                    onClick={(e) => handleReact(e, msg.id, emoji)}
                                    className={`text-base hover:scale-125 transition-transform p-1 rounded-full ${hasReacted ? "bg-primary/20" : "hover:bg-muted"}`}
                                  >
                                    {emoji}
                                  </button>
                                )
                              })}
                            </div>
                          )}
                        </div>

                        {/* Mostrar Reacciones Activas (Máximo 2 + suspensivos) */}
                        {topReactions.length > 0 && (
                          <div className="flex items-center gap-1">
                            {topReactions.map(([reaction, users]) => (
                              <span 
                                key={reaction} 
                                className={`text-[10px] px-1.5 py-0.5 rounded-full border flex items-center gap-1 ${users.includes(user?.id) ? 'bg-primary/10 border-primary/30' : 'bg-muted/50 border-transparent'}`}
                                title={`${users.length} reacciones de ${reaction}`}
                              >
                                {reaction}
                                {users.length > 1 && <span className="font-semibold">{users.length}</span>}
                              </span>
                            ))}
                            {hasMoreReactions && (
                              <span className="text-[10px] px-1 text-muted-foreground font-bold">...</span>
                            )}
                          </div>
                        )}

                        <span className="text-[9px] text-muted-foreground opacity-60 ml-auto flex-shrink-0">
                          {msg.is_edited && "editado • "}
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {(replyingTo || editingMessageId) && (
            <div className="px-3 py-2 bg-muted/30 border-t border-border flex justify-between items-center animate-in slide-in-from-bottom-2">
              <div className="text-xs truncate flex-1 mr-2">
                {editingMessageId ? (
                  <span className="text-primary font-semibold">Editando mensaje...</span>
                ) : (
                  <div className="truncate">
                    <span className="text-primary font-semibold">Respondiendo a {replyingTo.username}: </span>
                    <span className="opacity-70">{replyingTo.text}</span>
                  </div>
                )}
              </div>
              <button 
                onClick={() => { setReplyingTo(null); setEditingMessageId(null); if (editingMessageId) setNewMessage(""); }} 
                className="text-muted-foreground hover:text-foreground shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="p-3 bg-muted/20 border-t border-border relative">
            {showEmojiPicker && (
              <div 
                className="absolute bottom-full mb-2 right-4 w-64 p-2 bg-background border border-border shadow-xl rounded-xl grid grid-cols-8 gap-1 z-50 animate-in fade-in slide-in-from-bottom-2"
                onClick={(e) => e.stopPropagation()}
              >
                {COMMON_EMOJIS.map(emoji => (
                  <button 
                    key={emoji}
                    type="button" 
                    onClick={() => { 
                      setNewMessage(prev => prev + emoji);
                    }} 
                    className="text-lg hover:bg-muted p-1 rounded transition-colors hover:scale-110"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
            <form onSubmit={handleSendMessage} className="flex gap-2 items-center relative">
              <div className="relative flex-1">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={editingMessageId ? "Escribe tu nuevo mensaje..." : "Escribe un mensaje..."}
                  className="w-full rounded-full bg-background h-10 border-border pr-10"
                  maxLength={200}
                  autoFocus={!!editingMessageId}
                />
                <button 
                  type="button" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowEmojiPicker(!showEmojiPicker);
                  }}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors hover:scale-110 ${showEmojiPicker ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                  title="Añadir emoji"
                >
                  <Smile className="w-[18px] h-[18px]" />
                </button>
              </div>
              <Button type="submit" size="icon" className="rounded-full shrink-0 h-10 w-10" disabled={!newMessage.trim() || isConnecting}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
