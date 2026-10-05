import React from 'react';
import { Eye, Edit2, BarChart3, KeyRound, CheckCircle, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { ROL_LABELS, ROL_COLORS } from '@/lib/personal-utils';

interface PersonalTableProps {
  loading: boolean;
  error: string | null;
  personal: any[];
  data: any;
  page: number;
  setPage: (page: number | ((p: number) => number)) => void;
  user: any;
  actionLoading: number | null;
  setSelectedViewWorker: (worker: any) => void;
  setSelectedWorker: (worker: any) => void;
  setIsCreateModalOpen: (open: boolean) => void;
  setSelectedStatsId: (id: number) => void;
  handleResetPassword: (id: number) => void;
  handleToggleEstado: (id: number) => void;
}

export function PersonalTable({
  loading, error, personal, data, page, setPage, user, actionLoading,
  setSelectedViewWorker, setSelectedWorker, setIsCreateModalOpen,
  setSelectedStatsId, handleResetPassword, handleToggleEstado
}: PersonalTableProps) {
  return (
    <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
            <tr>
              <th className="px-6 py-4 font-medium">Trabajador</th>
              <th className="px-6 py-4 font-medium">Rol</th>
              <th className="px-6 py-4 font-medium">Estado</th>
              <th className="px-6 py-4 font-medium text-center">Transacciones (Total)</th>
              <th className="px-6 py-4 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading && !personal.length ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                  Cargando personal...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-red-400">
                  {error}
                </td>
              </tr>
            ) : personal.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                  No se encontraron trabajadores
                </td>
              </tr>
            ) : (
              personal.map((p: any) => (
                <tr key={p.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">{p.nombre}</span>
                      <span className="text-xs text-muted-foreground">{p.correo}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${ROL_COLORS[p.rol_id] || 'bg-gray-500/10 text-gray-400'}`}>
                      {ROL_LABELS[p.rol_id] || p.rol?.nombre || 'Desconocido'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                      p.habilitado 
                        ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                      {p.habilitado ? <CheckCircle size={12}/> : <XCircle size={12}/>}
                      {p.habilitado ? 'Activo' : 'Suspendido'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center font-mono font-medium">
                    {p.transacciones_procesadas || 0}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedViewWorker(p)}
                        className="p-2 hover:bg-emerald-500/10 hover:text-emerald-400 text-muted-foreground rounded-xl transition-all duration-300 hover:scale-110"
                        title="Ver Perfil Detallado"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedWorker(p);
                          setIsCreateModalOpen(true);
                        }}
                        className="p-2 hover:bg-blue-500/10 hover:text-blue-400 text-muted-foreground rounded-xl transition-all duration-300 hover:scale-110"
                        title="Editar Perfil"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => setSelectedStatsId(p.id)}
                        className="p-2 hover:bg-emerald-500/10 hover:text-emerald-400 text-muted-foreground rounded-xl transition-all duration-300 hover:scale-110"
                        title="Ver Rendimiento Detallado"
                      >
                        <BarChart3 size={18} />
                      </button>
                      <button
                        onClick={() => handleResetPassword(p.id)}
                        disabled={actionLoading === p.id || p.id === user?.id}
                        className="p-2 hover:bg-yellow-500/10 hover:text-yellow-400 text-muted-foreground rounded-xl transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:hover:scale-100"
                        title="Restablecer Contraseña"
                      >
                        <KeyRound size={18} />
                      </button>
                      <button
                        onClick={() => handleToggleEstado(p.id)}
                        disabled={actionLoading === p.id || p.id === user?.id}
                        className="p-2 hover:bg-red-500/10 hover:text-red-400 text-muted-foreground rounded-xl transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:hover:scale-100"
                        title={p.habilitado ? 'Suspender Acceso' : 'Habilitar Acceso'}
                      >
                        {p.habilitado ? <XCircle size={18} /> : <CheckCircle size={18} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/20">
          <span className="text-sm text-muted-foreground">
            Mostrando {personal.length} de {data.total}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p: number) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg border border-border hover:bg-muted disabled:opacity-50 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="flex items-center px-4 text-sm font-medium border border-border rounded-lg bg-background">
              {page} / {data.totalPages}
            </span>
            <button
              onClick={() => setPage((p: number) => Math.min(data.totalPages, p + 1))}
              disabled={page === data.totalPages}
              className="p-2 rounded-lg border border-border hover:bg-muted disabled:opacity-50 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
