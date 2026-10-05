import React from 'react';
import { X } from 'lucide-react';
import { fmtBetId, statusConfig, tipoConfig } from '@/lib/apuestas-utils';

export function BetDetailPanel({ bet, onClose }: { bet: any; onClose: () => void }) {
  const st = statusConfig[bet.estado] || statusConfig.cancelada;
  const tt = tipoConfig[bet.tipo] || tipoConfig.simple;
  const items: any[] = bet.items || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <span className="font-mono text-lg font-bold text-foreground">{fmtBetId(bet.id)}</span>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${tt}`}>{bet.tipo?.toUpperCase()}</span>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${st.className}`}>{st.label}</span>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground">
            <X size={18} />
          </button>
        </div>

        {/* Meta info */}
        <div className="px-6 py-4 border-b border-border grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Usuario</p>
            <p className="font-semibold text-foreground">@{bet.usuario?.nombre_usuario || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Fecha y hora</p>
            <p className="font-semibold text-foreground">
              {new Date(bet.fecha_creacion || bet.created_at).toLocaleString('es-BO', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
              })}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Monto apostado</p>
            <p className="font-bold text-foreground text-base">Bs {Number(bet.monto).toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Cuota total</p>
            <p className="font-bold text-foreground text-base">{Number(bet.cuota_total || 0).toFixed(2)}x</p>
          </div>
          {bet.estado === 'cashout' ? (
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Monto cashout</p>
              <p className="font-bold text-blue-400 text-base">Bs {Number(bet.monto_cashout).toFixed(2)}</p>
            </div>
          ) : (
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Ganancia potencial</p>
              <p className={`font-bold text-base ${bet.estado === 'ganada' ? 'text-green-400' : 'text-foreground'}`}>
                Bs {Number(bet.ganancia_potencial).toFixed(2)}
              </p>
            </div>
          )}
          {bet.estado === 'ganada' && (
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Ganancia neta casino</p>
              <p className="font-bold text-red-400 text-base">-Bs {Number(bet.ganancia_potencial).toFixed(2)}</p>
            </div>
          )}
        </div>

        {/* Selecciones */}
        <div className="px-6 py-4 max-h-72 overflow-y-auto">
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-3">
            Selecciones ({items.length})
          </p>
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Sin selecciones registradas</p>
          ) : (
            <div className="space-y-3">
              {items.map((item: any, i: number) => (
                <div key={item.id || i} className="border border-border rounded-xl p-3 bg-muted/20">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="font-semibold text-sm text-foreground leading-tight">{item.evento_nombre || `Evento #${item.evento_deportivo_id}`}</p>
                    <span className="shrink-0 text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      {Number(item.cuota).toFixed(2)}x
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap mt-1.5">
                    <span className="text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground">{item.mercado || '—'}</span>
                    <span className="text-xs font-medium text-foreground">{item.seleccion_display || item.seleccion}</span>
                    {item.resultado_bool === true && <span className="text-xs text-green-400 font-bold">✓ Correcto</span>}
                    {item.resultado_bool === false && <span className="text-xs text-red-400 font-bold">✗ Incorrecto</span>}
                    {item.resultado_bool === null && <span className="text-xs text-yellow-400">⏳ Pendiente</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-3 border-t border-border flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-muted hover:bg-muted/70 rounded-lg text-sm font-medium transition-colors">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
