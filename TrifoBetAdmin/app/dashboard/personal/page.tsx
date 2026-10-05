'use client'

import { Search, UserPlus, RefreshCw } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { usePersonalAdmin } from '@/hooks/usePersonalAdmin'

// Dumb Components
import { AccesoDenegado } from '@/components/dashboard/personal/AccesoDenegado'
import { PersonalTable } from '@/components/dashboard/personal/PersonalTable'

// Modals
import PersonalModal from './PersonalModal'
import PersonalStatsModal from './PersonalStatsModal'
import PersonalViewModal from './PersonalViewModal'

export default function PersonalPage() {
  const { user } = useAuth()
  
  const {
    data,
    loading,
    error,
    searchInput,
    setSearchInput,
    page,
    setPage,
    limit,
    setLimit,
    isCreateModalOpen,
    setIsCreateModalOpen,
    selectedWorker,
    setSelectedWorker,
    selectedStatsId,
    setSelectedStatsId,
    selectedViewWorker,
    setSelectedViewWorker,
    actionLoading,
    fetchPersonal,
    handleToggleEstado,
    handleResetPassword
  } = usePersonalAdmin()

  if (user?.rol_id !== 1) {
    return <AccesoDenegado />
  }

  const personal = data?.data || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gestión de Personal</h1>
          <p className="text-muted-foreground mt-1">Administra accesos, contraseñas y roles del equipo.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchPersonal}
            className="flex items-center gap-2 px-4 py-2 bg-card border border-border hover:bg-muted rounded-xl transition-colors text-sm font-medium"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Actualizar
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white rounded-xl transition-all duration-300 text-sm font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] hover:-translate-y-0.5"
          >
            <UserPlus size={18} />
            Nuevo Trabajador
          </button>
        </div>
      </div>

      <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-5 flex flex-col sm:flex-row gap-4 items-center shadow-lg">
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-emerald-500" size={18} />
          <input
            type="text"
            placeholder="Buscar por nombre, correo o usuario..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full bg-background/50 border border-border/50 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all shadow-inner"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto bg-background/50 border border-border/50 rounded-xl px-4 py-2 shadow-inner">
          <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Mostrar:</span>
          <select
            value={limit}
            onChange={(e) => { setLimit(Number(e.target.value)); setPage(1) }}
            className="bg-transparent text-sm focus:outline-none font-bold text-foreground cursor-pointer"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      <PersonalTable 
        loading={loading}
        error={error}
        personal={personal}
        data={data}
        page={page}
        setPage={setPage}
        user={user}
        actionLoading={actionLoading}
        setSelectedViewWorker={setSelectedViewWorker}
        setSelectedWorker={setSelectedWorker}
        setIsCreateModalOpen={setIsCreateModalOpen}
        setSelectedStatsId={setSelectedStatsId}
        handleResetPassword={handleResetPassword}
        handleToggleEstado={handleToggleEstado}
      />

      {isCreateModalOpen && (
        <PersonalModal
          initialData={selectedWorker}
          onClose={() => {
            setIsCreateModalOpen(false)
            setSelectedWorker(null)
          }}
          onSuccess={() => {
            setIsCreateModalOpen(false)
            setSelectedWorker(null)
            fetchPersonal()
          }}
        />
      )}

      {selectedStatsId && (
        <PersonalStatsModal
          userId={selectedStatsId}
          onClose={() => setSelectedStatsId(null)}
        />
      )}

      {selectedViewWorker && (
        <PersonalViewModal
          worker={selectedViewWorker}
          onClose={() => setSelectedViewWorker(null)}
        />
      )}
    </div>
  )
}
