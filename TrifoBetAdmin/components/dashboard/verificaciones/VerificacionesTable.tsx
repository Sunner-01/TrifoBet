import React from 'react';
import { Eye, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { VerificacionAdmin } from '@/lib/api';
import { ESTADO_COLORS } from '@/lib/verificaciones-utils';

interface VerificacionesTableProps {
  loading: boolean;
  verificaciones: VerificacionAdmin[];
  data: any;
  limit: number;
  setLimit: (limit: number) => void;
  page: number;
  setPage: (page: number | ((p: number) => number)) => void;
  handleReview: (v: VerificacionAdmin) => void;
}

export function VerificacionesTable({
  loading,
  verificaciones,
  data,
  limit,
  setLimit,
  page,
  setPage,
  handleReview
}: VerificacionesTableProps) {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Fecha</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Usuario</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Documento (CI)</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">Estado Actual</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <td key={j} className="px-4 py-4">
                      <div className="h-4 bg-muted rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : verificaciones.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-16 text-center">
                  <AlertCircle size={40} className="mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground text-sm">No hay verificaciones con este filtro</p>
                </td>
              </tr>
            ) : (
              verificaciones.map((v) => (
                <tr key={v.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-4 text-sm text-muted-foreground">
                    {new Date(v.fecha_subida).toLocaleString('es-BO')}
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm font-medium text-foreground">
                      {v.usuario?.nombre} {v.usuario?.apellido1}
                    </p>
                    <p className="text-xs text-muted-foreground">{v.usuario?.correo}</p>
                  </td>
                  <td className="px-4 py-4 text-sm text-foreground">
                    {v.usuario?.ci || 'No registrado'}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ${ESTADO_COLORS[v.estado]}`}>
                      {v.estado}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <button
                      onClick={() => handleReview(v)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-sm font-medium transition-colors"
                    >
                      <Eye size={16} />
                      {v.estado === 'pendiente' ? 'Revisar' : 'Ver detalle'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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
              Mostrando {Math.min((page - 1) * limit + 1, data.total)} a {Math.min(page * limit, data.total)} de {data.total} registros
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
                disabled={page * limit >= data.total || loading}
                onClick={() => setPage(p => p + 1)}
                className="p-1 border border-border rounded-md hover:bg-muted disabled:opacity-50 text-foreground transition-colors"
                title="Siguiente Página"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
