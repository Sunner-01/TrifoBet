'use client'

import { Search, Download, ArrowDownRight, ArrowUpLeft, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react'
import { useTransacciones } from '@/hooks/useTransacciones'
import TransaccionesTable from '@/components/dashboard/transacciones/TransaccionesTable'

export default function TransaccionesPage() {
  const {
    transactions,
    loading,
    searchTerm,
    setSearchTerm,
    filterType,
    setFilterType,
    filterStatus,
    setFilterStatus,
    page,
    setPage,
    limit,
    setLimit,
    totalRecords,
    isRefreshing,
    handleRefresh,
    totalIngresos,
    totalEgresos
  } = useTransacciones()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Transacciones</h1>
          <p className="text-muted-foreground">Registro completo de movimientos financieros</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing || loading}
            className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg font-medium transition-colors"
          >
            <RefreshCw size={20} className={isRefreshing ? 'animate-spin' : ''} />
            Actualizar
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors">
            <Download size={20} />
            Exportar
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <ArrowDownRight className="text-primary" size={20} />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Ingresos (Depósitos y Ganancias)</p>
          </div>
          <p className="text-2xl font-bold text-primary">Bs {totalIngresos.toFixed(2)}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-muted rounded-lg">
              <ArrowUpLeft className="text-muted-foreground" size={20} />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Egresos (Retiros)</p>
          </div>
          <p className="text-2xl font-bold text-muted-foreground">Bs {totalEgresos.toFixed(2)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-lg p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-muted-foreground" size={18} />
            <input
              type="text"
              placeholder="Buscar por ID, usuario o concepto..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2 border border-border bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <select
            value={filterType}
            onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
            className="flex-1 px-4 py-2 border border-border bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          >
            <option value="todos">Todos los tipos</option>
            <option value="deposito">Recargas / Depósitos</option>
            <option value="retiro">Retiros</option>
            <option value="apuesta">Apuestas (Descuentos)</option>
            <option value="ganancia">Ganancias (Abonos)</option>
            <option value="reembolso">Reembolsos</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
            className="flex-1 px-4 py-2 border border-border bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          >
            <option value="todos">Todos los estados</option>
            <option value="completado">Completados</option>
            <option value="aprobado">Aprobados</option>
            <option value="pendiente">Pendientes</option>
            <option value="rechazado">Rechazados</option>
            <option value="cancelado">Cancelados</option>
          </select>
        </div>
      </div>

      {/* Table & Pagination */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <TransaccionesTable transactions={transactions} loading={loading} />
        
        {/* Pagination Controls */}
        <div className="bg-muted/30 border-t border-border p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
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
              Mostrando {Math.min((page - 1) * limit + 1, totalRecords)} a {Math.min(page * limit, totalRecords)} de {totalRecords} registros
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
      </div>
    </div>
  )
}
