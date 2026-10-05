import React from 'react';
import { ChevronDown, ChevronRight, TrendingUp } from 'lucide-react';
import { fmtBetId, statusConfig, tipoConfig } from '@/lib/apuestas-utils';

interface ApuestasTableProps {
  loading: boolean;
  filteredBets: any[];
  expandedRow: number | null;
  setExpandedRow: (id: number | null) => void;
  setSelectedBet: (bet: any) => void;
}

export function ApuestasTable({ loading, filteredBets, expandedRow, setExpandedRow, setSelectedBet }: ApuestasTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-muted/40 border-b border-border">
          <tr>
            <th className="w-8 px-4 py-3" />
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Fecha y Hora</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">ID</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Usuario</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tipo</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Evento(s)</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cuota</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Monto</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Potencial</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">Estado</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">Detalle</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <tr key={i}>
                {Array.from({ length: 11 }).map((_, j) => (
                  <td key={j} className="px-4 py-4"><div className="h-4 bg-muted rounded animate-pulse" /></td>
                ))}
              </tr>
            ))
          ) : filteredBets.length === 0 ? (
            <tr>
              <td colSpan={11} className="px-4 py-16 text-center">
                <TrendingUp size={40} className="mx-auto text-muted-foreground mb-3 opacity-40" />
                <p className="text-muted-foreground text-sm">No se encontraron apuestas</p>
              </td>
            </tr>
          ) : filteredBets.map((bet) => {
            const st = statusConfig[bet.estado] || statusConfig.cancelada;
            const tt = tipoConfig[bet.tipo] || tipoConfig.simple;
            const items: any[] = bet.items || [];
            const firstEvent = items[0]?.evento_nombre || '—';
            const moreEvents = items.length > 1 ? `+${items.length - 1} más` : null;
            const isExpanded = expandedRow === bet.id;

            return (
              <React.Fragment key={bet.id}>
                <tr
                  className={`hover:bg-muted/30 transition-colors cursor-pointer ${isExpanded ? 'bg-muted/20' : ''}`}
                  onClick={() => setExpandedRow(isExpanded ? null : bet.id)}
                >
                  <td className="px-4 py-3 text-muted-foreground">
                    {isExpanded
                      ? <ChevronDown size={14} />
                      : <ChevronRight size={14} />
                    }
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                    {new Date(bet.fecha_creacion || bet.created_at).toLocaleString('es-BO', {
                      day: '2-digit', month: '2-digit', year: '2-digit',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </td>
                  <td className="px-4 py-3 text-sm font-mono font-bold text-foreground">{fmtBetId(bet.id)}</td>
                  <td className="px-4 py-3 text-sm text-foreground">
                    <span className="font-medium">@{bet.usuario?.nombre_usuario || '—'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${tt}`}>
                      {bet.tipo}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground max-w-52">
                    <p className="truncate">{firstEvent}</p>
                    {moreEvents && <span className="text-xs text-muted-foreground">{moreEvents}</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-center font-bold text-foreground">{Number(bet.cuota_total || 0).toFixed(2)}x</td>
                  <td className="px-4 py-3 text-sm text-right font-semibold text-foreground whitespace-nowrap">Bs {Number(bet.monto).toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm text-right font-semibold whitespace-nowrap">
                    {bet.estado === 'cashout'
                      ? <span className="text-blue-400">Bs {Number(bet.monto_cashout).toFixed(2)}</span>
                      : <span className={bet.estado === 'ganada' ? 'text-green-400' : ''}>Bs {Number(bet.ganancia_potencial).toFixed(2)}</span>
                    }
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${st.className}`}>
                      {st.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedBet(bet); }}
                      className="text-xs text-primary hover:underline font-medium"
                    >
                      Ver más
                    </button>
                  </td>
                </tr>
                {/* Expanded inline row */}
                {isExpanded && items.length > 0 && (
                  <tr className="bg-muted/10">
                    <td colSpan={11} className="px-8 py-3">
                      <div className="flex gap-3 flex-wrap">
                        {items.map((item: any, i: number) => (
                          <div key={i} className="bg-card border border-border rounded-lg px-3 py-2 text-xs min-w-48">
                            <p className="font-semibold text-foreground mb-1 leading-tight">{item.evento_nombre || `Evento #${item.evento_deportivo_id}`}</p>
                            <p className="text-muted-foreground">{item.mercado}</p>
                            <div className="flex items-center justify-between mt-1.5">
                              <span className="font-medium text-foreground">{item.seleccion_display || item.seleccion}</span>
                              <span className="text-primary font-bold">{Number(item.cuota).toFixed(2)}x</span>
                            </div>
                            {item.resultado_bool === true && <p className="text-green-400 text-[10px] mt-1 font-bold">✓ Correcto</p>}
                            {item.resultado_bool === false && <p className="text-red-400 text-[10px] mt-1 font-bold">✗ Incorrecto</p>}
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
