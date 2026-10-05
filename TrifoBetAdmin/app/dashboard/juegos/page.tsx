'use client'

import { Plus } from 'lucide-react'
import GameModal from '@/components/dashboard/modals/GameModal'
import { useJuegosAdmin } from '@/hooks/useJuegosAdmin'

// Dumb Components
import { JuegosKPIs } from '@/components/dashboard/juegos/JuegosKPIs'
import { MetricasTable } from '@/components/dashboard/juegos/MetricasTable'
import { GestionCatTable } from '@/components/dashboard/juegos/GestionCatTable'

export default function JuegosPage() {
  const {
    loading,
    searchTerm,
    setSearchTerm,
    filterType,
    setFilterType,
    filterStatus,
    setFilterStatus,
    filterStats,
    setFilterStats,
    activeTab,
    setActiveTab,
    isModalOpen,
    setIsModalOpen,
    selectedGame,
    handleAddGame,
    handleEditGame,
    handleSaveGame,
    handleDeleteGame,
    toggleGameStatus,
    handleSort,
    sortedGames,
    filteredGames,
    globalMontoApostado,
    globalMontoRetorno,
    globalGananciaNeta,
    globalPartidasJugadas
  } = useJuegosAdmin()

  if (loading) {
    return <div className="p-8 text-center">Cargando juegos...</div>
  }

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

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab('metricas')}
          className={`px-6 py-3 font-medium text-sm transition-colors relative ${
            activeTab === 'metricas' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Métricas y Análisis
          {activeTab === 'metricas' && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('gestion')}
          className={`px-6 py-3 font-medium text-sm transition-colors relative ${
            activeTab === 'gestion' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Gestión de Catálogo
          {activeTab === 'gestion' && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />
          )}
        </button>
      </div>

      {activeTab === 'metricas' ? (
        <div className="space-y-6">
          <JuegosKPIs 
            globalMontoApostado={globalMontoApostado}
            globalMontoRetorno={globalMontoRetorno}
            globalGananciaNeta={globalGananciaNeta}
            globalPartidasJugadas={globalPartidasJugadas}
          />
          <MetricasTable 
            sortedGames={sortedGames}
            handleSort={handleSort}
          />
        </div>
      ) : (
        <GestionCatTable 
          filteredGames={filteredGames}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterType={filterType}
          setFilterType={setFilterType}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          filterStats={filterStats}
          setFilterStats={setFilterStats}
          toggleGameStatus={toggleGameStatus}
          handleEditGame={handleEditGame}
          handleDeleteGame={handleDeleteGame}
        />
      )}

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
