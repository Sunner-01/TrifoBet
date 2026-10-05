import React from 'react';
import { Edit2, Trash2, ToggleRight, ToggleLeft, Search } from 'lucide-react';
import { JuegoCasino } from '@/lib/api';
import { typeStyles, typeLabels } from '@/lib/juegos-utils';

interface GestionCatTableProps {
  filteredGames: JuegoCasino[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterType: string;
  setFilterType: (type: string) => void;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  filterStats: string;
  setFilterStats: (stats: string) => void;
  toggleGameStatus: (game: JuegoCasino) => void;
  handleEditGame: (game: JuegoCasino) => void;
  handleDeleteGame: (id: number) => void;
}

export function GestionCatTable({
  filteredGames,
  searchTerm,
  setSearchTerm,
  filterType,
  setFilterType,
  filterStatus,
  setFilterStatus,
  filterStats,
  setFilterStats,
  toggleGameStatus,
  handleEditGame,
  handleDeleteGame
}: GestionCatTableProps) {
  return (
    <div className="space-y-6">
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
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-border bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="todos">Todos los tipos</option>
            <option value="slots">Slots</option>
            <option value="mesa">Juegos de Mesa</option>
            <option value="instantaneo">Instantáneos</option>
            <option value="blackjack">Blackjack</option>
            <option value="plinko">Plinko</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-border bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="todos">Cualquier estado</option>
            <option value="activos">Solo activos</option>
            <option value="inactivos">Solo inactivos</option>
          </select>
          <select
            value={filterStats}
            onChange={(e) => setFilterStats(e.target.value)}
            className="px-4 py-2 border border-border bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="todos">Ordenar por defecto</option>
            <option value="mas_jugados">Más jugados</option>
            <option value="menos_jugados">Menos jugados</option>
            <option value="mas_ganancias">Más ganancias (GGR)</option>
            <option value="menos_ganancias">Menos ganancias (GGR)</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Nombre</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Categoría</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Proveedor</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">RTP</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">Jugadores</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">Ingreso Hoy</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">Estado</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredGames.map((game) => (
                <tr key={game.id} className="border-b border-border hover:bg-muted/50">
                  <td className="px-6 py-4 text-sm text-foreground font-medium">{game.nombre}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${typeStyles[game.categoria] || typeStyles.slots}`}>
                      {typeLabels[game.categoria] || game.categoria}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{game.proveedor}</td>
                  <td className="px-6 py-4 text-sm text-center text-foreground font-medium">{game.rtp}%</td>
                  <td className="px-6 py-4 text-sm text-center text-foreground">{game.jugadoresActivos || 0}</td>
                  <td className="px-6 py-4 text-sm text-right text-foreground font-semibold">Bs {(game.ingresoHoy || 0).toFixed(2)}</td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => toggleGameStatus(game)}
                      className="inline-flex items-center"
                      title={game.habilitado ? 'Desactivar' : 'Activar'}
                    >
                      {game.habilitado ? (
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
    </div>
  );
}
