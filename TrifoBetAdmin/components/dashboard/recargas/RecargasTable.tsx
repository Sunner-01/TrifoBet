import { AlertCircle, ExternalLink, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { EstadoBadge } from './EstadoBadge';

interface RecargasTableProps {
  loading: boolean;
  solicitudes: any[];
  data: any;
  page: number;
  setPage: (page: number | ((p: number) => number)) => void;
  limit: number;
  setLimit: (limit: number) => void;
  setSelectedSolicitud: (solicitud: any) => void;
}

export function RecargasTable({
  loading,
  solicitudes,
  data,
  page,
  setPage,
  limit,
  setLimit,
  setSelectedSolicitud
}: RecargasTableProps) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              {['Código', 'Usuario', 'Monto', 'Titular', 'Match Yape', 'Auto.', 'Comprobante', 'Estado', 'Fecha', 'Acción'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 10 }).map((_, j) => (
                    <td key={j} className="px-4 py-4"><div className="h-4 bg-muted rounded animate-pulse" /></td>
                  ))}
                </tr>
              ))
            ) : solicitudes.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-16 text-center">
                  <AlertCircle size={36} className="mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground text-sm">No hay solicitudes con este filtro</p>
                </td>
              </tr>
            ) : (
              solicitudes.map((s: any) => (
                <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs font-bold text-violet-400">{s.codigo_unico}</span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium">{s.usuario?.nombre} {s.usuario?.apellido1}</p>
                    <p className="text-xs text-muted-foreground">{s.usuario?.correo}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-bold text-green-400">Bs {parseFloat(s.monto).toFixed(2)}</span>
                  </td>
                  <td className="px-4 py-3 text-sm">{s.nombre_titular}</td>
                  <td className="px-4 py-3 text-center">
                    {s.match_score != null
                      ? <span className={`text-xs font-bold ${s.match_score >= 85 ? 'text-green-400' : 'text-red-400'}`}>{s.match_score}%</span>
                      : <span className="text-muted-foreground text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {s.procesado_auto ? <span className="text-green-400 text-sm">✓</span> : <span className="text-muted-foreground text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {s.url_comprobante
                      ? <a href={s.url_comprobante} target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300 transition-colors"><ExternalLink size={14} /></a>
                      : <span className="text-muted-foreground text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3"><EstadoBadge estado={s.estado} /></td>
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(s.fecha_creacion).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => setSelectedSolicitud(s)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-xs font-medium transition-colors">
                      <Eye size={13} />
                      {s.estado === 'pendiente' ? 'Gestionar' : 'Detalle'}
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
  );
}
