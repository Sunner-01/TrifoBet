'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Plus, CreditCard, Trash2, CheckCircle2, Clock, XCircle, UploadCloud, Check } from "lucide-react"
import { API_Back_Url as API_URL } from "@/lib/config"

export function ProfileRetirosTab({ userId }) {
  const [cuentas, setCuentas] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    billetera: 'Yape',
    numero_cuenta: '',
    nombre_titular: '',
  })
  const [file, setFile] = useState(null)

  const fetchCuentas = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_URL}/retiros/cuenta/mis-cuentas`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setCuentas(data)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCuentas()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.numero_cuenta || !formData.nombre_titular) {
      toast({ title: 'Error', description: 'Llena todos los campos obligatorios', variant: 'destructive' })
      return
    }

    setSubmitting(true)
    const data = new FormData()
    data.append('billetera', formData.billetera)
    data.append('numero_cuenta', formData.numero_cuenta)
    data.append('nombre_titular', formData.nombre_titular)
    if (file) {
      data.append('qr_image', file)
    }

    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_URL}/retiros/cuenta`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: data
      })
      
      if (res.ok) {
        toast({ title: 'Éxito', description: 'Cuenta agregada y en revisión' })
        setShowForm(false)
        setFormData({ billetera: 'Yape', numero_cuenta: '', nombre_titular: '' })
        setFile(null)
        fetchCuentas()
      } else {
        const err = await res.json()
        toast({ title: 'Error', description: err.message, variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Error de conexión', variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusBadge = (estado) => {
    switch (estado) {
      case 'aprobada': return <Badge className="bg-green-500/10 text-green-500 flex items-center gap-1"><CheckCircle2 size={12}/> Aprobada</Badge>
      case 'pendiente': return <Badge className="bg-yellow-500/10 text-yellow-500 flex items-center gap-1"><Clock size={12}/> Pendiente</Badge>
      case 'rechazada': return <Badge className="bg-red-500/10 text-red-500 flex items-center gap-1"><XCircle size={12}/> Rechazada</Badge>
      default: return <Badge>{estado}</Badge>
    }
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Mis Cuentas de Retiro</h3>
          <p className="text-sm text-muted-foreground">Agrega billeteras para retirar tus ganancias.</p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} size="sm">
            <Plus className="w-4 h-4 mr-2" /> Agregar Cuenta
          </Button>
        )}
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Nueva Cuenta de Retiro</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Billetera</Label>
                  <Select value={formData.billetera} onValueChange={(v) => setFormData({...formData, billetera: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Yape">Yape</SelectItem>
                      <SelectItem value="Yolo Pago">Yolo Pago</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Número de Celular / Cuenta</Label>
                  <Input 
                    placeholder="Ej. 78912345" 
                    value={formData.numero_cuenta}
                    onChange={e => setFormData({...formData, numero_cuenta: e.target.value})}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Nombre del Titular (Debe coincidir con tu perfil)</Label>
                  <Input 
                    placeholder="Nombre completo" 
                    value={formData.nombre_titular}
                    onChange={e => setFormData({...formData, nombre_titular: e.target.value})}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Código QR (Opcional pero recomendado)</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-4 text-center relative cursor-pointer hover:bg-muted/50 transition">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={e => setFile(e.target.files?.[0])}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {file ? (
                      <div className="flex items-center justify-center gap-2 text-primary">
                        <Check size={18} /> <span className="text-sm font-medium">{file.name}</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <UploadCloud size={24} className="mb-2" />
                        <span className="text-sm">Toca para subir tu QR</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
                <Button type="submit" disabled={submitting}>
                  {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Guardar Cuenta
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : cuentas.length === 0 && !showForm ? (
        <div className="text-center p-8 border border-dashed rounded-lg">
          <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-muted-foreground">No tienes cuentas de retiro registradas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cuentas.map(cuenta => (
            <Card key={cuenta.id} className="relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-bold text-lg uppercase tracking-wide text-blue-400">{cuenta.billetera}</h4>
                    <p className="text-2xl font-mono mt-1">{cuenta.numero_cuenta}</p>
                  </div>
                  {getStatusBadge(cuenta.estado)}
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Titular: <span className="text-foreground font-medium">{cuenta.nombre_titular}</span></p>
                  {cuenta.qr_url ? (
                    <p className="text-xs text-green-500">QR Incluido ✓</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">Sin código QR</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
