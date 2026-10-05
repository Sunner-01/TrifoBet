'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

interface Bet {
  id?: string
  evento: string
  deporte: string
  mercado: string
  cuota: number
  estado: 'activo' | 'cerrado' | 'cancelado'
  fechaInicio: string
}

interface BetModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (bet: Partial<Bet>) => void
  bet?: Bet
}

const deportes = ['Fútbol', 'Baloncesto', 'Tenis', 'Beisbol', 'Hockey', 'Boxeo', 'MMA']
const mercados = ['Ganador del partido', 'Puntos totales Over/Under', 'Apuesta de lado', 'Handicap']

export default function BetModal({ isOpen, onClose, onSave, bet }: BetModalProps) {
  const [formData, setFormData] = useState<Partial<Bet>>({
    evento: '',
    deporte: 'Fútbol',
    mercado: 'Ganador del partido',
    cuota: 1.5,
    estado: 'activo',
    fechaInicio: new Date().toISOString(),
  })

  useEffect(() => {
    if (bet) {
      setFormData(bet)
    } else {
      setFormData({
        evento: '',
        deporte: 'Fútbol',
        mercado: 'Ganador del partido',
        cuota: 1.5,
        estado: 'activo',
        fechaInicio: new Date().toISOString(),
      })
    }
  }, [bet, isOpen])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'cuota' ? parseFloat(value) || 1.5 : value,
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
            {bet ? 'Editar Evento' : 'Nuevo Evento de Apuestas'}
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
              Evento
            </label>
            <input
              type="text"
              name="evento"
              value={formData.evento || ''}
              onChange={handleChange}
              placeholder="Real Madrid vs Barcelona"
              required
              className="w-full px-4 py-2 border border-border bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Deporte</label>
            <select
              name="deporte"
              value={formData.deporte || 'Fútbol'}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-border bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {deportes.map((deporte) => (
                <option key={deporte} value={deporte}>
                  {deporte}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Mercado</label>
            <select
              name="mercado"
              value={formData.mercado || 'Ganador del partido'}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-border bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {mercados.map((mercado) => (
                <option key={mercado} value={mercado}>
                  {mercado}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Cuota</label>
            <input
              type="number"
              name="cuota"
              value={formData.cuota || 1.5}
              onChange={handleChange}
              placeholder="2.5"
              step="0.01"
              min="1"
              max="100"
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
              <option value="cerrado">Cerrado</option>
              <option value="cancelado">Cancelado</option>
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
              {bet ? 'Actualizar' : 'Crear'} Evento
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
