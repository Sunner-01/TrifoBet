'use client'

import { useState } from 'react'
import { X, UserPlus, Mail, User, Info } from 'lucide-react'
import { createPersonal, updatePersonal } from '@/lib/api'

export default function PersonalModal({ 
  onClose, 
  onSuccess,
  initialData
}: { 
  onClose: () => void, 
  onSuccess: () => void,
  initialData?: any
}) {
  const isEditing = !!initialData
  const [formData, setFormData] = useState({
    nombre: initialData?.nombre || '',
    correo: initialData?.correo || '',
    nombre_usuario: initialData?.nombre_usuario || '',
    rol_id: initialData?.rol_id || 3, // Por defecto Soporte
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      if (isEditing) {
        await updatePersonal(initialData.id, formData)
        alert('Perfil actualizado exitosamente.')
      } else {
        await createPersonal(formData)
        alert(`Trabajador creado exitosamente.\n\nRecuerda enviar por WhatsApp:\nUsuario: ${formData.nombre_usuario}\nContraseña Temporal: Pass123.\n\nIndícale que debe cambiar su contraseña al iniciar sesión.`)
      }
      onSuccess()
    } catch (err: any) {
      setError(err.message || (isEditing ? 'Error al actualizar perfil' : 'Error al crear trabajador'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-border bg-muted/20">
          <h2 className="font-bold text-xl flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-xl">
              <UserPlus size={22} className="text-emerald-500" />
            </div>
            {isEditing ? 'Editar Perfil del Trabajador' : 'Nuevo Trabajador'}
          </h2>
          <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {!isEditing && (
            <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs p-3 rounded-xl flex items-start gap-2 mb-2">
              <Info size={16} className="shrink-0 mt-0.5" />
              <p>Se creará la cuenta con la contraseña temporal <strong>Pass123.</strong> Debes comunicarle estos datos al trabajador por WhatsApp.</p>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <User size={14}/> Nombre Completo
            </label>
            <input
              type="text"
              required
              value={formData.nombre}
              onChange={e => setFormData({ ...formData, nombre: e.target.value })}
              className="w-full bg-background/50 border border-border/50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
              placeholder="Ej. Juan Pérez"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Mail size={14}/> Correo Electrónico
            </label>
            <input
              type="email"
              required
              value={formData.correo}
              onChange={e => setFormData({ ...formData, correo: e.target.value })}
              className="w-full bg-background/50 border border-border/50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
              placeholder="juan@trifobet.com"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <User size={14}/> Nombre de Usuario
            </label>
            <input
              type="text"
              required
              value={formData.nombre_usuario}
              onChange={e => setFormData({ ...formData, nombre_usuario: e.target.value })}
              className="w-full bg-background/50 border border-border/50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
              placeholder="juanperez"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">Rol Administrativo</label>
            <select
              value={formData.rol_id}
              onChange={e => setFormData({ ...formData, rol_id: Number(e.target.value) })}
              className="w-full bg-background/50 border border-border/50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
            >
              <option value={1}>Administrador (Acceso Total)</option>
              <option value={3}>Soporte (Usuarios, Mensajes)</option>
              <option value={5}>Verificador (KYC, Identidad)</option>
              <option value={6}>Cajero / Finanzas (Recargas, Retiros)</option>
            </select>
          </div>

          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}

          <div className="pt-4 flex justify-end gap-3 border-t border-border mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 text-sm font-bold bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] disabled:opacity-50"
            >
              {loading ? 'Guardando...' : (isEditing ? 'Guardar Cambios' : 'Crear Trabajador')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
