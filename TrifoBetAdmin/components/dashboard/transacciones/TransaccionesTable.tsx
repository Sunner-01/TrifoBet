import { Loader2, FileText, ArrowDownRight, ArrowUpLeft } from 'lucide-react';
import { Transaccion, statusStyles, typeColors } from '@/hooks/useTransacciones';

interface TransaccionesTableProps {
  transactions: Transaccion[];
  loading: boolean;
}

export default function TransaccionesTable({ transactions, loading }: TransaccionesTableProps) {
  const formatId = (id: number) => `TRF-${id.toString().padStart(8, '0')}`;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-muted/50 border-b border-border">
          <tr>
            <th className="px-4 py-3 text-sm font-semibold text-foreground whitespace-nowrap">ID Transacción</th>
            <th className="px-4 py-3 text-sm font-semibold text-foreground">Fecha</th>
            <th className="px-4 py-3 text-sm font-semibold text-foreground">Usuario</th>
            <th className="px-4 py-3 text-sm font-semibold text-foreground">Tipo</th>
            <th className="px-4 py-3 text-right text-sm font-semibold text-foreground">Monto</th>
            <th className="px-4 py-3 text-sm font-semibold text-foreground">Concepto</th>
            <th className="px-4 py-3 text-center text-sm font-semibold text-foreground">Estado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {loading ? (
            <tr>
              <td colSpan={7} className="px-4 py-12 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Cargando transacciones...</p>
              </td>
            </tr>
          ) : transactions.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-4 py-12 text-center">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground font-medium">No se encontraron transacciones</p>
                <p className="text-sm text-muted-foreground mt-1">Intenta con otros filtros de búsqueda</p>
              </td>
            </tr>
          ) : (
            transactions.map((t) => (
              <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 text-sm font-mono font-medium text-foreground">
                  {formatId(t.id)}
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                  {new Date(t.fecha_creacion).toLocaleString('es-BO')}
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm font-medium text-foreground">{t.usuario?.nombre_usuario || 'Desconocido'}</p>
                  <p className="text-xs text-muted-foreground">{t.usuario?.nombre} {t.usuario?.apellido1}</p>
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex items-center gap-2">
                    {t.tipo === 'deposito' || t.tipo === 'ganancia' ? (
                      <ArrowDownRight className={typeColors[t.tipo] || 'text-muted-foreground'} size={16} />
                    ) : (
                      <ArrowUpLeft className={typeColors[t.tipo] || 'text-muted-foreground'} size={16} />
                    )}
                    <span className={`capitalize ${typeColors[t.tipo] || 'text-muted-foreground'} font-medium`}>
                      {t.tipo === 'deposito' ? 'Recarga' : t.tipo === 'ganancia' ? 'Abono Ganancia' : t.tipo}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-right text-foreground font-bold">
                  Bs {t.monto.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {t.descripcion}
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                      statusStyles[t.estado] || statusStyles.pendiente
                    }`}
                  >
                    {t.estado}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
