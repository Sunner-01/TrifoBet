'use client'

import { RefreshCw, ChevronLeft, ChevronRight, Check, X } from 'lucide-react'
import { useSolicitudesRetiro } from '@/hooks/useSolicitudesRetiro'

// Dumb Components
import { RetirosTable } from '@/components/dashboard/retiros/RetirosTable'
import { ProcesarRetiroModal } from '@/components/dashboard/retiros/modals/ProcesarRetiroModal'
import { RechazarRetiroModal } from '@/components/dashboard/retiros/modals/RechazarRetiroModal'

export function SolicitudesRetiro() {
  const {
    retiros,
    loading,
    activeRetiro,
    setActiveRetiro,
    rejectingRetiro,
    setRejectingRetiro,
    file,
    setFile,
    submitting,
    notification,
    page,
    setPage,
    limit,
    setLimit,
    totalRecords,
    isRefreshing,
    handleRefresh,
    handleProcess,
    handleReject,
    confirmReject,
    closeModal
  } = useSolicitudesRetiro()

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden relative">
      <div className="p-4 border-b border-border bg-muted/20 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-foreground">Solicitudes de Retiro Pendientes</h2>
          <p className="text-sm text-muted-foreground">Realiza el pago a la cuenta indicada y sube el comprobante para finalizar.</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing || loading}
          className="flex items-center gap-2 px-3 py-1.5 bg-background border border-border hover:bg-muted text-foreground rounded-lg font-medium transition-colors text-sm disabled:opacity-50"
          title="Actualizar solicitudes"
        >
          <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
          Actualizar
        </button>
      </div>

      <RetirosTable 
        retiros={retiros} 
        loading={loading} 
        onProcess={setActiveRetiro} 
        onReject={handleReject} 
      />

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

      {activeRetiro && (
        <ProcesarRetiroModal 
          retiro={activeRetiro}
          file={file}
          setFile={setFile}
          submitting={submitting}
          onProcess={handleProcess}
          onClose={closeModal}
        />
      )}

      {rejectingRetiro && (
        <RechazarRetiroModal 
          submitting={submitting}
          onConfirm={confirmReject}
          onClose={() => setRejectingRetiro(null)}
        />
      )}

      {notification && (
        <div className={`fixed bottom-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium flex items-center gap-2 transition-all ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          {notification.type === 'success' ? <Check size={18} /> : <X size={18} />}
          {notification.message}
        </div>
      )}
    </div>
  )
}
