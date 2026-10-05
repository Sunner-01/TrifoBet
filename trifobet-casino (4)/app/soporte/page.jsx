"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Phone, Mail, Clock, Search, HelpCircle, Send, Image as ImageIcon, ArrowLeft, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { io } from "socket.io-client"

export default function SoportePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()
  const [tickets, setTickets] = useState([])
  const [activeTicket, setActiveTicket] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [selectedFile, setSelectedFile] = useState(null)
  const [socket, setSocket] = useState(null)
  const [view, setView] = useState("list") // 'list', 'new', 'chat'
  
  // New ticket state
  const [newTicketAsunto, setNewTicketAsunto] = useState("")
  const [newTicketCategoria, setNewTicketCategoria] = useState("Dudas Generales")

  const messagesEndRef = useRef(null)

  useEffect(() => {
    // Fetch user tickets on load
    fetchTickets()
    
    // Setup socket
    const token = localStorage.getItem("token")
    if (token) {
      const baseUrl = process.env.NEXT_PUBLIC_API_Back_Url || "http://localhost:3000"
      const newSocket = io(`${baseUrl}/soporte`, {
        auth: { token: `Bearer ${token}` }
      })
      
      newSocket.on("newMessage", (msg) => {
        setMessages((prev) => [...prev, msg])
        scrollToBottom()
      })
      
      setSocket(newSocket)
      return () => newSocket.close()
    }
  }, [])

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, 100)
  }

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return
      
      const baseUrl = process.env.NEXT_PUBLIC_API_Back_Url || "http://localhost:3000"
      const res = await fetch(`${baseUrl}/soporte/mis-tickets`, {
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

  const handleCreateTicket = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem("token")
      const baseUrl = process.env.NEXT_PUBLIC_API_Back_Url || "http://localhost:3000"
      const res = await fetch(`${baseUrl}/soporte/ticket`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ asunto: newTicketAsunto, categoria: newTicketCategoria })
      })
      
      if (res.ok) {
        const newTicket = await res.json()
        toast({ title: "Ticket Creado", description: "Tu ticket ha sido abierto correctamente." })
        setNewTicketAsunto("")
        fetchTickets()
        openTicketChat(newTicket)
      }
    } catch (e) {
      toast({ title: "Error", description: "No se pudo crear el ticket", variant: "destructive" })
    }
  }

  const openTicketChat = async (ticket) => {
    setActiveTicket(ticket)
    setView("chat")
    
    // Fetch existing messages
    try {
      const token = localStorage.getItem("token")
      const baseUrl = process.env.NEXT_PUBLIC_API_Back_Url || "http://localhost:3000"
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

    // Join socket room
    if (socket) {
      socket.emit("joinTicket", { ticketId: ticket.id })
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() && !selectedFile) return
    if (!socket || !activeTicket) return

    let imagenUrl = null

    if (selectedFile) {
      const formData = new FormData()
      formData.append("file", selectedFile)
      
      try {
        const token = localStorage.getItem("token")
        const baseUrl = process.env.NEXT_PUBLIC_API_Back_Url || "http://localhost:3000"
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
        toast({ title: "Error", description: "No se pudo subir la imagen", variant: "destructive" })
        return
      }
    }

    socket.emit("sendMessage", {
      ticketId: activeTicket.id,
      contenido: newMessage || "Archivo adjunto",
      imagenUrl,
      remitenteTipo: "usuario"
    })

    setNewMessage("")
    setSelectedFile(null)
  }

  const faqItems = [
    { question: "¿Cómo puedo registrarme en TrifoBet?", answer: "Para registrarte, haz clic en el botón 'Registrarse'..." },
    { question: "¿Qué métodos de pago aceptan?", answer: "Aceptamos tarjetas, transferencias, QR y criptomonedas." },
    { question: "¿Cuánto tiempo tardan los retiros?", answer: "Los retiros se procesan en 24-48 horas dependiendo del método." },
  ]

  const filteredFAQ = faqItems.filter(
    (item) => item.question.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getEstadoColor = (estado) => {
    switch (estado.toLowerCase()) {
      case 'abierto': return 'bg-green-500'
      case 'en_proceso': return 'bg-yellow-500'
      case 'cerrado': return 'bg-gray-500'
      default: return 'bg-blue-500'
    }
  }

  return (
    <div className="container py-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <HelpCircle className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Centro de Soporte</h1>
      </div>

      <Tabs defaultValue="faq" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="faq">Preguntas Frecuentes</TabsTrigger>
          <TabsTrigger value="tickets">Mis Tickets de Soporte</TabsTrigger>
        </TabsList>

        <TabsContent value="faq">
          <div className="space-y-6">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar en preguntas frecuentes..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Accordion type="single" collapsible className="w-full">
              {filteredFAQ.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">{item.question}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{item.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </TabsContent>

        <TabsContent value="tickets">
          {view === "list" && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Historial de Tickets</CardTitle>
                <Button onClick={() => setView("new")}><Plus className="w-4 h-4 mr-2" /> Nuevo Ticket</Button>
              </CardHeader>
              <CardContent>
                {tickets.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No tienes tickets abiertos. Si necesitas ayuda, crea uno nuevo.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {tickets.map(ticket => (
                      <div key={ticket.id} onClick={() => openTicketChat(ticket)} className="p-4 border border-border rounded-lg flex justify-between items-center cursor-pointer hover:bg-muted/50 transition-colors">
                        <div>
                          <h3 className="font-bold">{ticket.asunto}</h3>
                          <p className="text-sm text-muted-foreground">Categoría: {ticket.categoria} | Creado: {new Date(ticket.fecha_creacion).toLocaleDateString()}</p>
                        </div>
                        <Badge className={`${getEstadoColor(ticket.estado)} text-white`}>{ticket.estado.toUpperCase()}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {view === "new" && (
            <Card>
              <CardHeader className="flex flex-row items-center">
                <Button variant="ghost" size="icon" onClick={() => setView("list")} className="mr-2">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <CardTitle>Crear Nuevo Ticket</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateTicket} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Categoría</label>
                    <select
                      value={newTicketCategoria}
                      onChange={(e) => setNewTicketCategoria(e.target.value)}
                      className="w-full p-2 border border-border bg-background rounded-md"
                    >
                      <option>Dudas Generales</option>
                      <option>Apuestas Deportivas</option>
                      <option>Juegos de Casino</option>
                      <option>Depósitos y Retiros</option>
                      <option>Problemas Técnicos</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Asunto Principal</label>
                    <Input 
                      placeholder="Ej. Mi depósito no se refleja" 
                      value={newTicketAsunto}
                      onChange={(e) => setNewTicketAsunto(e.target.value)}
                      required 
                    />
                  </div>
                  <Button type="submit" className="w-full">Abrir Ticket</Button>
                </form>
              </CardContent>
            </Card>
          )}

          {view === "chat" && activeTicket && (
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="flex flex-row items-center border-b border-border py-3">
                <Button variant="ghost" size="icon" onClick={() => setView("list")} className="mr-2">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                  <CardTitle className="text-lg">{activeTicket.asunto}</CardTitle>
                  <p className="text-xs text-muted-foreground">Ticket #{activeTicket.id} | {activeTicket.estado}</p>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30">
                {messages.length === 0 ? (
                  <p className="text-center text-muted-foreground text-sm my-10">Un agente te responderá pronto. Puedes añadir más detalles o imágenes.</p>
                ) : (
                  messages.map(msg => {
                    const isMe = msg.remitente_tipo === "usuario"
                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-lg p-3 ${isMe ? 'bg-primary text-primary-foreground' : 'bg-background border border-border'}`}>
                          <p className="text-xs font-bold mb-1 opacity-70">{isMe ? 'Tú' : 'Soporte'}</p>
                          {msg.imagen_url && (
                            <img src={msg.imagen_url} alt="adjunto" className="max-w-full rounded mb-2 max-h-48 object-contain" />
                          )}
                          <p className="text-sm">{msg.contenido}</p>
                          <span className="text-[10px] opacity-50 block text-right mt-1">
                            {new Date(msg.fecha_creacion).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </CardContent>

              {activeTicket.estado !== 'cerrado' && (
                <div className="p-3 border-t border-border bg-background">
                  <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
                    {selectedFile && (
                      <Badge variant="secondary" className="truncate max-w-[100px]">
                        {selectedFile.name}
                      </Badge>
                    )}
                    <label className="p-2 hover:bg-muted rounded-full cursor-pointer transition-colors text-muted-foreground">
                      <ImageIcon size={20} />
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => setSelectedFile(e.target.files[0])} />
                    </label>
                    <Input 
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Escribe tu mensaje..."
                      className="flex-1"
                    />
                    <Button type="submit" size="icon">
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                </div>
              )}
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}