'use client'

import React from 'react'
import { Search, RefreshCw, TrendingUp, DollarSign, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import { useApuestasAdmin } from '@/hooks/useApuestasAdmin'

// Dumb Components
import { StatCard } from '@/components/dashboard/apuestas/StatCard'
import { BetDetailPanel } from '@/components/dashboard/apuestas/BetDetailPanel'
import { ApuestasTable } from '@/components/dashboard/apuestas/ApuestasTable'

export default function ApuestasPage() {
  const {
    stats,
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    selectedBet,
    setSelectedBet,
    loading,
    expandedRow,
    setExpandedRow,
    page,
    setPage,
    limit,
    setLimit,
    totalRecords,
    filteredBets,
    pendingCount,
    wonCount,
    handleRefresh
  } = useApuestasAdmin()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Apuestas Deportivas</h1>
          <p className="text-muted-foreground mt-1">Monitoreo en tiempo real de todas las apuestas</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 bg-background border border-border hover:bg-muted text-foreground rounded-lg font-medium transition-colors text-sm disabled:opacity-50"
          title="Actualizar"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Actualizar
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Clock} label="Apuestas Pendientes" value={String(pendingCount)} sub="En espera de resultado" />
        <StatCard icon={TrendingUp} label="Volumen Total" value={`Bs ${stats.totalVolumen.toFixed(2)}`} sub="Monto total apostado" />
        <StatCard icon={DollarSign} label="Ingresos del Casino" value={`Bs ${stats.totalIngresos.toFixed(2)}`} sub="Apostado − Pagado" />
        <StatCard icon={Search} label="Apuestas Ganadas (usr)" value={String(wonCount)} sub="Por el usuario" />
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <input
            type="text"
            placeholder="Buscar por usuario o ID de apuesta..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2 border border-border bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value as any); setPage(1); }}
          className="px-4 py-2 border border-border bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm min-w-48"
        >
          <option value="todos">Todos los estados</option>
          <option value="pendiente">Pendientes</option>
          <option value="ganada">Ganadas</option>
          <option value="perdida">Perdidas</option>
          <option value="cashout">Cashout</option>
        </select>
      </div>

      {/* Table Component */}
      <div className="bg-card border border-border rounded-xl overflow-hidden flex flex-col">
        <ApuestasTable 
          loading={loading}
          filteredBets={filteredBets}
          expandedRow={expandedRow}
          setExpandedRow={setExpandedRow}
          setSelectedBet={setSelectedBet}
        />

        {/* Footer count */}
        {!loading && totalRecords > 0 && (
          <div className="bg-muted/30 border-t border-border p-4 flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Mostrar</span>
              <select
                value={limit}
                onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                className="border border-border bg-background rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-sm text-muted-foreground">registros por página</span>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Mostrando {Math.min((page - 1) * limit + 1, totalRecords)} a {Math.min(page * limit, totalRecords)} de {totalRecords} apuestas
              </span>
              <div className="flex gap-1">
                <button
                  disabled={page === 1 || loading}
                  onClick={() => setPage(p => p - 1)}
                  className="p-1 border border-border rounded-md hover:bg-muted disabled:opacity-50 text-foreground transition-colors"
                  title="Página Anterior"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  disabled={page >= Math.ceil(totalRecords / limit) || loading}
                  onClick={() => setPage(p => p + 1)}
                  className="p-1 border border-border rounded-md hover:bg-muted disabled:opacity-50 text-foreground transition-colors"
                  title="Página Siguiente"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedBet && (
        <BetDetailPanel bet={selectedBet} onClose={() => setSelectedBet(null)} />
      )}
    </div>
  )
}
