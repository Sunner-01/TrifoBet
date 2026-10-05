'use client'

import { API_URL } from '@/lib/api'
import { useState, useEffect } from 'react'
import { Check, X, Loader2, Image as ImageIcon, Search, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'

interface CuentaRetiro {
  id: number
  usuario_id: number
  billetera: string
  numero_cuenta: string
  nombre_titular: string
  qr_url: string | null
  estado: string
  created_at: string
  usuario: {
    nombre: string
    apellido1: string
    correo: string
  }
}

export function CuentasPendientes() {
  const [cuentas, setCuentas] = useState<CuentaRetiro[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<number | null>(null)
  const [selectedQr, setSelectedQr] = useState<string | null>(null)
  const [confirmDialog, setConfirmDialog] = useState<{ id: number, estado: 'aprobada' | 'rechazada' } | null>(null)
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null)

  const [filterEstado, setFilterEstado] = useState('pendiente')
  const [filterBilletera, setFilterBilletera] = useState('todas')
  const [searchTerm, setSearchTerm] = useState('')

  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [totalRecords, setTotalRecords] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchCuentas = async () => {
    setLoading(true)
    try {
      const token = sessionStorage.getItem('admin_token')
      const offset = (page - 1) * limit
      let url = `${API_URL}/retiros/admin/cuentas?estado=${filterEstado}&billetera=${filterBilletera}&limit=${limit}&offset=${offset}`

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setCuentas(data.data || [])
        setTotalRecords(data.total || 0)
      }
    } catch (error) {
      console.error('Error', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchCuentas()
    setIsRefreshing(false)
  }

  useEffect(() => {
    fetchCuentas()
  }, [filterEstado, filterBilletera, page, limit])

  const handleProcess = async (id: number, estado: 'aprobada' | 'rechazada') => {
    setProcessingId(id)
    try {
      const token = sessionStorage.getItem('admin_token')
      const res = await fetch(`${API_URL}/retiros/admin/cuentas/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ estado })
      })

      if (res.ok) {
        if (filterEstado === 'todos') {
          setCuentas(cuentas.map(c => c.id === id ? { ...c, estado } : c))
        } else {
          setCuentas(cuentas.filter(c => c.id !== id))
        }
        setNotification({ message: `Cuenta ${estado} exitosamente`, type: 'success' })
      } else {
        const error = await res.json()
        setNotification({ message: `Error: ${error.message}`, type: 'error' })
      }
    } catch (error) {
      setNotification({ message: 'Error de conexión', type: 'error' })
    } finally {
      setProcessingId(null)
      setConfirmDialog(null)
      setTimeout(() => setNotification(null), 3000)
    }
  }

  const filteredCuentas = cuentas.filter(c => {
    if (searchTerm) {
      const lower = searchTerm.toLowerCase()
      const matchTitular = c.nombre_titular.toLowerCase().includes(lower)
      const matchUsuario = c.usuario?.nombre?.toLowerCase().includes(lower) || c.usuario?.apellido1?.toLowerCase().includes(lower) || false
      const matchNumero = c.numero_cuenta.includes(lower)
      if (!matchTitular && !matchUsuario && !matchNumero) return false
    }
    return true
  })

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-border bg-muted/20">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-semibold text-foreground text-lg mb-1">Gestión de Cuentas de Retiro</h2>
            <p className="text-sm text-muted-foreground mb-4">Administra, aprueba o da de baja las cuentas registradas por los usuarios.</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing || loading}
            className="flex items-center gap-2 px-3 py-1.5 bg-background border border-border hover:bg-muted text-foreground rounded-lg font-medium transition-colors text-sm"
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
            Actualizar
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex flex-wrap gap-3 items-center">
            <select
              value={filterEstado}
              onChange={(e) => { setFilterEstado(e.target.value); setPage(1); }}
              className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary min-w-[140px]"
            >
              <option value="todos">Todos los Estados</option>
              <option value="pendiente">Pendientes</option>
              <option value="aprobada">Aprobadas</option>
              <option value="rechazada">Rechazadas</option>
            </select>

            <select
              value={filterBilletera}
              onChange={(e) => { setFilterBilletera(e.target.value); setPage(1); }}
              className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary min-w-[140px]"
            >
              <option value="todas">Todas las Billeteras</option>
              <option value="Yape">Yape</option>
              <option value="Yolo Pago">Yolo Pago</option>
            </select>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
            <input
              type="text"
              placeholder="Buscar titular o usuario..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              className="w-full bg-background border border-border rounded-lg pl-9 pr-4 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-4 py-3 text-sm font-semibold text-foreground">Fecha</th>
              <th className="px-4 py-3 text-sm font-semibold text-foreground">Usuario Registrado</th>
              <th className="px-4 py-3 text-sm font-semibold text-foreground">Titular Cuenta</th>
              <th className="px-4 py-3 text-sm font-semibold text-foreground">Billetera</th>
              <th className="px-4 py-3 text-sm font-semibold text-foreground">Número</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-foreground">Estado</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-foreground">QR</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-foreground">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
                  <p className="text-muted-foreground">Cargando cuentas...</p>
                </td>
              </tr>
            ) : filteredCuentas.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                  No hay cuentas registradas con estos filtros.
                </td>
              </tr>
            ) : (
              filteredCuentas.map((c) => (
                <tr key={c.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                    {new Date(c.created_at).toLocaleString('es-BO')}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-foreground">{c.usuario?.nombre || 'Usuario'} {c.usuario?.apellido1 || ''}</p>
                    <p className="text-xs text-muted-foreground">{c.usuario?.correo || 'Sin correo'}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-blue-400">{c.nombre_titular}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-1 bg-muted rounded text-xs font-medium uppercase tracking-wide">
                      {c.billetera}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-mono text-foreground font-medium">
                    {c.numero_cuenta}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium uppercase tracking-wide ${c.estado === 'aprobada' ? 'bg-green-500/10 text-green-500' :
                        c.estado === 'rechazada' ? 'bg-red-500/10 text-red-500' :
                          'bg-yellow-500/10 text-yellow-500'
                      }`}>
                      {c.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {c.qr_url ? (
                      <button
                        onClick={() => setSelectedQr(c.qr_url)}
                        className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80"
                      >
                        <ImageIcon size={16} /> Ver QR
                      </button>
                    ) : (
                      <span className="text-xs text-muted-foreground">Sin QR</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {c.estado === 'pendiente' && (
                        <>
                          <button
                            onClick={() => setConfirmDialog({ id: c.id, estado: 'aprobada' })}
                            disabled={processingId === c.id}
                            className="px-3 py-1.5 bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white text-xs font-medium rounded transition-colors disabled:opacity-50 flex items-center gap-1"
                          >
                            {processingId === c.id && confirmDialog?.estado === 'aprobada' ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                            Aprobar
                          </button>
                          <button
                            onClick={() => setConfirmDialog({ id: c.id, estado: 'rechazada' })}
                            disabled={processingId === c.id}
                            className="px-3 py-1.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white text-xs font-medium rounded transition-colors disabled:opacity-50 flex items-center gap-1"
                          >
                            {processingId === c.id && confirmDialog?.estado === 'rechazada' ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
                            Rechazar
                          </button>
                        </>
                      )}

                      {c.estado === 'aprobada' && (
                        <button
                          onClick={() => setConfirmDialog({ id: c.id, estado: 'rechazada' })}
                          disabled={processingId === c.id}
                          className="px-3 py-1.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white text-xs font-medium rounded transition-colors disabled:opacity-50 flex items-center gap-1"
                        >
                          {processingId === c.id ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
                          Dar de Baja
                        </button>
                      )}

                      {c.estado === 'rechazada' && (
                        <button
                          onClick={() => setConfirmDialog({ id: c.id, estado: 'aprobada' })}
                          disabled={processingId === c.id}
                          className="px-3 py-1.5 bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white text-xs font-medium rounded transition-colors disabled:opacity-50 flex items-center gap-1"
                        >
                          {processingId === c.id ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                          Aprobar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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

      {selectedQr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setSelectedQr(null)}>
          <div className="bg-card rounded-lg p-4 max-w-sm w-full shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Código QR</h3>
              <button onClick={() => setSelectedQr(null)} className="text-muted-foreground hover:text-foreground">
                <X size={20} />
              </button>
            </div>
            <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-white">
              <img src={selectedQr} alt="QR Code" className="object-contain w-full h-full" />
            </div>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal */}
      {confirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => !processingId && setConfirmDialog(null)}>
          <div className="bg-card rounded-lg p-6 max-w-sm w-full shadow-xl border border-border" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold text-lg mb-2 text-foreground">Confirmar Acción</h3>
            <p className="text-muted-foreground mb-6">
              ¿Estás seguro de que deseas <span className="font-bold text-foreground">{confirmDialog.estado === 'aprobada' ? 'APROBAR' : 'RECHAZAR'}</span> esta cuenta?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDialog(null)}
                disabled={processingId !== null}
                className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleProcess(confirmDialog.id, confirmDialog.estado)}
                disabled={processingId !== null}
                className={`px-4 py-2 rounded-lg text-white transition-colors disabled:opacity-50 flex items-center gap-2 ${confirmDialog.estado === 'aprobada' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
                  }`}
              >
                {processingId !== null ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {notification && (
        <div className={`fixed bottom-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium flex items-center gap-2 transition-all ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}>
          {notification.type === 'success' ? <Check size={18} /> : <X size={18} />}
          {notification.message}
        </div>
      )}
    </div>
  )
}
