'use client'

import { Search, RefreshCw, Clock, Bell, TrendingUp, Zap } from 'lucide-react'
import { useRecargasAdmin } from '@/hooks/useRecargasAdmin'

// Dumb Components
import { RecargasTable } from '@/components/dashboard/recargas/RecargasTable'
import { SolicitudModal } from '@/components/dashboard/recargas/modals/SolicitudModal'

export default function RecargasAdminPage() {
  const {
    data,
    stats,
    notifs,
    loading,
    filterEstado,
    setFilterEstado,
    busqueda,
    setBusqueda,
    page,
    setPage,
    limit,
    setLimit,
    selectedSolicitud,
    setSelectedSolicitud,
    fetchAll
  } = useRecargasAdmin()

  const solicitudes = data?.data || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestión de Recargas</h1>
          <p className="text-muted-foreground mt-1">Monitoreo y aprobación de recargas vía Yape QR</p>
        </div>
        <button onClick={fetchAll} disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 bg-background border border-border hover:bg-muted text-foreground rounded-lg font-medium transition-colors text-sm disabled:opacity-50"
          title="Actualizar">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Actualizar
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={16} className="text-yellow-400" />
              <span className="text-xs text-muted-foreground font-medium">Pendientes</span>
            </div>
            <p className="text-2xl font-bold text-yellow-400">{stats.pendientes}</p>
          </div>
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={16} className="text-green-400" />
              <span className="text-xs text-muted-foreground font-medium">Monto aprobado hoy</span>
            </div>
            <p className="text-2xl font-bold text-green-400">Bs {stats.montoAprobadoHoy?.toFixed(2) || '0.00'}</p>
          </div>
          <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap size={16} className="text-violet-400" />
              <span className="text-xs text-muted-foreground font-medium">Aprobadas hoy</span>
            </div>
            <p className="text-2xl font-bold text-violet-400">{stats.aprobadas}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Bell size={16} className="text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-medium">Última notif. Yape</span>
            </div>
            <p className="text-xs font-medium truncate">
              {stats.ultimaNotificacionYape
                ? new Date(stats.ultimaNotificacionYape.fecha_recibida).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
                : 'Sin datos'}
            </p>
          </div>
        </div>
      )}

      {/* Últimas notificaciones de Yape */}
      {notifs.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Bell size={14} className="text-violet-400" />
            Últimas notificaciones capturadas de Yape
          </h3>
          <div className="space-y-2">
            {notifs.map((n: any) => (
              <div key={n.id} className="flex items-center justify-between text-xs bg-muted/30 rounded-lg px-3 py-2">
                <span className="text-muted-foreground truncate max-w-xs">{n.texto_raw}</span>
                <div className="flex items-center gap-3 ml-3 flex-shrink-0">
                  {n.monto && <span className="text-green-400 font-semibold">Bs {n.monto}</span>}
                  <span className={n.procesada ? 'text-green-400' : 'text-yellow-400'}>{n.procesada ? '✓ Procesada' : '⏳ Pendiente'}</span>
                  <span className="text-muted-foreground">{new Date(n.fecha_recibida).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={busqueda}
              onChange={e => { setBusqueda(e.target.value); setPage(1) }}
              placeholder="Buscar por código o nombre titular..."
              className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-violet-500"
            />
          </div>
          <select value={filterEstado} onChange={e => { setFilterEstado(e.target.value); setPage(1) }}
            className="px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-violet-500">
            <option value="todos">Todos los estados</option>
            <option value="pendiente">Pendientes</option>
            <option value="aprobado">Aprobados</option>
            <option value="rechazado">Rechazados</option>
          </select>
        </div>
      </div>

      {/* Tabla Component */}
      <RecargasTable
        loading={loading}
        solicitudes={solicitudes}
        data={data}
        page={page}
        setPage={setPage}
        limit={limit}
        setLimit={setLimit}
        setSelectedSolicitud={setSelectedSolicitud}
      />

      {/* Modal */}
      {selectedSolicitud && (
        <SolicitudModal
          solicitud={selectedSolicitud}
          onClose={() => setSelectedSolicitud(null)}
          onActualizar={fetchAll}
        />
      )}
    </div>
  )
}
