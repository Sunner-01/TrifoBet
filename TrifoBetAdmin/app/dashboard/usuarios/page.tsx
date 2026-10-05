'use client'

import { Search, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react'
import { useUsuarios } from '@/hooks/useUsuarios'
import UsuariosTable from '@/components/dashboard/usuarios/UsuariosTable'
import UserModal from '@/components/dashboard/modals/UserModal'

// Refactorización SRP y Clean Code:
// 1. La lógica de peticiones y estado se movió a useUsuarios.
// 2. La representación HTML compleja se movió a UsuariosTable.
// Esta página ahora solo es responsable de orquestar los componentes principales y los filtros.
export default function UsuariosPage() {
  const {
    data,
    loading,
    error,
    searchInput,
    setSearchInput,
    filterHabilitado,
    setFilterHabilitado,
    page,
    setPage,
    limit,
    setLimit,
    selectedUser,
    setSelectedUser,
    isModalOpen,
    setIsModalOpen,
    togglingId,
    fetchUsuarios,
    handleToggleHabilitar,
    handleEditUser,
    handleSaveUser
  } = useUsuarios()

  const usuarios = data?.data || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestión de Usuarios</h1>
          <p className="text-muted-foreground mt-1">
            {data ? `${data.total} usuarios registrados en el sistema` : 'Cargando...'}
          </p>
        </div>
        <button
          onClick={fetchUsuarios}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 bg-background border border-border hover:bg-muted text-foreground rounded-lg font-medium transition-colors text-sm disabled:opacity-50"
          title="Actualizar"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Actualizar
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Filtros */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={17} />
            <input
              type="text"
              placeholder="Buscar por nombre, usuario o correo..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
          </div>
          <select
            value={filterHabilitado}
            onChange={(e) => {
              setFilterHabilitado(e.target.value as '' | 'true' | 'false')
              setPage(1)
            }}
            className="px-4 py-2 border border-border bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          >
            <option value="">Todos los estados</option>
            <option value="true">Habilitados</option>
            <option value="false">Suspendidos</option>
          </select>
        </div>
      </div>

      {/* Tabla (Componente Extraído) */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <UsuariosTable
          usuarios={usuarios}
          loading={loading}
          togglingId={togglingId}
          onEdit={handleEditUser}
          onToggleHabilitar={handleToggleHabilitar}
        />

        {/* Paginación */}
        {data && (
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
                Mostrando {Math.min((page - 1) * limit + 1, data.total)} a {Math.min(page * limit, data.total)} de {data.total} usuarios
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
                  disabled={page >= data.totalPages || loading}
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

      {/* Modal */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedUser(null) }}
        onSave={handleSaveUser}
        user={selectedUser || undefined}
      />
    </div>
  )
}
