export const fmtBetId = (id: number | string) => `TRF-${String(id).padStart(8, '0')}`;

export const statusConfig: Record<string, { label: string; className: string }> = {
  pendiente: { label: 'Pendiente', className: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30' },
  ganada: { label: 'Ganada', className: 'bg-green-500/10  text-green-400  border border-green-500/30' },
  perdida: { label: 'Perdida', className: 'bg-red-500/10    text-red-400    border border-red-500/30' },
  cashout: { label: 'Cashout', className: 'bg-blue-500/10   text-blue-400   border border-blue-500/30' },
  cancelada: { label: 'Cancelada', className: 'bg-muted/30      text-muted-foreground border border-border' },
};

export const tipoConfig: Record<string, string> = {
  simple: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30',
  combinada: 'bg-purple-500/10 text-purple-400 border border-purple-500/30',
  sistema: 'bg-cyan-500/10   text-cyan-400   border border-cyan-500/30',
};
