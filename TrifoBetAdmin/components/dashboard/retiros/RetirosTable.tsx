import { Loader2, X } from 'lucide-react';
import { TransaccionRetiro } from '@/hooks/useSolicitudesRetiro';

interface RetirosTableProps {
  retiros: TransaccionRetiro[];
  loading: boolean;
  onProcess: (retiro: TransaccionRetiro) => void;
  onReject: (id: number) => void;
}

export function RetirosTable({ retiros, loading, onProcess, onReject }: RetirosTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-muted/50 border-b border-border">
          <tr>
            <th className="px-4 py-3 text-sm font-semibold text-foreground">Fecha</th>
            <th className="px-4 py-3 text-sm font-semibold text-foreground">Usuario</th>
            <th className="px-4 py-3 text-sm font-semibold text-foreground">Monto a Pagar</th>
            <th className="px-4 py-3 text-sm font-semibold text-foreground">Destino</th>
            <th className="px-4 py-3 text-center text-sm font-semibold text-foreground">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {loading ? (
            <tr>
              <td colSpan={5} className="px-4 py-12 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Cargando solicitudes...</p>
              </td>
            </tr>
          ) : retiros.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                No hay solicitudes de retiro pendientes.
              </td>
            </tr>
          ) : (
            retiros.map((r) => (
              <tr key={r.id} className="hover:bg-muted/30">
                <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                  {new Date(r.fecha_creacion).toLocaleString('es-BO')}
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm font-medium text-foreground">{r.usuario?.nombre || 'Usuario'} {r.usuario?.apellido1 || ''}</p>
                  <p className="text-xs text-muted-foreground">{r.usuario?.correo || 'Sin correo'}</p>
                </td>
                <td className="px-4 py-3 text-foreground font-bold text-lg text-primary">
                  Bs {r.monto.toFixed(2)}
                </td>
                <td className="px-4 py-3">
                  {r.cuenta_retiro ? (
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-blue-400 uppercase">
                        {r.cuenta_retiro.billetera}
                      </span>
                      <span className="text-sm font-mono">{r.cuenta_retiro.numero_cuenta}</span>
                      <span className="text-xs text-muted-foreground">Titular: {r.cuenta_retiro.nombre_titular}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-destructive">Cuenta no encontrada</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => onProcess(r)}
                      disabled={!r.cuenta_retiro}
                      className="px-3 py-1.5 bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium rounded-lg shadow-sm transition-colors disabled:opacity-50"
                    >
                      Procesar
                    </button>
                    <button
                      onClick={() => onReject(r.id)}
                      className="px-3 py-1.5 bg-destructive/10 text-destructive hover:bg-destructive/20 text-sm font-medium rounded-lg shadow-sm transition-colors"
                      title="Rechazar y devolver dinero"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
