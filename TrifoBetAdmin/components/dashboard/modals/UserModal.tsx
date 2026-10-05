'use client'

import { useState, useEffect } from 'react'
import { X, Loader2, Save } from 'lucide-react'
import { updateUsuario, UsuarioAdmin } from '@/lib/api'

interface UserModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  user?: UsuarioAdmin
}

const ROLES = [
  { id: 1, label: 'Administrador' },
  { id: 2, label: 'Jugador' },
  { id: 3, label: 'Soporte' },
  { id: 4, label: 'Afiliado' },
]

const PAISES = [
  { codigo: 'BO', nombre: 'Bolivia' },
  { codigo: 'AR', nombre: 'Argentina' },
  { codigo: 'PE', nombre: 'Perú' },
  { codigo: 'CL', nombre: 'Chile' },
  { codigo: 'BR', nombre: 'Brasil' },
  { codigo: 'CO', nombre: 'Colombia' },
  { codigo: 'EC', nombre: 'Ecuador' },
  { codigo: 'PY', nombre: 'Paraguay' },
  { codigo: 'UY', nombre: 'Uruguay' },
  { codigo: 'MX', nombre: 'México' },
  { codigo: 'ES', nombre: 'España' },
  { codigo: 'US', nombre: 'Estados Unidos' },
]

export default function UserModal({ isOpen, onClose, onSave, user }: UserModalProps) {
  const [formData, setFormData] = useState<Partial<UsuarioAdmin>>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      setFormData({
        nombre: user.nombre || '',
        apellido1: user.apellido1 || '',
        apellido2: user.apellido2 || '',
        correo: user.correo || '',
        telefono: user.telefono || '',
        pais_codigo: user.pais_codigo || 'BO',
        saldo: user.saldo ?? 0,
        verificado: user.verificado ?? false,
        habilitado: user.habilitado ?? true,
        rol_id: user.rol_id ?? 2,
      })
    }
    setError(null)
  }, [user, isOpen])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? checked
          : name === 'saldo'
            ? parseFloat(value) || 0
            : name === 'rol_id'
              ? parseInt(value)
              : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    setError(null)
    try {
      await updateUsuario(user.id, formData)
      onSave()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-lg font-bold text-foreground">Editar Usuario</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              @{user?.nombre_usuario} · ID {user?.id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-muted rounded-lg transition-colors"
          >
            <X size={18} className="text-foreground" />
          </button>
        </div>

        {/* Foto */}
        {user?.foto_perfil_url && (
          <div className="flex justify-center pt-5 pb-2">
            <img
              src={user.foto_perfil_url}
              alt={user.nombre_usuario}
              className="w-20 h-20 rounded-full object-cover border-2 border-primary"
            />
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Nombre y Apellidos */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Nombre</label>
              <input type="text" name="nombre" value={formData.nombre || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border bg-background rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Apellido 1</label>
              <input type="text" name="apellido1" value={formData.apellido1 || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border bg-background rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Apellido 2</label>
              <input type="text" name="apellido2" value={formData.apellido2 || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border bg-background rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Correo */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Correo electrónico</label>
            <input type="email" name="correo" value={formData.correo || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-border bg-background rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Teléfono y País */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Teléfono</label>
              <input type="tel" name="telefono" value={formData.telefono || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border bg-background rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">País</label>
              <select name="pais_codigo" value={formData.pais_codigo || 'BO'}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border bg-background rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {PAISES.map((p) => (
                  <option key={p.codigo} value={p.codigo}>{p.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Saldo y Rol */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Saldo (Bs.)
              </label>
              <input type="number" name="saldo" value={formData.saldo ?? 0}
                onChange={handleChange} step="0.01" min="0"
                className="w-full px-3 py-2 border border-border bg-background rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Rol</label>
              <select name="rol_id" value={formData.rol_id ?? 2}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border bg-background rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {ROLES.map((r) => (
                  <option key={r.id} value={r.id}>{r.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Toggles */}
          <div className="flex gap-6 pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="verificado"
                checked={formData.verificado ?? false}
                onChange={handleChange}
                className="w-4 h-4 rounded accent-primary"
              />
              <span className="text-sm text-foreground">Cuenta verificada</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="habilitado"
                checked={formData.habilitado ?? true}
                onChange={handleChange}
                className="w-4 h-4 rounded accent-primary"
              />
              <span className="text-sm text-foreground">Cuenta habilitada</span>
            </label>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2 border border-border text-foreground hover:bg-muted rounded-lg font-medium transition-colors text-sm"
            >
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors text-sm disabled:opacity-50"
            >
              {saving ? (
                <><Loader2 size={15} className="animate-spin" /> Guardando...</>
              ) : (
                <><Save size={15} /> Guardar Cambios</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
