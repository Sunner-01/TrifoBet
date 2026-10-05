import { CheckCircle, XCircle, Clock } from 'lucide-react';

export const ESTADO_COLORS: Record<string, string> = {
  pendiente: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
  aprobado: 'bg-green-500/10 text-green-400 border border-green-500/20',
  rechazado: 'bg-red-500/10 text-red-400 border border-red-500/20',
};

export function EstadoBadge({ estado }: { estado: string }) {
  const icon = estado === 'aprobado' ? <CheckCircle size={11} /> : estado === 'rechazado' ? <XCircle size={11} /> : <Clock size={11} />;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${ESTADO_COLORS[estado] || ''}`}>
      {icon} {estado}
    </span>
  );
}
