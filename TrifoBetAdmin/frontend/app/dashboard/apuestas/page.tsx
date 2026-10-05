'use client'

import { useState } from 'react'
import { Search, Plus, Edit2, Trash2, Calendar } from 'lucide-react'
import BetModal from '@/components/dashboard/modals/BetModal'

interface Bet {
  id: string
  evento: string
  deporte: string
  mercado: string
  cuota: number
  estado: 'activo' | 'cerrado' | 'cancelado'
  volumenapuestas: number
  ingresoEstimado: number
  fechaInicio: string
}

const mockBets: Bet[] = [
  {
    id: '1',
    evento: 'Real Madrid vs Barcelona',
    deporte: 'Fútbol',
    mercado: 'Ganador del partido',
    cuota: 2.5,
    estado: 'activo',
    volumenapuestas: 45000,
    ingresoEstimado: 3200,
    fechaInicio: '2024-06-15 20:00',
  },
  {
    id: '2',
    evento: 'Denver Nuggets vs Golden State Warriors',
    deporte: 'Baloncesto',
    mercado: 'Puntos totales Over/Under',
    cuota: 1.9,
    estado: 'activo',
    volumenapuestas: 32000,
    ingresoEstimado: 2100,
    fechaInicio: '2024-06-14 22:30',
  },
  {
    id: '3',
    evento: 'Nadal vs Djokovic',
    deporte: 'Tenis',
    mercado: 'Ganador del torneo',
    cuota: 3.2,
    estado: 'cerrado',
    volumenapuestas: 18000,
    ingresoEstimado: 1200,
    fechaInicio: '2024-06-10 14:00',
  },
  {
    id: '4',
    evento: 'Liverpool vs Man City',
    deporte: 'Fútbol',
    mercado: 'Empate',
    cuota: 2.1,
    estado: 'activo',
    volumenapuestas: 28000,
    ingresoEstimado: 1800,
    fechaInicio: '2024-06-16 19:00',
  },
]

const deportes = ['Todos', 'Fútbol', 'Baloncesto', 'Tenis', 'Beisbol', 'Hockey', 'Boxeo']

const statusStyles = {
  activo: 'bg-primary/10 text-primary',
  cerrado: 'bg-muted/10 text-muted-foreground',
  cancelado: 'bg-destructive/10 text-destructive',
}

export default function ApuestasPage() {
  const [bets, setBets] = useState<Bet[]>(mockBets)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterDeporte, setFilterDeporte] = useState('Todos')
  const [filterStatus, setFilterStatus] = useState<'todos' | Bet['estado']>('todos')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedBet, setSelectedBet] = useState<Bet | null>(null)

  const filteredBets = bets.filter((bet) => {
    const matchesSearch =
      bet.evento.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bet.mercado.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesDeporte = filterDeporte === 'Todos' || bet.deporte === filterDeporte
    const matchesStatus = filterStatus === 'todos' || bet.estado === filterStatus

    return matchesSearch && matchesDeporte && matchesStatus
  })

  const handleAddBet = () => {
    setSelectedBet(null)
    setIsModalOpen(true)
  }

  const handleEditBet = (bet: Bet) => {
    setSelectedBet(bet)
    setIsModalOpen(true)
  }

  const handleSaveBet = (betData: Partial<Bet>) => {
    if (selectedBet) {
      setBets(bets.map((b) => (b.id === selectedBet.id ? { ...b, ...betData } : b)))
    } else {
      setBets([
        ...bets,
        {
          id: Date.now().toString(),
          ...betData,
          volumenapuestas: 0,
          ingresoEstimado: 0,
          fechaInicio: new Date().toISOString(),
        } as Bet,
      ])
    }
    setIsModalOpen(false)
  }

  const handleDeleteBet = (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este evento de apuestas?')) {
      setBets(bets.filter((b) => b.id !== id))
    }
  }

  const totalVolumen = filteredBets.reduce((sum, b) => sum + b.volumenapuestas, 0)
  const totalIngresos = filteredBets.reduce((sum, b) => sum + b.ingresoEstimado, 0)
  const eventosActivos = filteredBets.filter((b) => b.estado === 'activo').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Apuestas Deportivas</h1>
          <p className="text-muted-foreground">Administra eventos y mercados de apuestas</p>
        </div>
        <button
          onClick={handleAddBet}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors"
        >
          <Plus size={20} />
          Nuevo Evento
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm font-medium text-muted-foreground mb-2">Eventos Activos</p>
          <p className="text-2xl font-bold text-primary">{eventosActivos}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm font-medium text-muted-foreground mb-2">Volumen de Apuestas</p>
          <p className="text-2xl font-bold text-primary">Bs {totalVolumen.toFixed(2)}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm font-medium text-muted-foreground mb-2">Ingresos Estimados</p>
          <p className="text-2xl font-bold text-primary">Bs {totalIngresos.toFixed(2)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-lg p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-muted-foreground" size={18} />
            <input
              type="text"
              placeholder="Buscar evento o mercado..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <select
            value={filterDeporte}
            onChange={(e) => setFilterDeporte(e.target.value)}
            className="flex-1 px-4 py-2 border border-border bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {deportes.map((deporte) => (
              <option key={deporte} value={deporte}>
                {deporte}
              </option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="flex-1 px-4 py-2 border border-border bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="todos">Todos los estados</option>
            <option value="activo">Activos</option>
            <option value="cerrado">Cerrados</option>
            <option value="cancelado">Cancelados</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Evento
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Deporte</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Mercado</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">Cuota</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">
                  Volumen
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">
                  Ingreso
                </th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">
                  Estado
                </th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredBets.map((bet) => (
                <tr key={bet.id} className="border-b border-border hover:bg-muted/50">
                  <td className="px-6 py-4 text-sm text-foreground font-medium">{bet.evento}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{bet.deporte}</td>
                  <td className="px-6 py-4 text-sm text-foreground">{bet.mercado}</td>
                  <td className="px-6 py-4 text-sm text-center text-foreground font-medium">
                    {bet.cuota.toFixed(2)}x
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-foreground font-semibold">
                    Bs {bet.volumenapuestas.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-foreground font-semibold">
                    Bs {bet.ingresoEstimado.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium ${
                        statusStyles[bet.estado]
                      }`}
                    >
                      {bet.estado === 'activo' && 'Activo'}
                      {bet.estado === 'cerrado' && 'Cerrado'}
                      {bet.estado === 'cancelado' && 'Cancelado'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEditBet(bet)}
                        className="p-2 hover:bg-muted rounded-lg transition-colors text-foreground"
                        title="Editar"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteBet(bet.id)}
                        className="p-2 hover:bg-destructive/10 rounded-lg transition-colors text-destructive"
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredBets.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            No se encontraron eventos que coincidan con tu búsqueda
          </div>
        )}
      </div>

      {/* Bet Modal */}
      <BetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveBet}
        bet={selectedBet || undefined}
      />
    </div>
  )
}
