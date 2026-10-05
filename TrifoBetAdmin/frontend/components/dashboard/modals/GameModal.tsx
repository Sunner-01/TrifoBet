'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

interface Game {
  id?: string
  nombre: string
  tipo: 'slots' | 'mesa' | 'instantaneo'
  proveedor: string
  rtp: number
  estado: 'activo' | 'inactivo'
}

interface GameModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (game: Partial<Game>) => void
  game?: Game
}

export default function GameModal({ isOpen, onClose, onSave, game }: GameModalProps) {
  const [formData, setFormData] = useState<Partial<Game>>({
    nombre: '',
    tipo: 'slots',
    proveedor: '',
    rtp: 95,
    estado: 'activo',
  })

  useEffect(() => {
    if (game) {
      setFormData(game)
    } else {
      setFormData({
        nombre: '',
        tipo: 'slots',
        proveedor: '',
        rtp: 95,
        estado: 'activo',
      })
    }
  }, [game, isOpen])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'rtp' ? parseFloat(value) || 0 : value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">
            {game ? 'Editar Juego' : 'Nuevo Juego'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded-lg transition-colors"
          >
            <X size={20} className="text-foreground" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Nombre del Juego
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre || ''}
              onChange={handleChange}
              placeholder="Golden Fortune Slots"
              required
              className="w-full px-4 py-2 border border-border bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Tipo</label>
            <select
              name="tipo"
              value={formData.tipo || 'slots'}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-border bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="slots">Slots</option>
              <option value="mesa">Juegos de Mesa</option>
              <option value="instantaneo">Instantáneos</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Proveedor
            </label>
            <input
              type="text"
              name="proveedor"
              value={formData.proveedor || ''}
              onChange={handleChange}
              placeholder="Microgaming"
              required
              className="w-full px-4 py-2 border border-border bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">RTP (%)</label>
            <input
              type="number"
              name="rtp"
              value={formData.rtp || 95}
              onChange={handleChange}
              placeholder="95.5"
              step="0.1"
              min="80"
              max="99"
              required
              className="w-full px-4 py-2 border border-border bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Estado</label>
            <select
              name="estado"
              value={formData.estado || 'activo'}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-border bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-border text-foreground hover:bg-muted rounded-lg font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors"
            >
              {game ? 'Actualizar' : 'Crear'} Juego
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
