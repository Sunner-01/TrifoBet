'use client'

import { useState } from 'react'
import { Search, Plus, Edit2, Trash2, ToggleRight, ToggleLeft } from 'lucide-react'
import GameModal from '@/components/dashboard/modals/GameModal'

interface Game {
  id: string
  nombre: string
  tipo: 'slots' | 'mesa' | 'instantaneo'
  proveedor: string
  rtp: number
  estado: 'activo' | 'inactivo'
  jugadoresActivos: number
  ingresoHoy: number
}

const mockGames: Game[] = [
  {
    id: '1',
    nombre: 'Golden Fortune Slots',
    tipo: 'slots',
    proveedor: 'Microgaming',
    rtp: 96.5,
    estado: 'activo',
    jugadoresActivos: 45,
    ingresoHoy: 3200,
  },
  {
    id: '2',
    nombre: 'Ruleta Europea',
    tipo: 'mesa',
    proveedor: 'Evolution Gaming',
    rtp: 97.3,
    estado: 'activo',
    jugadoresActivos: 23,
    ingresoHoy: 5600,
  },
  {
    id: '3',
    nombre: 'Blackjack Classic',
    tipo: 'mesa',
    proveedor: 'Playtech',
    rtp: 99.5,
    estado: 'activo',
    jugadoresActivos: 18,
    ingresoHoy: 2100,
  },
  {
    id: '4',
    nombre: 'Lucky Numbers',
    tipo: 'instantaneo',
    proveedor: 'Pragmatic Play',
    rtp: 95.0,
    estado: 'inactivo',
    jugadoresActivos: 0,
    ingresoHoy: 0,
  },
]

const typeStyles = {
  slots: 'bg-blue-500/10 text-blue-400',
  mesa: 'bg-purple-500/10 text-purple-400',
  instantaneo: 'bg-pink-500/10 text-pink-400',
}

const typeLabels = {
  slots: 'Slots',
  mesa: 'Mesa',
  instantaneo: 'Instantáneo',
}

export default function JuegosPage() {
  const [games, setGames] = useState<Game[]>(mockGames)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'todos' | Game['tipo']>('todos')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)

  const filteredGames = games.filter((game) => {
    const matchesSearch =
      game.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      game.proveedor.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = filterType === 'todos' || game.tipo === filterType

    return matchesSearch && matchesType
  })

  const handleAddGame = () => {
    setSelectedGame(null)
    setIsModalOpen(true)
  }

  const handleEditGame = (game: Game) => {
    setSelectedGame(game)
    setIsModalOpen(true)
  }

  const handleSaveGame = (gameData: Partial<Game>) => {
    if (selectedGame) {
      setGames(games.map((g) => (g.id === selectedGame.id ? { ...g, ...gameData } : g)))
    } else {
      setGames([
        ...games,
        {
          id: Date.now().toString(),
          ...gameData,
          jugadoresActivos: 0,
          ingresoHoy: 0,
        } as Game,
      ])
    }
    setIsModalOpen(false)
  }

  const handleDeleteGame = (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este juego?')) {
      setGames(games.filter((g) => g.id !== id))
    }
  }

  const toggleGameStatus = (id: string) => {
    setGames(
      games.map((g) =>
        g.id === id ? { ...g, estado: g.estado === 'activo' ? 'inactivo' : 'activo' } : g
      )
    )
  }

  const totalIngresos = games
    .filter((g) => g.estado === 'activo')
    .reduce((sum, g) => sum + g.ingresoHoy, 0)
  const totalJugadores = games
    .filter((g) => g.estado === 'activo')
    .reduce((sum, g) => sum + g.jugadoresActivos, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestión de Juegos</h1>
          <p className="text-muted-foreground">
            Administra todos los juegos disponibles en la plataforma
          </p>
        </div>
        <button
          onClick={handleAddGame}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors"
        >
          <Plus size={20} />
          Nuevo Juego
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm font-medium text-muted-foreground mb-2">Juegos Activos</p>
          <p className="text-2xl font-bold text-primary">
            {games.filter((g) => g.estado === 'activo').length}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm font-medium text-muted-foreground mb-2">Jugadores Activos</p>
          <p className="text-2xl font-bold text-primary">{totalJugadores}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm font-medium text-muted-foreground mb-2">Ingresos Hoy</p>
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
              placeholder="Buscar por nombre o proveedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="px-4 py-2 border border-border bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="todos">Todos los tipos</option>
            <option value="slots">Slots</option>
            <option value="mesa">Juegos de Mesa</option>
            <option value="instantaneo">Instantáneos</option>
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
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Tipo</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Proveedor
                </th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">RTP</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">
                  Jugadores
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">
                  Ingreso Hoy
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
              {filteredGames.map((game) => (
                <tr key={game.id} className="border-b border-border hover:bg-muted/50">
                  <td className="px-6 py-4 text-sm text-foreground font-medium">{game.nombre}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${typeStyles[game.tipo]}`}>
                      {typeLabels[game.tipo]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{game.proveedor}</td>
                  <td className="px-6 py-4 text-sm text-center text-foreground font-medium">
                    {game.rtp}%
                  </td>
                  <td className="px-6 py-4 text-sm text-center text-foreground">
                    {game.jugadoresActivos}
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-foreground font-semibold">
                    Bs {game.ingresoHoy.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => toggleGameStatus(game.id)}
                      className="inline-flex items-center"
                      title={game.estado === 'activo' ? 'Desactivar' : 'Activar'}
                    >
                      {game.estado === 'activo' ? (
                        <ToggleRight className="text-primary" size={20} />
                      ) : (
                        <ToggleLeft className="text-muted-foreground" size={20} />
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEditGame(game)}
                        className="p-2 hover:bg-muted rounded-lg transition-colors text-foreground"
                        title="Editar"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteGame(game.id)}
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

        {filteredGames.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            No se encontraron juegos que coincidan con tu búsqueda
          </div>
        )}
      </div>

      {/* Game Modal */}
      <GameModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveGame}
        game={selectedGame || undefined}
      />
    </div>
  )
}
