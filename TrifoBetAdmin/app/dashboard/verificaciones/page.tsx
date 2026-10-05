'use client'

import { RefreshCw } from 'lucide-react'
import VerificationModal from '@/components/dashboard/modals/VerificationModal'
import { useVerificacionesAdmin } from '@/hooks/useVerificacionesAdmin'

// Dumb Component
import { VerificacionesTable } from '@/components/dashboard/verificaciones/VerificacionesTable'

export default function VerificacionesPage() {
  const {
    data,
    loading,
    error,
    filterEstado,
    setFilterEstado,
    page,
    setPage,
    limit,
    setLimit,
    selectedVerification,
    isModalOpen,
    setIsModalOpen,
    fetchVerificaciones,
    handleReview,
    handleSaved
  } = useVerificacionesAdmin()

  const verificaciones = data?.data || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Verificaciones KYC</h1>
          <p className="text-muted-foreground mt-1">
            Revisa y aprueba documentos de identidad de los usuarios
          </p>
        </div>
        <button
          onClick={fetchVerificaciones}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 bg-background border border-border hover:bg-muted text-foreground rounded-lg font-medium transition-colors text-sm disabled:opacity-50"
          title="Actualizar"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Actualizar
        </button>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Filtros */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <select
            value={filterEstado}
            onChange={(e) => {
              setFilterEstado(e.target.value)
              setPage(1)
            }}
            className="px-4 py-2 border border-border bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          >
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendientes</option>
            <option value="aprobado">Aprobados</option>
            <option value="rechazado">Rechazados</option>
          </select>
        </div>
      </div>

      <VerificacionesTable 
        loading={loading}
        verificaciones={verificaciones}
        data={data}
        limit={limit}
        setLimit={setLimit}
        page={page}
        setPage={setPage}
        handleReview={handleReview}
      />

      {isModalOpen && selectedVerification && (
        <VerificationModal
          verificacion={selectedVerification}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSaved={handleSaved}
        />
      )}
    </div>
  )
}
