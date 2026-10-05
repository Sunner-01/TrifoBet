'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { JuegoCasino } from '@/lib/api'

interface GameModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (game: Partial<JuegoCasino>) => void
  game?: JuegoCasino
}

export default function GameModal({ isOpen, onClose, onSave, game }: GameModalProps) {
  const [formData, setFormData] = useState<Partial<JuegoCasino>>({
    nombre: '',
    categoria: 'slots',
    proveedor: '',
    rtp: 95,
    habilitado: true,
    url_juego: '',
    imagen_url: ''
  })

  useEffect(() => {
    if (game) {
      setFormData(game)
    } else {
      setFormData({
        nombre: '',
        categoria: 'slots',
        proveedor: '',
        rtp: 95,
        habilitado: true,
        url_juego: '',
        imagen_url: ''
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto pt-10 pb-10">
      <div className="bg-card border border-border rounded-lg max-w-md w-full mx-4 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">
            {game ? 'Editar Juego' : 'Nuevo Juego'}
          </h2>
          <button
            type="button"
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
            <label className="block text-sm font-medium text-foreground mb-2">Categoría</label>
            <select
              name="categoria"
              value={formData.categoria || 'slots'}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-border bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="slots">Slots</option>
              <option value="mesa">Juegos de Mesa</option>
              <option value="instantaneo">Instantáneos</option>
              <option value="blackjack">Blackjack</option>
              <option value="plinko">Plinko</option>
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
              max="100"
              required
              className="w-full px-4 py-2 border border-border bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              URL del Juego (Iframe)
            </label>
            <input
              type="text"
              name="url_juego"
              value={formData.url_juego || ''}
              onChange={handleChange}
              placeholder="https://..."
              className="w-full px-4 py-2 border border-border bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Estado</label>
            <select
              name="habilitado"
              value={formData.habilitado ? 'true' : 'false'}
              onChange={(e) => setFormData({...formData, habilitado: e.target.value === 'true'})}
              className="w-full px-4 py-2 border border-border bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="true">Activo</option>
              <option value="false">Inactivo</option>
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

